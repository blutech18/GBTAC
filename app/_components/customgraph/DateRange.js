//This component allows users to select a date range for filtering sensor data. 
//The component also includes basic styling to match the overall design of the application.
//This component also has two other dropdowns containing the times (Hourly, Daily, Monthly, Yearly) and the aggregation.
"use client";
import { useDateValidation } from "../hooks/useDateValidation";
import { useState } from "react";

export default function DateRange({ dateRange, setDateRange, aggSettings, setAggSettings }) {

  const { errors, setErrors, validate} = useDateValidation({
    earliestDate: "2017-01-01",
    latestDate: "2025-12-31"
  });

  const [aggErrors, setAggErrors] = useState({});

  const safeDateRange = {
    from: dateRange?.from ?? "",
    to: dateRange?.to ?? ""
  };
  const safeAggSettings = {
    time: aggSettings?.time ?? "none",
    type: aggSettings?.type ?? "mean"
  };

  const handleChange = (field, value) => {
    if (!setDateRange) return;
    setDateRange(prev => ({ ...prev, [field]: value }));
    const otherDate = field === "from" ? safeDateRange.to : safeDateRange.from;
    setErrors(prev => ({ ...prev, [field]: validate(field, value, otherDate) }));
  };

  const handleAggChange = (field, value) => {
  setAggSettings?.(prev => ({ ...prev, [field]: value }));
  if (field === "time" && !["H", "D", "M", "Y"].includes(value)) {
    setAggErrors(prev => ({ ...prev, time: "Invalid time interval" }));
  } else if (field === "type" && !["mean", "sum"].includes(value)) {
    setAggErrors(prev => ({ ...prev, type: "Invalid aggregation type" }));
  } else {
    setAggErrors(prev => ({ ...prev, [field]: null }));
  }
};

  return (
    <div className="bg-white rounded-sm shadow-sm p-4 w-full h-full">
      <h2 className="font-semibold text-black mb-4">Time and Aggregation Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">From</label>
          <input
            type="date"
            value={safeDateRange.from}
            onChange={(e) => handleChange("from", e.target.value)}
            className={`border p-2 rounded text-gray-500 ${errors.from ? "border-red-500" : ""}`}
          />
          {errors.from && (
            <p className="text-red-500 text-xs mt-1">{errors.from}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">To</label>
          <input
            type="date"
            value={safeDateRange.to}
            onChange={(e) => handleChange("to", e.target.value)}
            className={`border p-2 rounded text-gray-500 ${errors.to ? "border-red-500" : ""}`}
          />
          {errors.to && (
            <p className="text-red-500 text-xs mt-1">{errors.to}</p>
          )}
        </div>
      </div>

    {/* Dropdown Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="flex flex-col">
        <label className="text-sm text-black mb-1">Time Interval</label>
        <select
          value={safeAggSettings.time}
          onChange={(e) => handleAggChange("time", e.target.value)}
          className={`border p-2 rounded text-gray-500 ${aggErrors.time ? "border-red-500" : ""}`}
        >
          <option value="none">None</option>
          <option value="H">Hourly</option>
          <option value="D">Daily</option>
          <option value="M">Monthly</option>
          <option value="Y">Yearly</option>
        </select>
        {aggErrors.time && (
          <p className="text-red-500 text-xs mt-1">{aggErrors.time}</p>
        )}
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-black mb-1">Aggregation</label>
        <select
          value={safeAggSettings.type}
          onChange={(e) => handleAggChange("type", e.target.value)}
          className={`border p-2 rounded text-gray-500 ${aggErrors.type ? "border-red-500" : ""}`}
        >
          <option value="mean">Average</option>
          <option value="sum">Sum</option>
        </select>
        {aggErrors.type && (
          <p className="text-red-500 text-xs mt-1">{aggErrors.type}</p>
        )}
      </div>
    </div>

      <div className="mt-5 text-gray-500">
        {safeDateRange.from && safeDateRange.to
          ? "Select the time range, interval, and aggregation for the displayed data."
          : "Choose a date range, time interval, and aggregation for your chart."}
      </div>
    </div>
  );
}