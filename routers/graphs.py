from routers import *
import pandas as pd
from helpers.forecasting import get_forecast

router = APIRouter(prefix="/graphs")

@router.get("/data/{sensor_code}")
# url format "http://127.0.0.1:8000/graphs/data/{sensor code}?start={start date}&end={end date}&agg={aggregation time range}&type={aggregation type}"
# example url: http://127.0.0.1:8000/graphs/data/20000_TL92?start=2025-06-13&end=2025-06-14
# - code is the end part of the sensor name (not including the 'SaitSolarLab' part), mandatory
# - start and end date, YYYY-MM-DD
# - agg is the time range, H for hourly, D for daily, W for weekly, M for monthly, Y for yearly
# - type is for kind of aggregation, mean or sum
async def get_data(sensor_code, start=NEWEST, end="", agg="none", type="mean"):
    
    #validation:
    san_code = validateCode(sensor_code)
    if san_code == False:
        return "enter valid sensor code"

    san_start = validateDate(start)
    if san_start == False:
        return "invalid start date"
    
    # sets end date range to the same day as start if it wasn't included
    if end == "":
        end = san_start
    
    san_end = validateDate(end)
    if san_end == False:
        return "invalid end date"
    
    if san_end < san_start:
        return "end cannot be bigger than start"


    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = f"""
        SELECT ts, {SENSOR_PRE}{san_code}
        FROM GBTAC_data 
        WHERE {SENSOR_PRE}{san_code} IS NOT NULL 
        AND CAST(ts AS DATE) >= '{san_start}'
        AND CAST(ts AS DATE) <= '{san_end}'
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


    conn.close()

    if res == []:
        return "no data found"
    
    # forecast data if end date is in the future
    if san_end > NEWEST:
        forecasted_data = await get_forecast(san_code, NEWEST, san_end)
        res = res + forecasted_data

    # aggregates data
    if agg != "none":
        df = pd.DataFrame(res)
        df = df.dropna()
        df["ts"] = pd.to_datetime(df["ts"])
        df = df.set_index("ts")

        if type == "mean":
            df_agg = df.resample(agg).mean()
        else:
            df_agg = df.resample(agg).sum()
            
        # df_agg = df_agg.dropna()
        res = df_agg.reset_index().to_dict(orient="records")

    return res


# url format: "http://127.0.0.1:8000/graphs/name/{sensor code}"
# example url: http://127.0.0.1:8000/graphs/name/20000_TL92
@router.get("/name/{sensor_code}")
async def get_name(sensor_code):

    # validation
    san_code = validateCode(sensor_code)
    if san_code == False:
        return "enter valid sensor code"

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

@router.get("/newest")
async def get_newest():
    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = """
        SELECT TOP 1 ts
        FROM GBTAC_data
        ORDER BY ts DESC;
        """ 

    #query database
    curs.execute(query)
    rows = curs.fetchall()

    conn.close()
    res = rows[0][0]

    return res.date()

@router.get("/oldest")
async def get_oldest():
    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = """
        SELECT TOP 1 ts
        FROM GBTAC_data
        ORDER BY ts asc;
        """ 

    #query database
    curs.execute(query)
    rows = curs.fetchall()

    conn.close()
    res = rows[0][0]

    return res.date()