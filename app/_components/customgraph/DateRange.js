//This component allows users to select a date range for filtering sensor data. 
//The component also includes basic styling to match the overall design of the application.
//This component also has two other dropdowns containing the times (Hourly, Daily, Monthly, Yearly) and the aggregation.
"use client";
import { useState } from "react";

export default function DateRange({ dateRange, setDateRange }) {

    const [aggregation, setAggregation] = useState("sum");
    const [timeInterval, setTimeInterval] = useState("hourly"); 

return (
  <div
    style={{ fontFamily: "var(--font-titillium)" }}
    className="bg-white rounded-sm shadow-sm p-4 mt-1 w-1/2"
  >
    <h2 className="font-semibold text-black mb-1">Time and Aggregation Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">From</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({...prev, from: e.target.value}))}
            max={dateRange.to || undefined}
            className="border p-2 rounded text-gray-500"
          />
        </div>

      <div className="flex flex-col">
        <label className="text-sm text-black mb-1">To</label>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange(prev => ({...prev, to: e.target.value}))}
          min={dateRange.from || undefined}
          className="border p-2 rounded text-gray-500"
        />
      </div>
    </div>

    {/* Dropdown Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="flex flex-col">
        <select
          value={timeInterval}
          onChange={(e) => setTimeInterval(e.target.value)}
          className="border p-2 rounded text-gray-500"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="flex flex-col">
        <select
          value={aggregation}
          onChange={(e) => setAggregation(e.target.value)}
          className="border p-2 rounded text-gray-500"
        >
          <option value="sum">Sum</option>
          <option value="average">Average</option>
        </select>
      </div>
    </div>

    {/* Info Text */}
    <div className="mt-5 text-gray-500">
      {from && to
        ? "Select the time interval and aggregation to control the data going to be displayed."
        : "Choose a date range, time interval, and aggregation for your chart."}
    </div>
  </div>
);
}