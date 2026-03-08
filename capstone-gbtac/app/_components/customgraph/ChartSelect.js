//This component fetches Staff saved charts and allows them to select one to display from the dropdown. 
// It also has a delete button and loads a chart preview when a chart is selected.
"use client";

import { useEffect, useState } from "react";

export default function ChartSelect({
  currentChartId,
  onLoadChart,
  onDeleteChart,
  onResetChart
}) {
  const [charts, setCharts] = useState([]);

  //Fetch previously SAVED charts from the backend 
  useEffect(() => {
    fetch("/api/charts")
      .then(res => res.json())
      .then(data => setCharts(data))
      .catch(err => console.error("Failed to fetch charts:", err));
  }, []);

  //Handle chart selection from dropdown
  const handleSelect = async (e) => {
    const id = e.target.value;

    if (id === "new") {
      onResetChart();
      return;
    }

    const res = await fetch(`/api/charts/${id}`);
    const chart = await res.json();

    onLoadChart(chart);
  };

  //Handle chart deletion
  const handleDelete = async () => {
    if (!currentChartId) return;

    if (!window.confirm("Are you sure you want to delete this chart?")) return;

    await fetch(`/api/charts/${currentChartId}`, { method: "DELETE" });

    onDeleteChart();
    setCharts(charts.filter(chart => chart.id !== currentChartId));
  };

  return (
    <div
      style={{ fontFamily: "var(--font-titillium)" }}
      className="bg-white rounded-sm shadow-sm p-4 mt-2 w-1/2"
    >
      <h2 className="font-semibold text-black mb-2">
        Load An Existing Chart
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
        {/* Dropdown */}
        <select
          value={currentChartId || "new"}
          onChange={handleSelect}
          className="border p-2 rounded text-gray-500 flex-1"
        >
          <option value="new">-- Chart Title --</option>
          {charts.map(chart => (
            <option key={chart.id} value={chart.id}>
              {chart.title}
            </option>
          ))}
        </select>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={!currentChartId}
          className={`px-10 py-2 rounded text-white ${
            currentChartId
              ? "bg-[#912932] hover:bg-red-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Delete
        </button>
      </div>

      {/* Info text */}
      <div className="mt-4 text-gray-500">
        {currentChartId
          ? "Loaded chart is editable below."
          : "Select an existing chart to view or edit."}
      </div>
    </div>
  );
}
