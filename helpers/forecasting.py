import json
from pathlib import Path
from datetime import timedelta
from helpers.trainProphet import forecast
from helpers.dates import get_oldest, get_newest, str_to_date

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