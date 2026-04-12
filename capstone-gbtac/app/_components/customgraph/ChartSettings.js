"use client";

import { useState } from "react";

/**
 * @author Temi Bankole
 */

/**
 * ChartSettings
 *
 * Provides form controls for customizing chart display properties including
 * title, type, and axis labels. Validates all fields inline and surfaces
 * errors beneath each input.
 *
 * @param {object} settings - Current chart settings state
 * @param {string} settings.chartTitle - Title displayed on the chart
 * @param {string} settings.chartType - Chart rendering type, either "line" or "bar"
 * @param {string} settings.xAxisTitle - Label for the X axis
 * @param {string} settings.yAxisTitle - Label for the Y axis
 * @param {Function} setSettings - State setter called with the updated settings object on any change
 *
 * Notes:
 * - Validation runs on every keystroke, not on submit — errors clear as soon as the field is valid
 * - chartTitle is required; xAxisTitle and yAxisTitle are optional but still validated if non-empty
 * - chartType is constrained to "line" or "bar"; any other value will produce a validation error
 */
export default function ChartSettings({ settings, setSettings }) {
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    if (field === "chartTitle") {
      if (!value) return "Chart title is required";
      if (value.length > 50) return "Chart title must be under 50 characters";
      if (!/^[a-zA-Z0-9\s\-]*$/.test(value)) return "Only letters, numbers, and hyphens allowed";
    }
    if (field === "xAxisTitle"){
      if (value && !/^[a-zA-Z0-9\s\-]*$/.test(value)) return "Only letters, numbers, and hyphens allowed";
      if (value.length > 30) return "X-Axis title must be under 30 characters";
    }
    if (field === "yAxisTitle") {
      if (value && !/^[a-zA-Z0-9\s\-]*$/.test(value)) return "Only letters, numbers, and hyphens allowed";
      if (value.length > 30) return "Y-Axis title must be under 30 characters";
    }
    if (field === "chartType") {
      if (!["line", "bar"].includes(value)) return "Invalid chart type";
    }
    return null;
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: validate(field, value) }));
  };

  return (
    <div className="bg-white rounded shadow-sm p-4 w-full h-full">
      <h2 className="font-semibold text-black mb-4">Chart Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">Chart Title</label>
          <input
            type="text"
            placeholder="Chart Title"
            value={settings.chartTitle ?? ""}
            onChange={(e) => handleChange("chartTitle", e.target.value)}
            className={`border p-2 rounded text-gray-500 ${errors.chartTitle ? "border-red-500" : ""}`}
          />
          {errors.chartTitle && (
            <p className="text-red-500 text-xs mt-1">{errors.chartTitle}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">Chart Type</label>
          <select
            value={settings.chartType}
            onChange={(e) => handleChange("chartType", e.target.value)}
            className={`border p-2 rounded text-gray-500 ${errors.chartType ? "border-red-500" : ""}`}
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
          {errors.chartType && (
            <p className="text-red-500 text-xs mt-1">{errors.chartType}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">X-Axis Title</label>
          <input
            type="text"
            placeholder="X-Axis Title"
            value={settings.xAxisTitle ?? ""}
            onChange={(e) => handleChange("xAxisTitle", e.target.value)}
            className={`border p-2 rounded text-gray-500 ${errors.xAxisTitle ? "border-red-500" : ""}`}
          />
          {errors.xAxisTitle && (
            <p className="text-red-500 text-xs mt-1">{errors.xAxisTitle}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">Y-Axis Title</label>
          <input
            type="text"
            placeholder="Y-Axis Title"
            value={settings.yAxisTitle ?? ""}
            onChange={(e) => handleChange("yAxisTitle", e.target.value)}
            className={`border p-2 rounded text-gray-500 ${errors.yAxisTitle ? "border-red-500" : ""}`}
          />
          {errors.yAxisTitle && (
            <p className="text-red-500 text-xs mt-1">{errors.yAxisTitle}</p>
          )}
        </div>
      </div>

      {/* Hint text — reflects whether chart settings have been started */}
      <div className="mt-4 text-gray-500">
        {settings.chartTitle
          ? "Chart settings implemented. You can change it anytime."
          : "Implement the chart settings to customize your chart."}
      </div>
    </div>
  );
}