from fastapi import APIRouter
import pyodbc

# connection details
server = 'KieraJ_Laptop' # change to match local server name
database = 'gbtac_db'
driver_name = '{ODBC Driver 17 for SQL Server}' # may have to change to match local version
connection_str = f'DRIVER={driver_name};SERVER={server};DATABASE={database};Trusted_Connection=Yes;Encrypt=no;'

# any additional details
sensor_pre = "SaitSolarLab_"