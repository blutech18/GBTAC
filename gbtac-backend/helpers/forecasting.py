import json
from pathlib import Path
from datetime import timedelta
from helpers.dates import get_oldest, get_newest, str_to_date
import pandas as pd
from prophet import Prophet
import pyodbc
from config import connection_str

NEWEST = str_to_date(get_newest())
OLDEST = str_to_date(get_oldest())

def useable_forecast(file_path):
    if not file_path.is_file():
        return False
    
    with open(file_path, 'r') as f:
        data = json.load(f)

    most_recent = data[-1]["ts"]
    most_recent = str_to_date(most_recent)
    if most_recent > NEWEST + timedelta(days=7):
        return True
    
    return False
    

async def get_forecast(sensor_code, start=NEWEST, end=""):

    #forecasting
    forecasts_dir = Path(__file__).resolve().parent.parent / "forecasts"
    file_path = forecasts_dir / f"{sensor_code}.json"

    # forecast if forecast wasn't available
    forecast_bool = useable_forecast(file_path)
    if not forecast_bool:
        forecast(sensor_code)

    with open(file_path, 'r') as f:
        data = json.load(f)

    filtered = [
        row for row in data
        if str_to_date(start) <= str_to_date(row["ts"]) <= str_to_date(end)
    ]

    return filtered


def forecast(sensor_code):
    conn = pyodbc.connect(connection_str)
    curs = conn.cursor()

    query = f"""
        SELECT ts, SaitSolarLab_{sensor_code}
        FROM GBTAC_data 
        WHERE SaitSolarLab_{sensor_code} IS NOT NULL
        ORDER BY ts
        """    

    #query database
    curs.execute(query)
    rows = curs.fetchall()

    res = []
    for row in rows:
        res.append({
            "timestamp": row[0],
            "value": row[1]
        })

    conn.close()

    df = pd.DataFrame(res)

    df = df.rename(columns={
        "timestamp": "ds",
        "value": "y"
    })

    df["ds"] = pd.to_datetime(df["ds"])

    # Infer the sensor's native frequency from the median gap between readings.
    # This handles any interval (1min, 5min, hourly, daily, etc.) automatically.
    deltas = df["ds"].diff().dropna()
    freq_seconds = int(deltas.median().total_seconds())
 
    # Map to a pandas frequency string Prophet can use.
    # Fall back to the raw second offset if no named alias fits.
    freq_map = {
        1:     "s",
        60:    "min",
        300:   "5min",
        600:   "10min",
        900:   "15min",
        1800:  "30min",
        3600:  "h",
        86400: "D",
    }
    freq = freq_map.get(freq_seconds, f"{freq_seconds}s")
 
    # Always forecast exactly 10 days ahead regardless of sensor resolution
    periods = int((10 * 86400) / freq_seconds)


    model = Prophet()
    model.fit(df)

    future = model.make_future_dataframe(periods=periods, freq=freq)
    forecast = model.predict(future)

    last_actual = df["ds"].max()
    forecast_new = forecast[forecast["ds"] > last_actual]

    out = forecast_new[['ds', 'yhat']].rename(columns={
        "ds": "ts",
        "yhat": "data"
    })

    forecasts_dir = Path(__file__).resolve().parent.parent / "forecasts"
    forecasts_dir.mkdir(exist_ok=True)
    out.to_json(forecasts_dir / f"{sensor_code}.json", orient="records", date_format="iso")