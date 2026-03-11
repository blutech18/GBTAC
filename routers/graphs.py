from routers import *
from datetime import datetime

router = APIRouter(prefix="/graphs")

# Adaptive aggregation per client spec:
#   Yearly  → x-axis: 2020, 2021, ...
#   Monthly → x-axis: January, February, ...
#   Daily   → x-axis: 1, 2, ... 31
#   Hourly  → x-axis: 0, 1, ... 23
#   Minute data in system is every 15 minutes (same-day range)
@router.get("/data/{sensor_code}")
async def get_data(sensor_code, start="2018-10-13", end="2025-12-31"):

    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    if end == "":
        end = start

    # Normalise and compute span in days
    try:
        start_dt = datetime.strptime(start, "%Y-%m-%d")
        end_dt = datetime.strptime(end, "%Y-%m-%d")
        days = (end_dt - start_dt).days + 1
    except Exception:
        # Fallback: treat as single day
        start_dt = end_dt = None
        days = 1

    col = f"{sensor_pre}{sensor_code}"

    if end == start:
        # 15-minute buckets for a single day (minute data is every 15 minutes)
        # Keep timestamps at exact 15-minute boundaries so the frontend can still show hourly ticks (0..23).
        query = f"""
            SELECT DATEADD(minute, (DATEDIFF(minute, 0, ts) / 15) * 15, 0) AS ts,
                   AVG({col}) AS data
            FROM GBTAC_data
            WHERE {col} IS NOT NULL
              AND CAST(ts AS DATE) = '{start}'
            GROUP BY DATEADD(minute, (DATEDIFF(minute, 0, ts) / 15) * 15, 0)
            ORDER BY ts
        """
    elif days <= 1:
        # Hourly averages for up to one day (x-axis: 0..23)
        query = f"""
            SELECT DATEADD(hour, DATEDIFF(hour, 0, ts), 0) AS ts,
                   AVG({col}) AS data
            FROM GBTAC_data
            WHERE {col} IS NOT NULL
              AND CAST(ts AS DATE) >= '{start}'
              AND CAST(ts AS DATE) <= '{end}'
            GROUP BY DATEADD(hour, DATEDIFF(hour, 0, ts), 0)
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
async def get_name(sensor_code: str):
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = """
        SELECT sensor_description
        FROM dbo.sensor_names
        WHERE sensor_name_source = ?
    """

    full_sensor_code = f"{sensor_pre}{sensor_code}"

    curs.execute(query, (sensor_code,))
    row = curs.fetchone()

    if not row:
        curs.execute(query, (full_sensor_code,))
        row = curs.fetchone()

    conn.close()

    if not row:
        return sensor_code

    return row[0]
