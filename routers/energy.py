from routers import *
router = APIRouter(prefix="/energy")

@router.get("/panelTotals")
async def get_data(start="2025-12-31", end=""):

    sensors = [
        "30000_TL252",
        "30000_TL253",
    ]

    temp_str = ""
    for sensor in sensors:
        temp_str += "SUM(" + sensor_pre + sensor + "), "
    select_str = temp_str[:-2]

    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    # date format = YYYY-MM-DD
    # sets end date range to the same day as start if it wasn't included
    if end == "":
        end = start

    query = f"""
        SELECT {select_str}
        FROM GBTAC_data 
        WHERE CAST(ts AS DATE) >= '{start}'
        AND CAST(ts AS DATE) <= '{end}'
        """

    #query database
    curs.execute(query)
    rows = curs.fetchall()

    res = []
    counter = 0
    for row in rows:
        for sum in row:
            res.append({
                "code": sensors[counter],
                "sum": sum 
            })
            counter += 1

    #close connection and send data
    conn.close()
    return res