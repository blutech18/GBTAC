from routers import *
import pandas as pd

router = APIRouter(prefix="/graphs")

@router.get("/data/{sensor_code}")
# url format "http://127.0.0.1:8000/graphs/data/{sensor code}?start={start date}&end={end date}&agg={aggregation time range}&type={aggregation type}"
# example url: http://127.0.0.1:8000/graphs/data/20000_TL92?start=2025-06-13&end=2025-06-14
# - code is the end part of the sensor name (not including the 'SaitSolarLab' part), mandatory
# - start and end date, YYYY-MM-DD
# - agg is the time range, H for hourly, D for daily, W for weekly, M for monthly, Y for yearly
# - type is for kind of aggregation, mean or sum
async def get_data(sensor_code, start="2025-12-31", end="", agg="none", type="mean"):

    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    # date format = YYYY-MM-DD
    # sets end date range to the same day as start if it wasn't included
    if end == "":
        end = start

    query = f"""
        SELECT ts, {sensor_pre}{sensor_code}
        FROM GBTAC_data 
        WHERE {sensor_pre}{sensor_code} IS NOT NULL 
        AND CAST(ts AS DATE) >= '{start}'
        AND CAST(ts AS DATE) <= '{end}'
        ORDER BY ts
        """

    #query database
    curs.execute(query)
    rows = curs.fetchall()

    #format data 
    res = []
    for row in rows:
        res.append({
            "ts": row[0],
            "data": row[1]
        })

    #close connection and send data
    conn.close()

    if agg != "none":
        df = pd.DataFrame(res)
        df["ts"] = pd.to_datetime(df["ts"])
        df = df.set_index("ts")

        if type == "mean":
            df_agg = df.resample(agg).mean()
        else:
            df_agg = df.resample(agg).sum()
            
        df_agg = df_agg.dropna()
        res = df_agg.reset_index().to_dict(orient="records")

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
    conn.close()
    return res

@router.get("/codesnames")
async def get_codesnames():
    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = """
        SELECT sensor_name_source, sensor_name_report 
        FROM sensor_names
        ORDER BY sensor_name_source
        """ 

    #query database
    curs.execute(query)
    rows = curs.fetchall()

    res = []
    for row in rows:
        res.append({
            "code": row[0],
            "name": row[1]
        })

    conn.close()
    return res