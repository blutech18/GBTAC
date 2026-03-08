BULK INSERT GBTAC_data
FROM 'C:\Users\kj9is\Downloads\merged_timeseries_student.csv' -- change to correct filepath
WITH (
    FIRSTROW = 2,
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '\n', 
    TABLOCK,
    KEEPNULLS
);
