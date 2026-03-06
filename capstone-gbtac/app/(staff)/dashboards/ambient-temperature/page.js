"use client";

import { useEffect, useState } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import InfoCard from "../../../_components/InfoCard";
import LineHandler from "../../../_components/graphs/handlers/LineHandler";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";

const STORAGE_KEY = "dashboard-ambient-temp-v3";
const DEFAULT_FROM = "2018-10-13";
const DEFAULT_TO   = "2025-12-31";

// 13 sensors mapped by floor from building floor plans
const FLOOR_SENSOR_MAP = {
  "Basement":    ["20004_TL2", "20005_TL2", "20006_TL2"],
  "Main Floor":  ["20007_TL2", "20008_TL2", "20009_TL2", "20010_TL2", "20011_TL2"],
  "Upper Floor": ["20012_TL2", "20013_TL2", "20014_TL2", "20015_TL2", "20016_TL2"],
};

// Orientation derived from client-provided sensor locations
const SENSOR_ORIENTATION = {
  "20004_TL2": "East",      // Basement - East 1
  "20005_TL2": "West",      // Basement - West
  "20006_TL2": "East",      // Basement - East 2
  "20007_TL2": "Northwest", // Main Floor - Northwest
  "20008_TL2": "South",     // Main Floor - South 1
  "20009_TL2": "South",     // Main Floor - South 2
  "20010_TL2": "East",      // Main Floor - East
  "20011_TL2": "Middle",    // Main Floor - Middle
  "20012_TL2": "West",      // Upper Floor - West
  "20013_TL2": "Middle",    // Upper Floor - Middle
  "20014_TL2": "East",      // Upper Floor - East
  "20015_TL2": "South",     // Upper Floor - South 2
  "20016_TL2": "South",     // Upper Floor - South 1
};

const FLOOR_OPTIONS  = Object.keys(FLOOR_SENSOR_MAP);
const ORIENT_OPTIONS = ["East", "West", "South", "Northwest", "Middle"];

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

      {/* Controls row — all filters in one horizontal bar */}
      <div className="flex flex-nowrap gap-6 items-end mb-6 overflow-x-auto pb-1">
        <DatePicker
          fromDate={fromDate}
          toDate={toDate}
          setDate={({ fromDate: f, toDate: t }) =>
            setState((prev) => ({ ...prev, fromDate: f, toDate: t }))
          }
        />

        {/* Floor filter — multi-select */}
        <div className="shrink-0">
          <label className="block text-sm font-medium mb-1">Floor Levels</label>
          <div className="flex flex-nowrap gap-2">
            <button
              onClick={() => setState((prev) => ({ ...prev, floors: [] }))}
              className={`px-2 py-1 text-sm border rounded whitespace-nowrap ${
                floors.length === 0 ? "bg-[#005EB8] text-white" : "bg-white text-gray-700"
              }`}
            >
              All
            </button>
            {FLOOR_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFloor(f)}
                className={`px-2 py-1 text-sm border rounded whitespace-nowrap ${
                  floors.includes(f) ? "bg-[#005EB8] text-white" : "bg-white text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation filter — multi-select */}
        <div className="shrink-0">
          <label className="block text-sm font-medium mb-1">Orientation</label>
          <div className="flex flex-nowrap gap-2">
            <button
              onClick={() => setState((prev) => ({ ...prev, orientations: [] }))}
              className={`px-2 py-1 text-sm border rounded whitespace-nowrap ${
                orientations.length === 0 ? "bg-[#005EB8] text-white" : "bg-white text-gray-700"
              }`}
            >
              All
            </button>
            {ORIENT_OPTIONS.map((dir) => (
              <button
                key={dir}
                onClick={() => toggleOrientation(dir)}
                className={`px-2 py-1 text-sm border rounded whitespace-nowrap ${
                  orientations.includes(dir) ? "bg-[#005EB8] text-white" : "bg-white text-gray-700"
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <InfoCard
        items={[
          { label: "Current Temp", value: (21.256).toFixed(2) + "°C" },
          { label: "Daily Avg",    value: (20.254).toFixed(2) + "°C" },
          { label: "High",         value: (24.789).toFixed(2) + "°C" },
          { label: "Low",          value: (17.7789).toFixed(2) + "°C" },
        ]}
      />

      {/* Chart */}
      <div id="chart-print-area" className="bg-white rounded-lg shadow-md p-4">
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

      {/* Selected Floor Layout */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Selected Floor Layout</h2>
        <div className="border border-dashed border-gray-300 rounded p-6 min-h-24 flex items-center justify-center text-sm text-gray-400">
          {floors.length === 1
            ? `${floors[0]} layout preview`
            : "Select a floor to preview layout."}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
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
