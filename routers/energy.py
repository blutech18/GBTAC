from routers import *
from helpers.rate_limit import limiter
from fastapi import APIRouter, Request

router = APIRouter(prefix="/energy")

@router.get("/sum/{sensor_code}")
@limiter.limit("10/minute")
async def get_data(request: Request, sensor_code, start=NEWEST, end=""):

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
        return "end date cannot be earlier than start date"
    
    column_name = f"{SENSOR_PRE}{san_code}"

    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = f"""
        SELECT SUM({column_name})
        FROM GBTAC_data
        WHERE CAST(ts AS DATE) >= ?
        AND CAST(ts AS DATE) <= ?
    """

    #query database
    curs.execute(query, (san_start, san_end))
    rows = curs.fetchall()

    res = rows[0][0]

    #close connection and send data
    conn.close()
    return res


# daily average over the last 7 days
@router.get("/dailyAvg/{sensor_code}")
@limiter.limit("20/minute")
async def get_daily_avg(request: Request, sensor_code):
    
    # validation
    san_code = validateCode(sensor_code)
    if san_code == False:
        return "enter valid sensor code"
    
    column_name = f"{SENSOR_PRE}{san_code}"
    
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = f"""
        SELECT 
        AVG({column_name})
        FROM gbtac_data
        WHERE ts >= (
            SELECT DATEADD(day, -7, MAX(ts))
            FROM GBTAC_data
        )
        AND ts <= (
            SELECT MAX(ts)
            FROM GBTAC_data
        );
    """

    #query database
    curs.execute(query)
    rows = curs.fetchall()

    res = rows[0][0]

    conn.close()
    return res
