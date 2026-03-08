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


# Wall sensors = same data as ambient (client: "yung data na ginamit sa ambient, same lang sa wall").
# Returns sensors where display name contains 'FTH' and column exists in GBTAC_data (e.g. 24 sensors).
# If your DB uses sensor_name_report, add a view or use sensor_name_display for the FTH tag.
@router.get("/sensors/wall")
async def get_wall_sensors():
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()
    # Sensors with display name containing 'FTH' (client's 24 wall sensors, same data as ambient).
    # If your DB uses sensor_name_report, add a view or column alias as sensor_name_display.
    query = """
        SELECT sn.sensor_name_source, sn.sensor_name_display
        FROM sensor_names sn
        WHERE sn.sensor_name_display LIKE '%FTH%'
        AND EXISTS (
            SELECT 1 FROM sys.columns c
            WHERE c.object_id = OBJECT_ID('GBTAC_data')
            AND c.name = 'SaitSolarLab_' + sn.sensor_name_source
        )
        ORDER BY sn.sensor_name_display
    """
    try:
        curs.execute(query)
        rows = curs.fetchall()
        out = [
            {"code": row[0], "name": row[1] if len(row) > 1 else row[0]}
            for row in rows
        ]
        return out
    except Exception as e:
        return []
    finally:
        conn.close()