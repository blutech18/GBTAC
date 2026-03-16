import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
from helpers.trainProphet import forecast
from helpers.validation import validateDate, validateCode
from helpers.dates import get_oldest, get_newest, str_to_date, date_to_str

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
        return "end cannot be bigger than start"


    #forecasting
    forecasts_dir = Path(__file__).resolve().parent.parent / "forecasts"
    file_path = forecasts_dir / f"{san_code}.json"

    # forecast if forecast wasn't available
    forecast_bool = useable_forecast(file_path)
    if not forecast_bool:
        forecast(san_code)

    with open(file_path, 'r') as f:
        data = json.load(f)

    filtered = [
        row for row in data
        if str_to_date(san_start) <= str_to_date(row["ts"]) <= str_to_date(san_end)
    ]

    return filtered