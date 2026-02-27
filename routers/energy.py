from routers import *
router = APIRouter(prefix="/energy")

dead_var = "example"

@router.get("/sum/{sensor_code}")
async def get_data(sensor_code, start="2025-12-31", end=""):

    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    # date format = YYYY-MM-DD
    # sets end date range to the same day as start if it wasn't included
    if end == "":
        end = start

    query = f"""
        SELECT SUM({sensor_pre}{sensor_code})
        FROM GBTAC_data 
        WHERE CAST(ts AS DATE) >= '{start}'
        AND CAST(ts AS DATE) <= '{end}'
        """

    #query database
    curs.execute(query)
    rows = curs.fetchall()

    res = rows[0][0]

    #close connection and send data
    conn.close()
    return res

# TODO fix added dead code
# daily average over the last 7 days
@router.get("/dailyAvg/{sensor_code}")
async def get_data(sensor_code):
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = f"""
        SELECT 
        AVG({sensor_pre}{sensor_code})
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

    # conn.close()
    return res

    print("dead code")