"use client"

import Chart from "chart.js/auto";
import { CategoryScale, TimeScale } from "chart.js";
import { useState, useEffect } from "react";
import LineChart from "../LineChart";
import BarChart from "../BarChart";
import "chartjs-adapter-date-fns";
import zoomPlugin from 'chartjs-plugin-zoom'

Chart.register(CategoryScale, TimeScale, zoomPlugin);

const API_ENDPOINT = "http://127.0.0.1:8000";

export default function LineHandler({
    chartType,
    sensorList,
    sensorLabels,
    startDate,
    endDate,
    graphTitle,
    yTitle,
    xTitle,
    xUnit,
    aggTime = "none",
    aggType = "mean",
    onStatsReady,
}){

    // Auto-compute the chart x-axis time unit — must match backend aggregation tiers
    const getTimeUnit = () => {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = (end - start) / 86400000 + 1;
            if (days <= 1) return "hour";    // hourly averages (0..23)
            if (days <= 60) return "day";    // daily averages (1..31)
            if (days <= 730) return "month"; // monthly averages (January..)
            return "year";                   // yearly averages (2020..)
        } catch { return "month"; }
    };

    // X-axis display format per tier — client spec:
    const getDisplayFormats = () => ({
        hour:   "H",
        day:    "d",
        month:  "MMMM",
        year:   "yyyy",
    });

    const canFetch =
        Array.isArray(sensorList) &&
        sensorList.length > 0 &&
        startDate &&
        endDate;

    // sensor id (array position) and sensor code (part after SaitSolarLab_)
    const [sensors, setSensors] = useState(() =>
        sensorList.map((code, i) => ({ id: i, code, name: null }))
    );
    
    const [fetched, setFetched] = useState(false); // if data has been fetched or not
    const [loading, setLoading] = useState(true);   // loading state for UI
    const [sensorData, setSensorData] = useState([]); // holds all the sensor data
    const [unit, setUnit] = useState(xUnit);
    const [minZoom, setMinZoom] = useState();
    const [xMin, setXMin] = useState();
    const [xMax, setXMax] = useState();
    const [yMin, setYMin] = useState();
    const [yMax, setYMax] = useState();

    const fetchData = async (list = sensorList, from = startDate, to = endDate) => {
        try {
            setLoading(true);
            const query = new URLSearchParams({ start: from, end: to });
            if (aggTime && aggTime !== "none") query.set("agg", aggTime);
            if (aggType) query.set("type", aggType);
            const results = await Promise.all(
                list.map((code) =>
                    fetch(`${API_ENDPOINT}/graphs/data/${code}?${query}`)
                        .then((r) => {
                            if (!r.ok) return [];
                            return r.json();
                        })
                        .then((data) => Array.isArray(data) ? data : [])
                        .catch(() => [])
                )
            );
            setSensorData(results);
            setFetched(true);
        } catch(e) {
            console.log("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    const fetchNames = async (list = sensorList) => {
        try {
            const named = await Promise.all(
                list.map(async (code, i) => {
                    try {
                        const res = await fetch(`${API_ENDPOINT}/graphs/name/${code}`);
                        const data = await res.json();
                        return { id: i, code, name: data };
                    } catch {
                        return { id: i, code, name: code };
                    }
                })
            );
            setSensors(named);
        } catch(e) {
            console.log("error fetching sensor name");
        }
    };

    // Use a stable string key to avoid re-firing on new array references
    const sensorKey = sensorList.join(",");

    // Re-initialize + re-fetch immediately when the sensor list changes (filter click)
    useEffect(() => {
        if (!canFetch) {
            setSensors([]);
            setSensorData([]);
            setFetched(false);
            setLoading(false);
            return;
        }

        setSensors(sensorList.map((code, i) => ({ id: i, code, name: null })));
        setSensorData([]);
        setFetched(false);
        fetchData(sensorList, startDate, endDate);
        fetchNames(sensorList);
    }, [sensorKey, startDate, endDate, canFetch]);
    
    // sets defaults
    const labels = 0; // x axis labels
    // 21+ visually distinct colours — enough for all wall/ambient sensors
    const colours = [
        "#E63946", // red
        "#2196F3", // blue
        "#2A9D8F", // teal
        "#F4A261", // orange
        "#6A0572", // purple
        "#4CAF50", // green
        "#FF9800", // amber
        "#00BCD4", // cyan
        "#9C27B0", // violet
        "#F06292", // pink
        "#795548", // brown
        "#607D8B", // steel blue
        "#CDDC39", // lime
        "#FF5722", // deep orange
        "#3F51B5", // indigo
        "#009688", // dark teal
        "#1D3557", // navy
        "#FFD54F", // yellow
        "#C62828", // dark red
        "#8BC34A", // light green
        "#FF1493", // hot pink
    ];
    const [graphData, setGraphData] = useState({labels, datasets: [{}]}); // data to be passed on to LineChart component

    // runs when sensorData or sensor names change
    useEffect(() => {
        if(fetched && sensorData.length > 0 && Array.isArray(sensorData[0]) && sensorData[0].length > 0){
            const labels = sensorData[0].map(d => new Date(d.ts));

            setXMin(labels[0]);
            setXMax(labels[labels.length - 1]);

            const mins = [];
            const maxes = [];
            sensorData.forEach((sensor) => {
                const values = (sensor || []).map((d) => d.data).filter((v) => v != null);
                if (values.length > 0) {
                    mins.push(Math.min(...values));
                    maxes.push(Math.max(...values));
                }
            });
            if (mins.length > 0) setYMin(Math.min(...mins));
            if (maxes.length > 0) setYMax(Math.max(...maxes));

            // Compute KPI stats across all active sensors and pass to parent if requested
            if (onStatsReady) {
                let maxVal = -Infinity, maxTs = null, maxSensorCode = null;
                let minVal = Infinity, minTs = null, minSensorCode = null;
                let allSum = 0, allCount = 0;

                sensorData.forEach((sd, sensorIdx) => {
                    sd.forEach(d => {
                        if (d.data != null) {
                            allSum += d.data;
                            allCount++;
                            if (d.data > maxVal) {
                                maxVal = d.data;
                                maxTs = d.ts;
                                maxSensorCode = sensorList[sensorIdx];
                            }
                            if (d.data < minVal) {
                                minVal = d.data;
                                minTs = d.ts;
                                minSensorCode = sensorList[sensorIdx];
                            }
                        }
                    });
                });

                if (allCount > 0) {
                    const avg = allSum / allCount;
                    const lastValues = sensorData.map(sd => sd[sd.length - 1]?.data).filter(v => v != null);
                    const latest = lastValues.length > 0
                        ? lastValues.reduce((a, b) => a + b, 0) / lastValues.length
                        : null;
                    onStatsReady({ avg, min: minVal, max: maxVal, latest, maxTs, maxSensorCode, minTs, minSensorCode });
                } else {
                    onStatsReady(null);
                }
            }

            const dataset = sensors.map(sensor => {
                const locationName = sensorLabels?.[sensor.code];
                const codeName = sensor.name && sensor.name !== "null" ? sensor.name : sensor.code;
                const finalLabel = locationName || codeName;

                return {
                    label: finalLabel,
                    data: (sensorData[sensor.id] || []).map((d) => ({ x: new Date(d.ts), y: d.data })),
                    borderColor: colours[sensor.id % colours.length],
                    backgroundColor: colours[sensor.id % colours.length],
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    tension: 0.1,
                    segment: {
                        borderDash: (ctx) =>
                            ctx.p1.parsed.x > new Date("2025-12-31T23:59:59").getTime() ? [6, 4] : undefined,
                        borderColor: (ctx) =>
                            ctx.p1.parsed.x > new Date("2025-12-31T23:59:59").getTime()
                                ? colours[sensor.id] + "80"  // 80 = 50% opacity in hex
                                : colours[sensor.id],
                    }
                };
            });

            setGraphData({
                labels: [],
                datasets: dataset
            });

            // let resolvedUnit = getTimeUnit();
            // if (aggTime === "H") resolvedUnit = "hour";
            // else if (aggTime === "D") resolvedUnit = "day";
            // else if (aggTime === "M") resolvedUnit = "month";
            // else if (aggTime === "Y") resolvedUnit = "year";
            // setUnit(resolvedUnit);
            // if (resolvedUnit === "hour") setMinZoom(2 * 60 * 60 * 1000);
            // else if (resolvedUnit === "day") setMinZoom(2 * 24 * 60 * 60 * 1000);
            // else if (resolvedUnit === "month") setMinZoom(2 * 30.5 * 24 * 60 * 60 * 1000);
            // else if (resolvedUnit === "year") setMinZoom(2 * 12 * 30.5 * 24 * 60 * 60 * 1000);
            if(aggTime == "H") setUnit("hour")
            else if(aggTime == "D") setUnit("day")
            else if(aggTime == "M") setUnit("month")
            else if(aggTime == "Y") setUnit("year")
            
            
            if(unit == "hour") setMinZoom(2 * 60 * 60 * 1000)
            else if(unit == "day") setMinZoom(2 * 24 * 60 * 60 * 1000)
            else if(unit == "month") setMinZoom(2 * 30.5 * 24 * 60 * 60 * 1000) //may be wrong due to variable days in a month                
            else if(unit == "year") setMinZoom(2 * 12 * 30.5 * 24 * 60 * 60 * 1000) //may be wrong due to variable days in a month
            
            
        }
    }, [sensorData, sensors, fetched, onStatsReady]);

    const displayUnit = unit || getTimeUnit();

    // options for graph display to be passed on to LineChart component
    const graphOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: xTitle
                },
                type: "time",
                time: {
                    // unit: displayUnit,
                    // displayFormats: getDisplayFormats(),
                    // tooltipFormat: "PPpp",
                    unit: unit,
                }
            },
            y: {
                title: {
                    display: true,
                    text: yTitle
                },
            }
        },
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: graphTitle
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                        speed: 0.3,
                    },
                    mode: 'x',
                },
                limits: {
                    x: {
                        min: xMin,
                        max: xMax,
                        minRange: minZoom,
                    },
                    y: {
                        min: yMin,
                        max: yMax,
                    }
                },
                pan: {
                    enabled: true,
                }
            }
        },
    };

    if (!canFetch) {
        return (
            <div className="relative min-h-75 flex items-center justify-center text-gray-400 text-sm">
                Graph Placeholder
            </div>
        );
    }

    const hasData = sensorData.length > 0 && sensorData[0].length > 0;
    const chartContent = hasData ? (
        chartType === "bar" ? (
            <BarChart options={graphOptions} data={graphData} />
        ) : (
            <LineChart options={graphOptions} data={graphData} />
        )
    ) : null;

    return (
        <div className="relative min-h-75">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded">
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                        <svg className="animate-spin h-8 w-8 text-[#6D2077]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <span className="text-sm font-medium">Loading data...</span>
                    </div>
                </div>
            )}
            {!loading && fetched && sensorData.length > 0 && sensorData[0].length === 0 && (
                <div className="flex items-center justify-center h-75 text-gray-400 text-sm">
                    No data available for the selected date range.
                </div>
            )}
            {!loading && hasData && chartContent}
        </div>
    );
}
