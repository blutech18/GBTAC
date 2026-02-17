from fastapi import APIRouter
import pyodbc
from config import connection_str

# any additional details
sensor_pre = "SaitSolarLab_"