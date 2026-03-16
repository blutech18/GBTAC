from routers import *
import pandas as pd
from pathlib import Path 

router = APIRouter(prefix="/graphs")

def load_natural_gas():
    csv_path = Path("data/natural_gas.csv")
    df = pd.read_csv(csv_path)

    # show actual column names in terminal
    print("CSV columns:", df.columns.tolist())

    # remove extra spaces from headers
    df.columns = df.columns.str.strip()

    # use the real client column names
    date_col = df.columns[0]
    usage_col = df.columns[2]

    df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    df[usage_col] = pd.to_numeric(df[usage_col], errors="coerce")

    df = df.dropna(subset=[date_col, usage_col])

    # convert GJ to kWh
    df["kwh"] = df[usage_col] * 277.777778

    # month key
    df["month"] = df[date_col].dt.strftime("%Y-%m")

    monthly = df.groupby("month", as_index=False)["kwh"].sum()
    return monthly

# url format "http://127.0.0.1:8000/graphs/data/{sensor code}?start={start date}&end={end date}"
# example url: http://127.0.0.1:8000/graphs/data/20000_TL92?start=2025-06-13&end=2025-06-14
# code is the end part of the sensor name (not including the 'SaitSolarLab' part)
# start and end date are optional, currently start defaults to dec 31st 2025 and end defaults to start
@router.get("/data/{sensor_code}")
async def get_data(sensor_code, start="2025-12-31", end=""):

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
    return res

@router.get("/natural-gas-vs/{sensor_code}")
async def natural_gas_vs(sensor_code, start="2023-01-01", end=""):

    # open connection
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    # if no end date, use start
    if end == "":
        end = start

    # Load and filter natural gas CSV
    gas_df = load_natural_gas()

    start_month = pd.to_datetime(start).strftime("%Y-%m")
    end_month = pd.to_datetime(end).strftime("%Y-%m")

    gas_df = gas_df[(gas_df["month"] >= start_month) & (gas_df["month"] <= end_month)]

    gas_lookup = {
        row["month"]: round(float(row["kwh"]), 2)
        for _, row in gas_df.iterrows()
    }

    # Query SQL sensor monthly average
    query = f"""
        SELECT 
            FORMAT(ts, 'yyyy-MM') AS month,
            SUM(ABS(CAST({sensor_pre}{sensor_code} AS FLOAT)) / 12000.0) AS monthly_value
        FROM GBTAC_data
        WHERE {sensor_pre}{sensor_code} IS NOT NULL
        AND CAST(ts AS DATE) >= '{start}'
        AND CAST(ts AS DATE) <= '{end}'
        GROUP BY FORMAT(ts, 'yyyy-MM')
        ORDER BY month
    """

    curs.execute(query)
    rows = curs.fetchall()

    sensor_lookup = {
        row[0]: round(float(row[1]), 2)
        for row in rows if row[1] is not None
    }

    # Merge months from both series
    all_months = sorted(set(gas_lookup.keys()) | set(sensor_lookup.keys()))

    res = []
    for month in all_months:
        natural_gas = gas_lookup.get(month, 0)
        electricity = sensor_lookup.get(month, 0)

        res.append({
            "month": month,
            "natural_gas_kwh": natural_gas,
            "electricity_kwh": electricity,
            "total_energy_kwh": round(natural_gas + electricity, 2)
        })

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