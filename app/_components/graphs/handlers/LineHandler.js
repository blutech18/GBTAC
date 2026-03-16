"use client"

import Chart from "chart.js/auto";
import { CategoryScale, TimeScale } from "chart.js";
import { useState, useEffect } from "react";
import LineChart from "../LineChart"
import BarChart from "../BarChart";
import "chartjs-adapter-date-fns";
import zoomPlugin from 'chartjs-plugin-zoom'

Chart.register(CategoryScale, TimeScale, zoomPlugin);

const API_ENDPOINT = "http://127.0.0.1:8000";

export default function LineHandler({chartType, sensorList, startDate, endDate, graphTitle, yTitle, xTitle, xUnit, aggTime="none", aggType="mean"}){
    
    // sensor id (array position) and sensor code (part after SaitSolarLab_)
    const [sensors, setSensors] = useState(() =>
        sensorList.map((code, i) => ({
            id: i, 
            code: code, 
            name: null
        }))
    );
    
    const [fetched, setFetched] = useState(false); // if data has been fetched or not
    const [sensorData, setSensorData] = useState([]); // holds all the sensor data
    const [unit, setUnit] = useState(xUnit)
    const [minZoom, setMinZoom] = useState()

    // mins and maxes for zoom
    const [xMin, setXMin] = useState();
    const [xMax, setXMax] = useState();
    const [yMin, setYMin] = useState();
    const [yMax, setYMax] = useState();
    
    // if sensorList changed, update sensors and reset fetched to false
    useEffect(() => {
        setFetched(false)
        setSensors(
            sensorList.map((code, i) => ({
            id: i, 
            code: code, 
            name: null
        })))
    }, [sensorList])

    useEffect(() => {
        setFetched(false)
    }, [startDate, endDate, aggTime, aggType])

    // takes sensors array and fetches data based off of codes, puts it in the sensorData array
    // ** NOTE: add warning if no data is available (no sensor data during time period) 
    const fetchData = async () => {
        try {
            let arr = [];
            
            for(let i = 0; i < sensors.length; i++){
                const res = await fetch(`${API_ENDPOINT}/graphs/data/${sensors[i].code}?start=${startDate}&end=${endDate}&agg=${aggTime}&type=${aggType}`);
                const data = await res.json();
                
                if (typeof data === "string") {
                    throw new Error(`API returned error: ${data}`);
                }

                arr.push(data);
            }   
            setSensorData(arr);
            setFetched(true);
            
        } catch(e){
            console.log("Error fetching data");
            // ** should probably display an error to user ?
        }
    }

    const fetchNames = async () => {
        try{
            const named = await Promise.all(
                sensors.map(async (sensor) =>{
                    try{
                        const res = await fetch(`${API_ENDPOINT}/graphs/name/${sensor.code}`);
                        const data = await res.json();
                        return {...sensor, name: data}
                    } catch {
                        return {...sensor, name: sensor.code}
                    }
                })
            )
            setSensors(named)

        } catch (e){
            console.log("error fetching sensor name")
        }
    }

    // fetches data on render and date changes
    useEffect(() => {
        if(!fetched){
            fetchData();
            fetchNames();
        }
    }, [sensors, fetched]);
    
    // sets defaults
    const labels = 0; // x axis labels
    const colours = ["#DA291C", "#005EB8", "#6D2077", "#00A3E0", "#A6192E"]; // colours for lines, will need to add more
    const [graphData, setGraphData] = useState({labels, datasets: [{}]}); // data to be passed on to LineChart component

    // runs when sensorData is changed (so just on fetch at the moment)
    useEffect(() => {
        if(fetched && sensorData != []){
            // ** might change so it reflects more than just the one dataset?
            const labels = sensorData[0].map(d => new Date(d.ts));

            setXMin(labels[0])
            setXMax(labels[labels.length-1])

            let mins = [];
            let maxes = [];
            sensorData.forEach((sensor, index) => {
                mins.push(Math.min(...sensor.map(point => point.data)))
                maxes.push(Math.max(...sensor.map(point => point.data)))
            });
            setYMin(Math.min(...mins))
            setYMax(Math.max(...maxes))

            // for each sensor in sensors array it sets the line label, data, and colour
            const dataset = sensors.map(sensor => ({
                label: sensor.name,
                data: sensorData[sensor.id].map(d => ({ x: new Date(d.ts), y: d.data })),
                borderColor: colours[sensor.id],
                backgroundColor: colours[sensor.id],
                borderWidth: 2,
                segment: {
                    borderDash: (ctx) =>
                        ctx.p1.parsed.x > new Date("2025-12-31T23:59:59").getTime() ? [6, 4] : undefined,
                    borderColor: (ctx) =>
                        ctx.p1.parsed.x > new Date("2025-12-31T23:59:59").getTime()
                            ? colours[sensor.id] + "80"  // 80 = 50% opacity in hex
                            : colours[sensor.id],
                }     
            }));
            
            setGraphData({
                labels: [],
                datasets: dataset
            });
 
            if(aggTime == "H"){
                setUnit("hour")
            }else if(aggTime == "D"){
                setUnit("day")
            }else if(aggTime == "M"){
                setUnit("month")
            }else if(aggTime == "Y"){
                setUnit("year")
            }
            
            if(unit == "hour"){
                setMinZoom(2 * 60 * 60 * 1000)
            }else if(unit == "day"){
                setMinZoom(2 * 24 * 60 * 60 * 1000)
            }else if(unit == "month"){
                setMinZoom(2 * 30.5 * 24 * 60 * 60 * 1000) //may be wrong due to variable days in a month                
            }else if(unit == "year"){
                setMinZoom(2 * 12 * 30.5 * 24 * 60 * 60 * 1000) //may be wrong due to variable days in a month
            }
        }
    }, [sensorData]);
    

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
                unit: unit, // ** might change to scale automatically
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
                    mode: 'x', // talk to Maeric about what type 
                },
                limits: {
                    x: {
                        min: xMin,
                        max: xMax,
                        minRange: minZoom
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

    // passes graph info onto LineChart component and displays it
    if(chartType == "line"){
        return (
            <div>
                <LineChart options={graphOptions} data={graphData}/>
            </div>
        )
    }else if(chartType == "bar"){
        return (
            <div>
                <BarChart options={graphOptions} data={graphData}/>       
            </div>
        )        
    }
}