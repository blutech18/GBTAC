-- ============================================================
-- GBTAC Migration: Apply real production schema
-- Drops old test table and recreates with real column names
-- Run with: sqlcmd -S "localhost\SQLEXPRESS" -E -i "migrate_real_schema.sql"
-- ============================================================

USE gbtac_db;
GO

-- Drop old test table (had fake columns like SaitSolarLab_20000_TL91 etc.)
IF OBJECT_ID('GBTAC_data', 'U') IS NOT NULL
    DROP TABLE GBTAC_data;
PRINT 'Old GBTAC_data dropped.';
GO

-- ============================================================
-- Recreate GBTAC_data with real production schema
-- ============================================================
CREATE TABLE GBTAC_data (
    ts                          DATETIME,
    -- Ambient temperature sensors
    SaitSolarLab_20000_TL92     FLOAT NULL,
    SaitSolarLab_20000_TL93     FLOAT NULL,
    -- Wall temperature sensors per floor (from building floor plans)
    SaitSolarLab_20003_TL2      FLOAT NULL,
    SaitSolarLab_20004_TL2      FLOAT NULL,
    SaitSolarLab_20005_TL2      FLOAT NULL,
    SaitSolarLab_20006_TL2      FLOAT NULL,
    SaitSolarLab_20007_TL2      FLOAT NULL,
    SaitSolarLab_20008_TL2      FLOAT NULL,
    SaitSolarLab_20009_TL2      FLOAT NULL,
    SaitSolarLab_20010_TL2      FLOAT NULL,
    SaitSolarLab_20011_TL2      FLOAT NULL,
    SaitSolarLab_20012_TL2      FLOAT NULL,
    SaitSolarLab_20013_TL2      FLOAT NULL,
    SaitSolarLab_20014_TL2      FLOAT NULL,
    SaitSolarLab_20015_TL2      FLOAT NULL,
    SaitSolarLab_20016_TL2      FLOAT NULL,
    SaitSolarLab_20016_TL5      FLOAT NULL,
    -- In-wall assembly thermocouples (30000 series)
    SaitSolarLab_30000_TL10     FLOAT NULL,
    SaitSolarLab_30000_TL108    FLOAT NULL,
    SaitSolarLab_30000_TL11     FLOAT NULL,
    SaitSolarLab_30000_TL12     FLOAT NULL,
    SaitSolarLab_30000_TL13     FLOAT NULL,
    SaitSolarLab_30000_TL14     FLOAT NULL,
    SaitSolarLab_30000_TL15     FLOAT NULL,
    SaitSolarLab_30000_TL16     FLOAT NULL,
    SaitSolarLab_30000_TL17     FLOAT NULL,
    SaitSolarLab_30000_TL18     FLOAT NULL,
    SaitSolarLab_30000_TL19     FLOAT NULL,
    SaitSolarLab_30000_TL2      FLOAT NULL,
    SaitSolarLab_30000_TL20     FLOAT NULL,
    SaitSolarLab_30000_TL207    FLOAT NULL,
    SaitSolarLab_30000_TL208    FLOAT NULL,
    SaitSolarLab_30000_TL209    FLOAT NULL,
    SaitSolarLab_30000_TL21     FLOAT NULL,
    SaitSolarLab_30000_TL210    FLOAT NULL,
    SaitSolarLab_30000_TL211    FLOAT NULL,
    SaitSolarLab_30000_TL212    FLOAT NULL,
    SaitSolarLab_30000_TL213    FLOAT NULL,
    SaitSolarLab_30000_TL22     FLOAT NULL,
    SaitSolarLab_30000_TL23     FLOAT NULL,
    SaitSolarLab_30000_TL24     FLOAT NULL,
    SaitSolarLab_30000_TL25     FLOAT NULL,
    SaitSolarLab_30000_TL252    FLOAT NULL,
    SaitSolarLab_30000_TL253    FLOAT NULL,
    SaitSolarLab_30000_TL26     FLOAT NULL,
    SaitSolarLab_30000_TL27     FLOAT NULL,
    SaitSolarLab_30000_TL28     FLOAT NULL,
    SaitSolarLab_30000_TL29     FLOAT NULL,
    SaitSolarLab_30000_TL3      FLOAT NULL,
    SaitSolarLab_30000_TL30     FLOAT NULL,
    SaitSolarLab_30000_TL31     FLOAT NULL,
    SaitSolarLab_30000_TL32     FLOAT NULL,
    SaitSolarLab_30000_TL33     FLOAT NULL,
    SaitSolarLab_30000_TL335    FLOAT NULL,
    SaitSolarLab_30000_TL336    FLOAT NULL,
    SaitSolarLab_30000_TL337    FLOAT NULL,
    SaitSolarLab_30000_TL338    FLOAT NULL,
    SaitSolarLab_30000_TL339    FLOAT NULL,
    SaitSolarLab_30000_TL34     FLOAT NULL,
    SaitSolarLab_30000_TL340    FLOAT NULL,
    SaitSolarLab_30000_TL341    FLOAT NULL,
    SaitSolarLab_30000_TL342    FLOAT NULL,
    SaitSolarLab_30000_TL343    FLOAT NULL,
    SaitSolarLab_30000_TL344    FLOAT NULL,
    SaitSolarLab_30000_TL345    FLOAT NULL,
    SaitSolarLab_30000_TL35     FLOAT NULL,
    SaitSolarLab_30000_TL36     FLOAT NULL,
    SaitSolarLab_30000_TL37     FLOAT NULL,
    SaitSolarLab_30000_TL38     FLOAT NULL,
    SaitSolarLab_30000_TL388    FLOAT NULL,
    SaitSolarLab_30000_TL39     FLOAT NULL,
    SaitSolarLab_30000_TL4      FLOAT NULL,
    SaitSolarLab_30000_TL40     FLOAT NULL,
    SaitSolarLab_30000_TL41     FLOAT NULL,
    SaitSolarLab_30000_TL42     FLOAT NULL,
    SaitSolarLab_30000_TL43     FLOAT NULL,
    SaitSolarLab_30000_TL44     FLOAT NULL,
    SaitSolarLab_30000_TL45     FLOAT NULL,
    SaitSolarLab_30000_TL46     FLOAT NULL,
    SaitSolarLab_30000_TL47     FLOAT NULL,
    SaitSolarLab_30000_TL48     FLOAT NULL,
    SaitSolarLab_30000_TL49     FLOAT NULL,
    SaitSolarLab_30000_TL50     FLOAT NULL,
    SaitSolarLab_30000_TL51     FLOAT NULL,
    SaitSolarLab_30000_TL52     FLOAT NULL,
    SaitSolarLab_30000_TL53     FLOAT NULL,
    SaitSolarLab_30000_TL54     FLOAT NULL,
    SaitSolarLab_30000_TL55     FLOAT NULL,
    SaitSolarLab_30000_TL56     FLOAT NULL,
    SaitSolarLab_30000_TL57     FLOAT NULL,
    SaitSolarLab_30000_TL58     FLOAT NULL,
    SaitSolarLab_30000_TL59     FLOAT NULL,
    SaitSolarLab_30000_TL60     FLOAT NULL,
    SaitSolarLab_30000_TL61     FLOAT NULL,
    SaitSolarLab_30000_TL62     FLOAT NULL,
    SaitSolarLab_30000_TL63     FLOAT NULL,
    SaitSolarLab_30000_TL64     FLOAT NULL,
    SaitSolarLab_30000_TL65     FLOAT NULL,
    SaitSolarLab_30000_TL66     FLOAT NULL,
    SaitSolarLab_30000_TL67     FLOAT NULL,
    SaitSolarLab_30000_TL68     FLOAT NULL,
    SaitSolarLab_30000_TL69     FLOAT NULL,
    SaitSolarLab_30000_TL70     FLOAT NULL,
    SaitSolarLab_30000_TL71     FLOAT NULL,
    SaitSolarLab_30000_TL75     FLOAT NULL,
    SaitSolarLab_30000_TL77     FLOAT NULL,
    SaitSolarLab_30000_TL78     FLOAT NULL,
    SaitSolarLab_30000_TL79     FLOAT NULL,
    SaitSolarLab_30000_TL8      FLOAT NULL,
    SaitSolarLab_30000_TL82     FLOAT NULL,
    SaitSolarLab_30000_TL83     FLOAT NULL,
    SaitSolarLab_30000_TL84     FLOAT NULL,
    SaitSolarLab_30000_TL85     FLOAT NULL,
    SaitSolarLab_30000_TL86     FLOAT NULL,
    SaitSolarLab_30000_TL87     FLOAT NULL,
    SaitSolarLab_30000_TL88     FLOAT NULL,
    SaitSolarLab_30000_TL89     FLOAT NULL,
    SaitSolarLab_30000_TL9      FLOAT NULL,
    SaitSolarLab_30000_TL90     FLOAT NULL,
    SaitSolarLab_30000_TL91     FLOAT NULL,
    SaitSolarLab_30000_TL92     FLOAT NULL,
    SaitSolarLab_30000_TL93     FLOAT NULL,
    SaitSolarLab_30000_TL94     FLOAT NULL,
    SaitSolarLab_30000_TL95     FLOAT NULL
);
PRINT 'GBTAC_data created with real schema.';
GO

