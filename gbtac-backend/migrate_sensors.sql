-- ============================================================
-- GBTAC Migration: Add real wall/ambient temperature sensors
-- Sensors 20004-20016 from building floor plans
-- Run with: sqlcmd -S "localhost\SQLEXPRESS" -E -i "migrate_sensors.sql"
-- ============================================================

USE gbtac_db;
GO

-- ============================================================
-- Add real sensor columns to GBTAC_data
-- ============================================================

-- Basement sensors
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20004')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20004 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20005')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20005 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20006')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20006 FLOAT NULL;

-- 1st Floor sensors
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20007')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20007 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20008')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20008 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20009')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20009 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20010')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20010 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20011')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20011 FLOAT NULL;

-- 2nd Floor sensors
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20012')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20012 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20013')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20013 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20014')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20014 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20015')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20015 FLOAT NULL;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('GBTAC_data') AND name = 'SaitSolarLab_20016')
    ALTER TABLE GBTAC_data ADD SaitSolarLab_20016 FLOAT NULL;

PRINT 'Sensor columns added to GBTAC_data.';
GO

-- ============================================================
-- Add sensor display names (based on floor plan positions)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sensor_names WHERE sensor_name_source = '20004')
BEGIN
    INSERT INTO sensor_names (sensor_name_source, sensor_name_display) VALUES
    -- Basement
    ('20004', 'Basement - North Wall'),
    ('20005', 'Basement - West Wall'),
    ('20006', 'Basement - South Wall'),
    -- 1st Floor
    ('20007', '1st Floor - West Wall'),
    ('20008', '1st Floor - South Wall (West)'),
    ('20009', '1st Floor - South Wall (East)'),
    ('20010', '1st Floor - East Wall'),
    ('20011', '1st Floor - North Wall'),
    -- 2nd Floor
    ('20012', '2nd Floor - West Wall'),
    ('20013', '2nd Floor - North Wall'),
    ('20014', '2nd Floor - East Wall'),
    ('20015', '2nd Floor - South Wall (East)'),
    ('20016', '2nd Floor - South Wall (West)');
    PRINT 'Wall sensor names seeded.';
END
ELSE
    PRINT 'Wall sensor names already exist, skipping.';
GO

-- ============================================================
-- Seed sample data for new sensors into existing rows
-- ============================================================
UPDATE GBTAC_data SET
    SaitSolarLab_20004 = 18.5 + (id * 0.1),
    SaitSolarLab_20005 = 17.8 + (id * 0.1),
    SaitSolarLab_20006 = 19.2 + (id * 0.1),
    SaitSolarLab_20007 = 21.0 + (id * 0.1),
    SaitSolarLab_20008 = 20.5 + (id * 0.1),
    SaitSolarLab_20009 = 21.3 + (id * 0.1),
    SaitSolarLab_20010 = 22.1 + (id * 0.1),
    SaitSolarLab_20011 = 20.8 + (id * 0.1),
    SaitSolarLab_20012 = 19.6 + (id * 0.1),
    SaitSolarLab_20013 = 18.9 + (id * 0.1),
    SaitSolarLab_20014 = 20.2 + (id * 0.1),
    SaitSolarLab_20015 = 19.8 + (id * 0.1),
    SaitSolarLab_20016 = 18.7 + (id * 0.1)
WHERE SaitSolarLab_20004 IS NULL;

PRINT 'Sample data seeded for new sensors.';
GO

PRINT '';
PRINT '========================================';
PRINT 'Migration complete!';
PRINT 'Sensors 20004-20016 ready in gbtac_db';
PRINT '========================================';
