"use client"

import Chart from "chart.js/auto";
import { CategoryScale} from "chart.js";
import { useState, useEffect } from "react";
import PieChart from "../PieChart"

Chart.register(CategoryScale);

const API_ENDPOINT = "http://127.0.0.1:8000";

export default function PieHandler({sensorList, startDate, endDate, graphTitle, label}){
    const canFetch =
        Array.isArray(sensorList) &&
        sensorList.length > 0 &&
        startDate &&
        endDate;

    const sensorKey = sensorList.join(",");
    
    // sensor id (array position) and sensor code (part after SaitSolarLab_)
    const [sensors, setSensors] = useState(() =>
        sensorList.map((code, i) => ({
            id: i, 
            code: code, 
            name: null,
            sum: 0
        }))
    );
    
    const [fetched, setFetched] = useState(false); // if data has been fetched or not
    const [loading, setLoading] = useState(true); // loading state for UI
    
    // takes sensors array and fetches data based off of codes, puts it in the sensorData array
    // ** NOTE: add warning if no data is available (no sensor data during time period) 
    const fetchData = async (list = sensorList) => {
        try {
            setLoading(true);
            setFetched(false);
            const withData = await Promise.all(
                list.map(async (code, i) =>{
                    const res = await fetch(`${API_ENDPOINT}/energy/sum/${code}?start=${startDate}&end=${endDate}`);
                    const data = await res.json();
                    let name = code
                    try{
                        const res = await fetch(`${API_ENDPOINT}/graphs/name/${code}`);
                        const data = await res.json();
                        name = data
                    } catch {
                        console.log("name error")
                    }

                    return { id: i, code, name, sum: data }
                })
            )
            setSensors(withData)
            setFetched(true)
            
        } catch(e){
            console.log("Error fetching data");
            // ** should probably display an error to user ?
        } finally {
            setLoading(false);
        }
    }


    // fetches data on render and date changes
    useEffect(() => {
        if (!canFetch) {
            setSensors(sensorList.map((code, i) => ({ id: i, code, name: null, sum: 0 })));
            setFetched(false);
            setLoading(false);
            return;
        }
        fetchData(sensorList);
    }, [sensorKey, startDate, endDate, canFetch]);

    
    // sets defaults
    const labels = []; 
    const colours = ["#DA291C", "#005EB8", "#6D2077", "#00A3E0", "#A6192E"]; // colours for lines, will need to add more
    const [graphData, setGraphData] = useState({labels, datasets: [{}]}); // data to be passed on to LineChart component

    // runs when sensorData is changed (so just on fetch at the moment)
    useEffect(() => {
        if(fetched){
            // ** might change so it reflects more than just the one dataset?
            const labels = sensors.map(sensor => sensor.name);
            
            setGraphData({
                labels,
                datasets: [
                    {
                        label: label,
                        data: sensors.map((sensor) => sensor.sum),
                        borderColor: colours,
                        backgroundColor: colours,
                        borderWidth: 2,
                        radius: '90%'
                    }
                ]
            });
        }
    }, [sensors]);

    // options for graph display to be passed on to LineChart component
    const graphOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: graphTitle
            },
        },
    };

    if (!canFetch) {
        return (
            <div className="relative min-h-75 flex items-center justify-center text-gray-400 text-sm">
                Graph Placeholder
            </div>
        );
    }

    const hasData = sensors.some((sensor) => sensor.sum != null);

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
            {!loading && fetched && !hasData && (
                <div className="flex items-center justify-center h-75 text-gray-400 text-sm">
                    No data available for the selected date range.
                </div>
            )}
            {!loading && hasData && <PieChart options={graphOptions} data={graphData}/>}
        </div>
    )
}