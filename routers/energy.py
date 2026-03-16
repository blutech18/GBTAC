from routers import *
router = APIRouter(prefix="/energy")

@router.get("/sum/{sensor_code}")
async def get_data(sensor_code, start="2025-12-31", end=""):

    #validation:
    sanCode = validateCode(sensor_code)
    if sanCode == False:
        return "enter valid sensor code"

    sanStart = validateDate(start)
    if sanStart == False:
        return "invalid start date"
    
    # sets end date range to the same day as start if it wasn't included
    if end == "":
        end = sanStart
    
    sanEnd = validateDate(end)
    if sanEnd == False:
        return "invalid end date"
    
    if sanEnd < sanStart:
        return "end date cannot be earlier than start date"
    
    column_name = f"{sensor_pre}{sanCode}"

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
    curs.execute(query, (sanStart, sanEnd))
    rows = curs.fetchall()

    res = rows[0][0]

    #close connection and send data
    conn.close()
    return res


# daily average over the last 7 days
@router.get("/dailyAvg/{sensor_code}")
async def get_daily_avg(sensor_code):
    
    # validation
    sanCode = validateCode(sensor_code)
    if sanCode == False:
        return "enter valid sensor code"
    
    column_name = f"{sensor_pre}{sanCode}"
    
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
