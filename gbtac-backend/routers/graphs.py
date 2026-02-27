from routers import *
from datetime import datetime

router = APIRouter(prefix="/graphs")


# Adaptive aggregation per client spec:
#   > 730 days  → yearly averages   (x-axis: 2020, 2021, ...)
#   > 60  days  → monthly averages  (x-axis: Jan, Feb, ...)
#   > 1   day   → daily averages    (x-axis: 1, 2, ... 31)
#   > 0   day   → hourly averages   (x-axis: 0, 1, ... 23)
#   same day    → per-minute        (x-axis: 0, 1, ... 59)
@router.get("/data/{sensor_code}")
async def get_data(sensor_code, start="2018-10-13", end="2025-12-31"):

    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    if end == "":
        end = start

    try:
        days = (datetime.strptime(end, "%Y-%m-%d") - datetime.strptime(start, "%Y-%m-%d")).days + 1
    except Exception:
        days = 1

    col = f"{sensor_pre}{sensor_code}"

    if days <= 1:
        # Per-minute readings for a single day
        query = f"""
            SELECT DATEADD(minute, DATEDIFF(minute, 0, ts), 0) AS ts,
                   AVG({col}) AS data
            FROM GBTAC_data
            WHERE {col} IS NOT NULL
              AND CAST(ts AS DATE) >= '{start}'
              AND CAST(ts AS DATE) <= '{end}'
            GROUP BY DATEADD(minute, DATEDIFF(minute, 0, ts), 0)
            ORDER BY ts
        """
    elif days <= 60:
        # Daily averages — x-axis: day numbers 1..31
        query = f"""
            SELECT CAST(ts AS DATE) AS ts,
                   AVG({col}) AS data
            FROM GBTAC_data
            WHERE {col} IS NOT NULL
              AND CAST(ts AS DATE) >= '{start}'
              AND CAST(ts AS DATE) <= '{end}'
            GROUP BY CAST(ts AS DATE)
            ORDER BY ts
        """
    elif days <= 730:
        # Monthly averages — x-axis: January, February, ...
        query = f"""
            SELECT DATEADD(month, DATEDIFF(month, 0, ts), 0) AS ts,
                   AVG({col}) AS data
            FROM GBTAC_data
            WHERE {col} IS NOT NULL
              AND CAST(ts AS DATE) >= '{start}'
              AND CAST(ts AS DATE) <= '{end}'
            GROUP BY DATEADD(month, DATEDIFF(month, 0, ts), 0)
            ORDER BY ts
        """
    else:
        # Yearly averages — x-axis: 2020, 2021, ...
        query = f"""
            SELECT DATEFROMPARTS(YEAR(ts), 1, 1) AS ts,
                   AVG({col}) AS data
            FROM GBTAC_data
            WHERE {col} IS NOT NULL
              AND CAST(ts AS DATE) >= '{start}'
              AND CAST(ts AS DATE) <= '{end}'
            GROUP BY YEAR(ts)
            ORDER BY ts
        """

    curs.execute(query)
    rows = curs.fetchall()

    res = [{"ts": row[0], "data": row[1]} for row in rows]

    conn.close()
    return res


# url format: "http://127.0.0.1:8000/graphs/name/{sensor code}"
# example url: http://127.0.0.1:8000/graphs/name/20000_TL92
@router.get("/name/{sensor_code}")
async def get_name(sensor_code):

    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = f"""
        SELECT * FROM sensor_names
        WHERE sensor_name_source = '{sensor_code}'
        """    

    #query database
    curs.execute(query)
    rows = curs.fetchall()

    res = rows[0][2]
    return res