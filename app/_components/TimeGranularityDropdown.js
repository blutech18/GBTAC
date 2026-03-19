// This component allows users to select the time granularity for data visualization.
// The dropdown includes options for Hourly, Daily, Monthly, and Yearly intervals.

"use client";
import { useState } from "react";

export default function TimeGranularityDropdown({ onChange = () => {} }) {
  const [timeInterval, setTimeInterval] = useState("none");

  const handleChange = (e) => {
    const selectedInterval = e.target.value;
    setTimeInterval(selectedInterval);
    onChange(selectedInterval);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <select
          value={timeInterval}
          onChange={handleChange}
          className="border p-2 rounded text-gray-600"
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