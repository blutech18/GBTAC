from routers import *
import pandas as pd
from prophet import Prophet
from pathlib import Path

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
    # df = df.sort_values("ds").reset_index(drop=True)

    # ----------------------------------------------

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

    # -----------------------------------------------------

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