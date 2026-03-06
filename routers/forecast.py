from routers import *
import json
from pathlib import Path

router = APIRouter(prefix="/forecast")

@router.get("/")
async def forecast():

    file_path = Path(__file__).resolve().parent.parent / "forecast.json"
    with open(file_path) as f:
        data = json.load(f)

    return data