-- ============================================================
-- Recreate sensor_names with real sensor codes
-- ============================================================
TRUNCATE TABLE sensor_names;
GO

INSERT INTO sensor_names (sensor_name_source, sensor_name_display) VALUES
-- Ambient temperature
('20000_TL92',  'Ambient Temperature - Zone 1'),
('20000_TL93',  'Ambient Temperature - Zone 2'),
-- Wall temperatures: Basement (floor plan)
('20003_TL2',   'Basement - Corridor Wall'),
('20004_TL2',   'Basement - North Wall'),
('20005_TL2',   'Basement - West Wall'),
('20006_TL2',   'Basement - South Wall'),
-- Wall temperatures: 1st Floor (floor plan)
('20007_TL2',   '1st Floor - West Wall'),
('20008_TL2',   '1st Floor - South Wall (West)'),
('20009_TL2',   '1st Floor - South Wall (East)'),
('20010_TL2',   '1st Floor - East Wall'),
('20011_TL2',   '1st Floor - North Wall'),
-- Wall temperatures: 2nd Floor (floor plan)
('20012_TL2',   '2nd Floor - West Wall'),
('20013_TL2',   '2nd Floor - North Wall'),
('20014_TL2',   '2nd Floor - East Wall'),
('20015_TL2',   '2nd Floor - South Wall (East)'),
('20016_TL2',   '2nd Floor - South Wall (West)'),
('20016_TL5',   '2nd Floor - Roof Sensor');
GO

PRINT 'sensor_names updated with real codes.';
PRINT '';
PRINT '========================================';
PRINT 'Real schema ready. Now run BULK INSERT:';
PRINT '  sqlcmd -S localhost\SQLEXPRESS -E -i gbtac_insert.sql';
PRINT '(Update the CSV path in gbtac_insert.sql first)';
PRINT '========================================';
