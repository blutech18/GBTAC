"use client";

import { useState } from "react";

/**
 * TimeGranularityDropdown
 *
 * Dropdown for selecting a time interval used in data aggregation and
 * visualization. Supports both controlled and uncontrolled usage depending
 * on whether a value prop is provided.
 *
 * @param {string} [value] - Controlled value; if omitted the component manages
 *   its own internal state
 * @param {Function} [onChange=()=>{}] - Called with the selected interval string on change
 * @param {string} [className=""] - Additional Tailwind classes appended to the outer container
 * @param {Array} [options] - Custom option list; each entry must have a value and label field.
 *   Defaults to: None, Hourly (H), Daily (D), Monthly (M), Yearly (Y)
 *
 * Notes:
 * - When value is provided the component is fully controlled and internal state is ignored;
 *   when value is undefined the component falls back to uncontrolled internal state
 * - onChange is always called regardless of controlled or uncontrolled mode, so the parent
 *   can observe changes without needing to own the state
 * @author Temi Bankole
 */
export default function TimeGranularityDropdown({
  value,
  onChange = () => {},
  className = "",
  options,
}) {
  const [timeInterval, setTimeInterval] = useState("none");

  // Use the controlled value if provided, otherwise fall back to internal state
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
    // Only update internal state when uncontrolled — parent owns state otherwise
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