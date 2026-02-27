//This component contains various settings for customizing the chart display such as titles, axis, and chart type. 
"use client";

import { useState } from "react";

export default function ChartSettings() {
  const [chartTitle, setChartTitle] = useState("");
  const [xAxisTitle, setXAxisTitle] = useState("");
  const [yAxisTitle, setYAxisTitle] = useState("");
  const [chartType, setChartType] = useState("line");

  return (
    <div style={{ fontFamily: "var(--font-titillium)" }} className="bg-white rounded-sm shadow-sm p-4 mt-1 w-1/2">
      <h2 className="font-semibold text-lg text-black mb-2">Chart Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
        <input
          type="text"
          placeholder="Chart Title"
          value={chartTitle}
          onChange={(e) => setChartTitle(e.target.value)}
          className="border p-2 rounded text-gray-500"
        />

        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="border p-2 rounded text-gray-500"
        >
          <option value="line">Line</option>
          <option value="bar">Bar</option>
          <option value="area">Area</option>
        </select>

        <input
          type="text"
          placeholder="X Axis Title"
          value={xAxisTitle}
          onChange={(e) => setXAxisTitle(e.target.value)}
          className="border p-2 rounded text-gray-500"
        />

        <input
          type="text"
          placeholder="Y Axis Title"
          value={yAxisTitle}
          onChange={(e) => setYAxisTitle(e.target.value)}
          className="border p-2 rounded text-gray-500"
        />
      </div>
    </div>
  );
}

