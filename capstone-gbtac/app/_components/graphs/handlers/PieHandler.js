"use client"

import Chart from "chart.js/auto";
import { CategoryScale} from "chart.js";
import { useState, useEffect } from "react";
import PieChart from "../PieChart"

Chart.register(CategoryScale);

const API_ENDPOINT = "http://127.0.0.1:8000";

export default function PieHandler({sensorList, startDate, endDate, graphTitle, label}){
    
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
    
    // takes sensors array and fetches data based off of codes, puts it in the sensorData array
    // ** NOTE: add warning if no data is available (no sensor data during time period) 
    const fetchData = async () => {
        try {
            
            const withData = await Promise.all(
                sensors.map(async (sensor) =>{
                    const res = await fetch(`${API_ENDPOINT}/energy/sum/${sensor.code}?start=${startDate}&end=${endDate}`);
                    const data = await res.json();
                    let name = sensor.code
                    try{
                        const res = await fetch(`${API_ENDPOINT}/graphs/name/${sensor.code}`);
                        const data = await res.json();
                        name = data
                    } catch {
                        console.log("name error")
                    }

                    return {...sensor, sum: data, name: name}
                })
            )
            setSensors(withData)
            setFetched(true)
            
        } catch(e){
            console.log("Error fetching data");
            // ** should probably display an error to user ?
        }
    }


    // fetches data on render and date changes
    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    
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

    // passes graph info onto LineChart component and displays it
    return (
        <div>
            <PieChart options={graphOptions} data={graphData}/>
        </div>
    )
}