"use client"

import Chart from "chart.js/auto";
import { CategoryScale, TimeScale } from "chart.js";
import { useState, useEffect } from "react";
import LineChart from "../LineChart"
import "chartjs-adapter-date-fns";
import zoomPlugin from 'chartjs-plugin-zoom'

Chart.register(CategoryScale, TimeScale, zoomPlugin);

const API_ENDPOINT = "http://127.0.0.1:8000";

export default function LineHandler({sensorList, startDate, endDate, graphTitle, yTitle, xTitle}){

    // Auto-compute the chart x-axis time unit — must match backend aggregation tiers
    const getTimeUnit = () => {
        try {
            const days = (new Date(endDate) - new Date(startDate)) / 86400000 + 1;
            if (days <= 1)   return "minute"; // per-minute for single day
            if (days <= 60)  return "day";    // daily averages
            if (days <= 730) return "month";  // monthly averages
            return "year";                    // yearly averages
        } catch { return "month"; }
    };

    // X-axis display format per tier — client spec:
    // yearly=2020,2021 | monthly=January,February | daily=1,2..31 | hourly=0..23 | minute=0..59
    const getDisplayFormats = () => ({
        minute: "m",    // 0, 1, 2 ... 59
        hour:   "H",    // 0, 1, 2 ... 23
        day:    "d",    // 1, 2, 3 ... 31
        month:  "MMMM", // January, February ...
        year:   "yyyy", // 2020, 2021 ...
    });

    // const [errorFlag, setErrorFlag] = useState(false)

    // if(endDate < startDate){
    //     console.log("date error")
    //     setErrorFlag(true)
    // }
    
    // sensor id (array position) and sensor code (part after SaitSolarLab_)
    const [sensors, setSensors] = useState(() =>
        sensorList.map((code, i) => ({ id: i, code, name: null }))
    );
    
    const [fetched, setFetched] = useState(false); // if data has been fetched or not
    const [loading, setLoading] = useState(true);   // loading state for UI
    const [sensorData, setSensorData] = useState([]); // holds all the sensor data

    // Always read from sensorList prop directly — avoids stale-closure on sensor state
    const fetchData = async (list = sensorList, from = startDate, to = endDate) => {
        try {
            setLoading(true);
            const results = await Promise.all(
                list.map((code) =>
                    fetch(`${API_ENDPOINT}/graphs/data/${code}?start=${from}&end=${to}`)
                        .then((r) => r.json())
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

    // Re-initialize + re-fetch immediately when the sensor list changes (filter click)
    useEffect(() => {
        setSensors(sensorList.map((code, i) => ({ id: i, code, name: null })));
        setSensorData([]);
        setFetched(false);
        fetchData(sensorList, startDate, endDate);
        fetchNames(sensorList);
    }, [sensorList]);

    // Re-fetch when dates change (sensors unchanged)
    useEffect(() => {
        fetchData(sensorList, startDate, endDate);
    }, [startDate, endDate]);
    
    // sets defaults
    const labels = 0; // x axis labels
    // 16 visually distinct colours — enough for all sensor combinations
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
    ];
    const [graphData, setGraphData] = useState({labels, datasets: [{}]}); // data to be passed on to LineChart component

    // runs when sensorData or sensor names change
    useEffect(() => {
        if(fetched && sensorData.length > 0){
            const labels = sensorData[0].map(d => new Date(d.ts));

            // for each sensor in sensors array it sets the line label, data, and colour
            const dataset = sensors.map(sensor => ({
                label: sensor.name || sensor.code,
                data: sensorData[sensor.id].map(d => d.data),
                borderColor: colours[sensor.id % colours.length],
                backgroundColor: colours[sensor.id % colours.length],
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
                tension: 0.1
            }));
            
            setGraphData({
                labels,
                datasets: dataset
            });
        }
    }, [sensorData, sensors]);

    // options for graph display to be passed on to LineChart component
    const graphOptions = {
        scales: {
            x: {
                title: {
                display: true,
                text: xTitle
                },
                type: "time",
                time: {
                    unit: getTimeUnit(),
                    displayFormats: getDisplayFormats(),
                    tooltipFormat: "PPpp", // full date+time in tooltip
                }
            },
            y: {
                title: {
                display: true,
                text: yTitle
                }
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
                    },
                    mode: 'xy',
                    // limits: {
                    //     x: {
                    //         min: labels[0],
                    //         max: labels[labels.length - 1],
                    //     }
                    // }
                },
                
            }
        },
    };

    // passes graph info onto LineChart component and displays it
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
            {(!loading || fetched) && sensorData.length > 0 && sensorData[0].length > 0 && (
                <LineChart options={graphOptions} data={graphData}/>
            )}
        </div>
    )
}