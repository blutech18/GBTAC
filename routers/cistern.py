from fastapi import APIRouter, HTTPException
import pyodbc 

from config import connection_str

router = APIRouter(prefix="/cistern", tags=["cistern"])

SENSOR_PREFIX = "SaitSolarLab_"

@router.get("/water-level")
async def get_cistern_water_level(start: str = "2025-12-31", end: str = ""):
    # Rain Water Level sensor (20000_TL93)
    sensor_code = "20000_TL93"
    col = f"{SENSOR_PREFIX}{sensor_code}"

    if end == "":
        end = start

    query = f"""
        SELECT ts, [{col}] AS water_level
        FROM dbo.GBTAC_data
        WHERE [{col}] IS NOT NULL
          AND CAST(ts AS DATE) >= ?
          AND CAST(ts AS DATE) <= ?
        ORDER BY ts ASC;
    """

    try:
        conn = pyodbc.connect(connection_str)
        curs = conn.cursor()
        curs.execute(query, (start, end))
        rows = curs.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            conn.close()
        except:
            pass

    return [{"ts": row[0].isoformat(), "data": float(row[1]) if row[1] is not None else None} for row in rows]