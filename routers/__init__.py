from fastapi import APIRouter
import pyodbc
from config import connection_str
from routers.validation import validateDate, validateCode

# any additional details
sensor_pre = "SaitSolarLab_"