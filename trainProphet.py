from routers import *
import pandas as pd
from prophet import Prophet

conn = pyodbc.connect(connection_str)
curs = conn.cursor()

query = f"""
    SELECT ts, SaitSolarLab_30000_TL252
    FROM GBTAC_data 
    WHERE SaitSolarLab_30000_TL252 IS NOT NULL
    AND CAST(ts AS DATE) >= '2025-01-01'
    AND CAST(ts AS DATE) <= '2025-02-01'
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

model = Prophet()
model.fit(df)
future = model.make_future_dataframe(periods=10)
forecast = model.predict(future)

out = forecast[['ds', 'yhat']].rename(columns={
    "ds": "ts",
    "yhat": "data"
})

out.to_json("forecast.json", orient="records", date_format="iso")