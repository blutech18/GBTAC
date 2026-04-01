// This component allows users to select the time granularity for data visualization.
// The dropdown includes options for Hourly, Daily, Monthly, and Yearly intervals.

"use client";
import { useState } from "react";

export default function TimeGranularityDropdown({
  value,
  onChange = () => {},
  className = "",
  options,
}) {
  const [timeInterval, setTimeInterval] = useState("none");
  const selectedValue = value ?? timeInterval;

  const defaultOptions = [
    { value: "none", label: "None" },
    { value: "H", label: "Hourly" },
    { value: "D", label: "Daily" },
    { value: "M", label: "Monthly" },
    { value: "Y", label: "Yearly" },
  ];

  const dropdownOptions = options || defaultOptions;

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
          {dropdownOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}