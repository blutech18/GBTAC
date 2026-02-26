"use client"

import { useState, useEffect } from "react"
import LineHandler from "./LineHandler"
import BarHandler from "./BarHandler"

export default function CustomHandler({selectedSensors, dateRange, settings}){
    try{
        const [sensors, setSensors] = useState(selectedSensors.map(sensor => sensor.code))
        useEffect(() => {
            setSensors(selectedSensors.map(sensor => sensor.code))
        }, [selectedSensors])

        if(sensors.length > 0){
            
            if(settings.chartType == "line"){
                return(
                    <div className="w-full h-full">
                        <LineHandler
                            sensorList={sensors}
                            startDate={dateRange.from}
                            endDate={dateRange.to}
                            graphTitle={settings.chartTitle}
                            yTitle={settings.xAxisTitle}
                            xTitle={settings.yAxisTitle}
                            xUnit={"hour"}
                        />
                    </div>
                )
            }else if(settings.chartType == "bar"){
                return(
                    <div className="w-full h-full">
                        <BarHandler
                            sensorList={sensors}
                            startDate={dateRange.from}
                            endDate={dateRange.to}
                            graphTitle={settings.chartTitle}
                            yTitle={settings.xAxisTitle}
                            xTitle={settings.yAxisTitle}
                            xUnit={"hour"}
                        />                    
                    </div>
                )
            }else{
                return(
                    <div>
                        <p>Invalid graph type</p>
                    </div>
                )
            }
        }else{
            <div>Enter graph info and press apply</div>
        }

    } catch(e){
        console.log(e)
        return(
            <div>
                <p>Enter information and press apply</p>
            </div>
        )
    }

}