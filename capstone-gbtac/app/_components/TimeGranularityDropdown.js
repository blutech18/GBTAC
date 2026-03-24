// This component allows users to select the time granularity for data visualization.
// The dropdown includes options for Hourly, Daily, Monthly, and Yearly intervals.

"use client";
import { useState } from "react";

export default function TimeGranularityDropdown({
  value,
  onChange = () => {},
  className = "",
}) {
  const [timeInterval, setTimeInterval] = useState("none");
  const selectedValue = value ?? timeInterval;

  const handleChange = (e) => {
    const selectedInterval = e.target.value;
    if (value === undefined) {
      setTimeInterval(selectedInterval);
    }
    onChange(selectedInterval);
  };

  return (
    <div className={`flex flex-col ${className}`.trim()}>
      <div className="flex flex-col">
        <select
          value={selectedValue}
          onChange={handleChange}
          className="border p-2 rounded text-gray-600 w-full"
        >
          <option value="none">None</option>
          <option value="H">Hourly</option>
          <option value="D">Daily</option>
          <option value="M">Monthly</option>
          <option value="Y">Yearly</option>
        </select>
      </div>
    </div>
  );
}