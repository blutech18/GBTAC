from fastapi import FastAPI
import pyodbc
from fastapi.middleware.cors import CORSMiddleware

# connection details
server = 'KieraJ_Laptop' 
database = 'gbtac_db'
driver_name = '{ODBC Driver 17 for SQL Server}'
connection_str = f'DRIVER={driver_name};SERVER={server};DATABASE={database};Trusted_Connection=Yes;Encrypt=no;'

# create app and allow access from different origins
app = FastAPI()
app.add_middleware( CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"], )


@app.get("/data/{sensor_code}")
# url format "http://127.0.0.1:8000/data/{sensor code}?start={start date}&end={end date}"

# code is the end part of the sensor name (not including the 'SaitSolarLab' part)
# start and end date are optional, currently start defaults to dec 31st 2025 and end defaults to start

# example url: http://127.0.0.1:8000/data/20000_TL92?start=2025-06-13&end=2025-06-14
async def get_data(sensor_code, start="2025-12-31", end=""):

    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    # date format = YYYY-MM-DD
    # sets end date range to the same day as start if it wasn't included
    if end == "":
        end = start

    sensor_pre = "SaitSolarLab_"

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
    return res

@app.get("/name/{sensor_code}")
# url format: "http://127.0.0.1:8000/name/{sensor code}"
# example url: http://127.0.0.1:8000/name/20000_TL92
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


# to run: uvicorn main:app --reload