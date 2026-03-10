"use client"

import { useState, useEffect } from "react"
import LineHandler from "./LineHandler"

export default function CustomHandler({selectedSensors, dateRange, settings, aggSettings}){
    try{
        const [sensors, setSensors] = useState(selectedSensors.map(sensor => sensor.code))
        useEffect(() => {
            setSensors(selectedSensors.map(sensor => sensor.code))
        }, [selectedSensors])

        if(sensors.length > 0){
            
            if(settings.chartType == "line" || settings.chartType == "bar"){
                return(
                    <div className="w-full h-full">
                        <LineHandler
                            chartType={settings.chartType}
                            sensorList={sensors}
                            startDate={dateRange.from}
                            endDate={dateRange.to}
                            graphTitle={settings.chartTitle}
                            yTitle={settings.xAxisTitle}
                            xTitle={settings.yAxisTitle}
                            aggTime={aggSettings.time}
                            aggType={aggSettings.type}                            
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