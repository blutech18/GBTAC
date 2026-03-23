//This component holds the state for all Report controls
//It wraps the SensorPanel, DatePicker,  and TimeGranularityDropdown components, and passes the state down to them as props.

"use client";
import { useState, useEffect } from "react";
import SensorPanel from "./SensorPanel";
import TimeGranularityDropdown from "../TimeGranularityDropdown";

export default function ReportControls({
  selectedSensors, onSensorsChange,
  chartTitle, onChartTitleChange,
  from, onFromChange,
  to, onToChange,
  timeInterval, onTimeIntervalChange,
  onGenerate,
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [sensors, setSensors] = useState();
  
  const handleGenerateReport = () => {
    if (!chartTitle || chartTitle.trim().length === 0) {
      setErrorMessage("Please enter a report title.");
      return;
    }
    if (selectedSensors.length === 0) {
      setErrorMessage("Please select at least one sensor.");
      return;
    }
    if (!from || !to) {
      setErrorMessage("Please select a date range.");
      return;
    }
    if (new Date(from) > new Date(to)) {
      setErrorMessage("From date cannot be after To date.");
      return;
    }
    //From date can't be past 8 years of data
    const today = new Date();
    const fromDate = new Date(from);
    const diffYears = (today - fromDate) / (1000 * 60 * 60 * 24 * 365); //difference in years from today + from date
    if (diffYears > 8) {
      setErrorMessage("From date cannot be more than 8 years ago.");
      return;
    }
    
    //To date can't be past 2025-12-31
    const maxToDate = new Date("2025-12-31");
    const toDate = new Date(to);
    if (toDate > maxToDate) {
      setErrorMessage("To date cannot be past December 31, 2025.");
      return;
    }
    setErrorMessage("");
    onGenerate(); 
  };
  
  const loadSensors = async () => {
    const res = await fetch("http://localhost:8000/graphs/codesnames", {credentials: "include",})
    const data = await res.json()
    setSensors(data)
  }

  //Load sensor options for the SensorPanel when the component mounts
  useEffect(() => {
    //eslint-disable-next-line react-hooks/set-state-in-effect
    loadSensors();
  }, []);

  return (
    <div className="space-y-6">
      <SensorPanel sensors={sensors} selectedSensors={selectedSensors} onSelect={onSensorsChange} />

      <div className="flex flex-col w-full space-y-2 text-[#212529]">
        <div>
          <label className="block text-sm mb-1">Report Title</label>
          <input
            type="text"
            value={chartTitle}
            onChange={(e) => onChartTitleChange(e.target.value)}
            placeholder="Enter report title"
            maxLength={30}
            className="border mb-1 border-gray-500 text-gray-700 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm mb-1 ">From</label>
            <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="border mb-1 border-gray-500 text-gray-500 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">To</label>
            <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="border mb-1 border-gray-500 text-gray-500 rounded px-3 py-2" />
          </div>
        </div>

      
      <div className="w-full text-[#212529]">
        <label className="block text-sm mb-1">Time Interval</label>
        <TimeGranularityDropdown
          value={timeInterval}
          onChange={onTimeIntervalChange}
          className="w-full"
        />
      </div>
    </div>


      <div className="flex flex-col items-center">
        <button
          className="w-full px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
          onClick={handleGenerateReport}
        >
          Generate Report
        </button>
        {errorMessage && <p className="mt-5 text-red-600 font-bold">{errorMessage}</p>}
      </div>
    </div>
  );
}