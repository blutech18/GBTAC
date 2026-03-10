//This component holds the state for all controls
// It wraps the SensorPanel, DatePicker,  and TimeGranularityDropdown components, and passes the state down to them as props.

"use client";
import { useState } from "react";
import SensorPanel from "./SensorPanel";
import TimeGranularityDropdown from "../TimeGranularityDropdown";

export default function ReportControls({
  selectedSensors, onSensorsChange,
  from, onFromChange,
  to, onToChange,
  timeInterval, onTimeIntervalChange,
  onGenerate,
}) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerateReport = () => {
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
    onGenerate(); // ⬆️ Lift the actual report generation up
  };

  const mockSensors = [
    { id: 1, name: "Temperature Sensor - Boiler Room" },
    { id: 2, name: "Humidity Sensor - Warehouse" },
    { id: 3, name: "Pressure Sensor - Pipeline A" },
    { id: 4, name: "Gas Flow Sensor - Line 2" },
    { id: 5, name: "CO2 Sensor - Office Floor" },
    { id: 6, name: "Temperature Sensor - Storage" },
    { id: 7, name: "Vibration Sensor - Motor 1" },
    { id: 8, name: "Humidity Sensor - Greenhouse" },
    { id: 9, name: "Pressure Sensor - Tank 3" },
    { id: 10, name: "Gas Flow Sensor - Line 1" },
    { id: 11, name: "CO2 Sensor - Lab" },
    { id: 12, name: "Temperature Sensor - Server Room" },
  ];

  return (
    <div className="space-y-6">
      <SensorPanel sensors={mockSensors} selectedSensors={selectedSensors} onSelect={onSensorsChange} />

      <div className="flex flex-col w-full space-y-2 text-[#212529]" style={{ fontFamily: "var(--font-titillium)" }}>
        <div className="flex flex-wrap gap-4 items-end mb-2">
          <div>
            <label className="block text-sm mb-1 ">From</label>
            <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="border border-gray-500 text-gray-500 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">To</label>
            <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="border border-gray-500 text-gray-500 rounded px-3 py-2" />
          </div>
        </div>
      </div>

      <TimeGranularityDropdown value={timeInterval} onChange={onTimeIntervalChange} />

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