"use client";

import { useEffect, useState } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import InfoCard from "../../../_components/InfoCard";
import LineHandler from "../../../_components/graphs/handlers/LineHandler";
import ExportPDFButton from "../../../_components/ExportPDFButton";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";

const STORAGE_KEY = "dashboard-ambient-temp-v2";
const DEFAULT_FROM = "2018-10-13";
const DEFAULT_TO   = "2025-12-31";

const AMBIENT_SENSORS = ["20000_TL92", "20000_TL93"];

const FLOOR_OPTIONS    = ["All", "Basement", "1st Floor", "2nd Floor"];
const ORIENT_OPTIONS   = ["All", "North", "South", "East", "West"];

export default function AmbientTempDashboard() {
  const [state, setState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, {});
    return {
      fromDate: DEFAULT_FROM,
      toDate: DEFAULT_TO,
      floor: "All",
      orientation: "All",
      ...saved,
    };
  });

  const { fromDate, toDate, floor, orientation } = state;

  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  const handleSaveScreen = () => {
    saveDashboardState(STORAGE_KEY, state);
    saveRecentDashboard({
      id: "ambient-temperature",
      title: "Ambient Temperature Dashboard",
      path: "/dashboards/ambient-temperature",
      summary: { fromDate: state.fromDate, toDate: state.toDate },
      saved: true,
    });
    alert("Dashboard state saved! Your graph settings are restored for next login.");
  };

  return (
    <DashboardLayout title="Ambient Temperature Dashboard">
      <InfoCard
        items={[
          { label: "Current Temp", value: (21.256).toFixed(2) + "°C" },
          { label: "Daily Avg",    value: (20.254).toFixed(2) + "°C" },
          { label: "High",         value: (24.789).toFixed(2) + "°C" },
          { label: "Low",          value: (17.7789).toFixed(2) + "°C" },
        ]}
      />

      {/* Controls row */}
      <div className="flex flex-wrap gap-6 items-end mt-6">
        <DatePicker
          fromDate={fromDate}
          toDate={toDate}
          setDate={({ fromDate: f, toDate: t }) =>
            setState((prev) => ({ ...prev, fromDate: f, toDate: t }))
          }
        />

        {/* Floor filter */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Floor Levels</label>
          <div className="flex flex-wrap gap-2">
            {FLOOR_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setState((prev) => ({ ...prev, floor: f }))}
                className={`px-3 py-1 text-sm border rounded transition ${
                  floor === f
                    ? "bg-[#6D2077] text-white border-[#6D2077]"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation filter */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Orientation</label>
          <div className="flex flex-wrap gap-2">
            {ORIENT_OPTIONS.map((o) => (
              <button
                key={o}
                onClick={() => setState((prev) => ({ ...prev, orientation: o }))}
                className={`px-3 py-1 text-sm border rounded transition ${
                  orientation === o
                    ? "bg-[#6D2077] text-white border-[#6D2077]"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div id="chart-print-area" className="bg-white rounded-lg shadow-md p-4 mt-6">
        <LineHandler
          sensorList={AMBIENT_SENSORS}
          startDate={fromDate || DEFAULT_FROM}
          endDate={toDate || DEFAULT_TO}
          graphTitle="Ambient Temperature"
          yTitle="Temperature (°C)"
          xTitle="Time"
        />
      </div>

      {/* PDF Screenshot section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-base font-semibold text-gray-700 mb-3">PDF Labelled Screenshot</h2>
        <div className="border border-dashed border-gray-300 rounded p-6 min-h-24 flex items-center justify-center text-sm text-gray-400">
          Screenshot preview will appear here.<br />(Exported PDF version of this dashboard)
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <ExportPDFButton />
        <button
          onClick={handleSaveScreen}
          className="px-5 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
        >
          Save Screen
        </button>
      </div>
    </DashboardLayout>
  );
}
