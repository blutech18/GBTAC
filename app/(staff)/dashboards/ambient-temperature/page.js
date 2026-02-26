"use client";

import { useEffect, useState } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import InfoCard from "../../../_components/InfoCard";
import GraphPlaceholder from "../../../_components/GraphPlaceholder";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";

const STORAGE_KEY = "dashboard-ambient-temp";

const FLOOR_OPTIONS = ["Basement", "1st Floor", "2nd Floor", "Roof"];
const ORIENTATION_OPTIONS = ["North", "South", "East", "West"];

export default function AmbientTempDashboard() {
  const [state, setState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, {});
    return {
      fromDate: "",
      toDate: "",
      floors: [],
      orientations: [],
      ...saved,
    };
  });

  const { fromDate, toDate, floors = [], orientations = [] } = state;

  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  const handleMultiSelect = (key, value) => {
    const currentValues = state[key] || [];

    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    setState({ ...state, [key]: updatedValues });
  };

  const handleSelectAll = (key, options) => {
    const currentValues = state[key] || [];

    setState({
      ...state,
      [key]: currentValues.length === options.length ? [] : options,
    });
  };

  const handleSaveScreen = () => {
    // Save state to localStorage
    saveDashboardState(STORAGE_KEY, state);

    // Save this dashboard to recent dashboards
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

    alert(
      "Dashboard state saved! Your graph settings are restored for next login.",
    );
  };

  return (
    <DashboardLayout title="Ambient Temperature Dashboard">
      <InfoCard
        items={[
          { label: "Current Temp", value: (21.256).toFixed(2) + "°C" },
          { label: "Daily Avg", value: (20.254).toFixed(2) + "°C" },
          { label: "High", value: (24.789).toFixed(2) + "°C" },
          { label: "Low", value: (17.7789).toFixed(2) + "°C" },
        ]}
      />

      <div className="flex flex-wrap gap-6 items-end mb-6">
        <DatePicker
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={(v) => setState({ ...state, fromDate: v })}
          setToDate={(v) => setState({ ...state, toDate: v })}
        />

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Floor Levels</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSelectAll("floors", FLOOR_OPTIONS)}
              className="px-2 py-1 text-lg border rounded"
            >
              All
            </button>

            {FLOOR_OPTIONS.map((floor) => (
              <button
                key={floor}
                onClick={() => handleMultiSelect("floors", floor)}
                className={`px-2 py-1 text-lg border rounded ${
                  floors.includes(floor) ? "bg-[#6D2077] text-white" : ""
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Orientation</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                handleSelectAll("orientations", ORIENTATION_OPTIONS)
              }
              className="px-2 py-1 text-lg border rounded"
            >
              All
            </button>

            {ORIENTATION_OPTIONS.map((dir) => (
              <button
                key={dir}
                onClick={() => handleMultiSelect("orientations", dir)}
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

      <GraphPlaceholder />

      {/* PDF Labelled Screenshot */}
      <div className="mt-6 p-4 border rounded bg-white dark:bg-gray-900">
        <h3 className="font-semibold mb-2">PDF Labelled Screenshot</h3>

        <div className="border border-dashed p-6 text-center text-sm text-gray-500">
          Screenshot preview will appear here.
          <br />
          (Exported PDF version of this dashboard)
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveScreen}
          className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
        >
          Save Screen
        </button>
      </div>
    </DashboardLayout>
  );
}
