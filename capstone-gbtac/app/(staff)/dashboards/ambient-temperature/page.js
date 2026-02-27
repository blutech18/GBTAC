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

// 13 sensors mapped by floor from building floor plans
const FLOOR_SENSOR_MAP = {
  "Basement":  ["20004_TL2", "20005_TL2", "20006_TL2"],
  "1st Floor": ["20007_TL2", "20008_TL2", "20009_TL2", "20010_TL2", "20011_TL2"],
  "2nd Floor": ["20012_TL2", "20013_TL2", "20014_TL2", "20015_TL2", "20016_TL2"],
};

// Orientation derived from display names in sensor_names table
const SENSOR_ORIENTATION = {
  "20004_TL2": "North",  // Basement - North Wall
  "20005_TL2": "West",   // Basement - West Wall
  "20006_TL2": "South",  // Basement - South Wall
  "20007_TL2": "West",   // 1st Floor - West Wall
  "20008_TL2": "South",  // 1st Floor - South Wall (West)
  "20009_TL2": "South",  // 1st Floor - South Wall (East)
  "20010_TL2": "East",   // 1st Floor - East Wall
  "20011_TL2": "North",  // 1st Floor - North Wall
  "20012_TL2": "West",   // 2nd Floor - West Wall
  "20013_TL2": "North",  // 2nd Floor - North Wall
  "20014_TL2": "East",   // 2nd Floor - East Wall
  "20015_TL2": "South",  // 2nd Floor - South Wall (East)
  "20016_TL2": "South",  // 2nd Floor - South Wall (West)
};

const FLOOR_OPTIONS  = Object.keys(FLOOR_SENSOR_MAP);
const ORIENT_OPTIONS = ["North", "South", "East", "West"];

export default function AmbientTempDashboard() {
  const [state, setState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, {});
    return {
      fromDate: DEFAULT_FROM,
      toDate: DEFAULT_TO,
      floors: [],
      orientations: [],
      ...saved,
    };
  });

  const { fromDate, toDate, floors = [], orientations = [] } = state;

  // Step 1: filter by floor (empty = all floors)
  const floorFiltered =
    floors.length === 0
      ? Object.values(FLOOR_SENSOR_MAP).flat()
      : floors.flatMap((f) => FLOOR_SENSOR_MAP[f] || []);

  // Step 2: filter by orientation (empty = all orientations)
  const activeSensors =
    orientations.length === 0
      ? floorFiltered
      : floorFiltered.filter((code) => orientations.includes(SENSOR_ORIENTATION[code]));

  const toggleFloor = (floor) => {
    const updated = floors.includes(floor)
      ? floors.filter((f) => f !== floor)
      : [...floors, floor];
    setState((prev) => ({ ...prev, floors: updated }));
  };

  const toggleOrientation = (dir) => {
    const updated = orientations.includes(dir)
      ? orientations.filter((o) => o !== dir)
      : [...orientations, dir];
    setState((prev) => ({ ...prev, orientations: updated }));
  };

  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  const handleSaveScreen = () => {
    saveDashboardState(STORAGE_KEY, state);
    saveRecentDashboard({
      id: "ambient-temperature",
      title: "Ambient Temperature Dashboard",
      path: "/dashboards/ambient-temperature",
      summary: {
        fromDate: state.fromDate,
        toDate: state.toDate,
        floors: state.floors,
        orientations: state.orientations,
      },
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
      <div className="flex flex-wrap gap-6 items-end mb-6">
        <DatePicker
          fromDate={fromDate}
          toDate={toDate}
          setDate={({ fromDate: f, toDate: t }) =>
            setState((prev) => ({ ...prev, fromDate: f, toDate: t }))
          }
        />

        {/* Floor filter — multi-select */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Floor Levels</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setState((prev) => ({ ...prev, floors: [] }))}
              className={`px-2 py-1 text-lg border rounded ${
                floors.length === 0 ? "bg-[#6D2077] text-white" : ""
              }`}
            >
              All
            </button>
            {FLOOR_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFloor(f)}
                className={`px-2 py-1 text-lg border rounded ${
                  floors.includes(f) ? "bg-[#6D2077] text-white" : ""
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation filter — multi-select */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Orientation</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setState((prev) => ({ ...prev, orientations: [] }))}
              className={`px-2 py-1 text-lg border rounded ${
                orientations.length === 0 ? "bg-[#6D2077] text-white" : ""
              }`}
            >
              All
            </button>
            {ORIENT_OPTIONS.map((dir) => (
              <button
                key={dir}
                onClick={() => toggleOrientation(dir)}
                className={`px-2 py-1 text-lg border rounded ${
                  orientations.includes(dir) ? "bg-[#6D2077] text-white" : ""
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div id="chart-print-area" className="bg-white rounded-lg shadow-md p-4 mt-6">
        <LineHandler
          key={activeSensors.join(",")}
          sensorList={activeSensors}
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
