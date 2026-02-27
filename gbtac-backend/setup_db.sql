-- ============================================================
-- GBTAC Database Setup Script
-- Run with: sqlcmd -S localhost\MSSQLSERVER01 -E -i setup_db.sql
-- ============================================================

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'gbtac_db')
BEGIN
    CREATE DATABASE gbtac_db;
    PRINT 'Database gbtac_db created.';
END
ELSE
    PRINT 'Database gbtac_db already exists.';
GO

USE gbtac_db;
GO

-- ============================================================
-- Table: GBTAC_data
-- Holds timestamped sensor readings.
-- Sensor columns follow the pattern: SaitSolarLab_{sensor_code}
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GBTAC_data' AND xtype='U')
BEGIN
    CREATE TABLE GBTAC_data (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        ts              DATETIME NOT NULL,

        -- Water Level sensors
        SaitSolarLab_20000_WL01     FLOAT NULL,
        SaitSolarLab_20000_WL02     FLOAT NULL,

        -- Energy sensors
        SaitSolarLab_20000_EN01     FLOAT NULL,
        SaitSolarLab_20000_EN02     FLOAT NULL,

        -- Ambient Temperature sensors
        SaitSolarLab_20000_TL91     FLOAT NULL,
        SaitSolarLab_20000_TL92     FLOAT NULL,
        SaitSolarLab_20000_TL93     FLOAT NULL,

        -- Wall Temperature sensors
        SaitSolarLab_20000_TW01     FLOAT NULL,
        SaitSolarLab_20000_TW02     FLOAT NULL,
        SaitSolarLab_20000_TW03     FLOAT NULL,

        -- Natural Gas sensors
        SaitSolarLab_20000_NG01     FLOAT NULL,
        SaitSolarLab_20000_NG02     FLOAT NULL
    );
    PRINT 'Table GBTAC_data created.';
END
ELSE
    PRINT 'Table GBTAC_data already exists.';
GO

-- ============================================================
-- Table: sensor_names
-- Maps sensor_code to a human-readable display name.
-- Columns: id, sensor_name_source, sensor_name_display
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sensor_names' AND xtype='U')
BEGIN
    CREATE TABLE sensor_names (
        id                   INT IDENTITY(1,1) PRIMARY KEY,
        sensor_name_source   VARCHAR(100) NOT NULL,   -- e.g. 20000_TL92
        sensor_name_display  VARCHAR(255) NOT NULL    -- e.g. Ambient Temperature Zone 2
    );
    PRINT 'Table sensor_names created.';
END
ELSE
    PRINT 'Table sensor_names already exists.';
GO

-- ============================================================
-- Seed: sensor_names
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sensor_names)
BEGIN
    INSERT INTO sensor_names (sensor_name_source, sensor_name_display) VALUES
    ('20000_WL01', 'Water Level Tank 1'),
    ('20000_WL02', 'Water Level Tank 2'),
    ('20000_EN01', 'Energy Meter 1'),
    ('20000_EN02', 'Energy Meter 2'),
    ('20000_TL91', 'Ambient Temperature Zone 1'),
    ('20000_TL92', 'Ambient Temperature Zone 2'),
    ('20000_TL93', 'Ambient Temperature Zone 3'),
    ('20000_TW01', 'Wall Temperature Panel 1'),
    ('20000_TW02', 'Wall Temperature Panel 2'),
    ('20000_TW03', 'Wall Temperature Panel 3'),
    ('20000_NG01', 'Natural Gas Meter 1'),
    ('20000_NG02', 'Natural Gas Meter 2');
    PRINT 'sensor_names seeded.';
END
ELSE
    PRINT 'sensor_names already has data, skipping seed.';
GO

-- ============================================================
-- Seed: GBTAC_data (sample readings for today)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM GBTAC_data)
BEGIN
    DECLARE @base DATETIME = '2026-02-26 08:00:00';
    DECLARE @i INT = 0;

    WHILE @i < 24
    BEGIN
        INSERT INTO GBTAC_data (
            ts,
            SaitSolarLab_20000_WL01, SaitSolarLab_20000_WL02,
            SaitSolarLab_20000_EN01, SaitSolarLab_20000_EN02,
            SaitSolarLab_20000_TL91, SaitSolarLab_20000_TL92, SaitSolarLab_20000_TL93,
            SaitSolarLab_20000_TW01, SaitSolarLab_20000_TW02, SaitSolarLab_20000_TW03,
            SaitSolarLab_20000_NG01, SaitSolarLab_20000_NG02
        )
        VALUES (
            DATEADD(HOUR, @i, @base),
            60 + (@i * 0.5),  65 + (@i * 0.3),
            100 + @i,         110 + @i,
            20 + (@i * 0.1),  21 + (@i * 0.1),  19 + (@i * 0.1),
            15 + (@i * 0.05), 16 + (@i * 0.05), 14 + (@i * 0.05),
            5 + (@i * 0.02),  6 + (@i * 0.02)
        );
        SET @i = @i + 1;
    END
    PRINT '24 sample rows inserted into GBTAC_data.';
END
ELSE
    PRINT 'GBTAC_data already has data, skipping seed.';
GO

PRINT '';
PRINT '========================================';
PRINT 'Setup complete! Database: gbtac_db';
PRINT 'Tables: GBTAC_data, sensor_names';
PRINT '========================================';
