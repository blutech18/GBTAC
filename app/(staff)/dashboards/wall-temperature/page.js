"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import InfoCard from "../../../_components/InfoCard";
import GraphPlaceholder from "../../../_components/GraphPlaceholder";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";

const STORAGE_KEY = "dashboard-wall-temp";

const FLOOR_OPTIONS = ["Basement ", "1st Floor", "2nd Floor"];
const ORIENTATION_OPTIONS = ["North", "South", "East", "West"];
const FLOOR_IMAGES = {
  "Basement ": "/floors/GBTAC-basement-level.png",
  "1st Floor": "/floors/GBTAC-level1.png",
  "2nd Floor": "/floors/GBTAC-level2.png",
};

export default function WallTempDashboard() {
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
      id: "wall-temperature",
      title: "Wall Temperature Dashboard",
      path: "/dashboards/wall-temperature",
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
    <DashboardLayout title="Wall Temperature Dashboard">
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
      <InfoCard
        items={[
          {
            label: "Average Wall Temperature",
            value: (24.356).toFixed(2) + "°C",
          },
          {
            label: "Minimum Wall Temperature",
            value: (20.254).toFixed(2) + "°C",
          },
          {
            label: "Maximum Wall Temperature",
            value: (24.789).toFixed(2) + "°C",
          },
          { label: "Temperature Range", value: (7.7789).toFixed(2) + "°C" },
        ]}
      />

      <GraphPlaceholder />

      {/* PDF Labelled Screenshot */}
      <div className="mt-6 p-4 border rounded bg-white dark:bg-gray-900">
        <h3 className="font-semibold mb-4">Selected Floor Layout</h3>

        {floors.length === 0 ? (
          <div className="border border-dashed p-6 text-center text-sm text-gray-500">
            Select a floor to preview layout.
          </div>
        ) : (
          <div className="flex flex-col gap-4 justify-center">
            {floors.map((floor) =>
              FLOOR_IMAGES[floor] ? ( // only render if the image exists
                <div key={floor} className="text-center">
                  <p className="text-sm mb-2 font-medium">{floor}</p>

                  <Image
                    src={FLOOR_IMAGES[floor]}
                    alt={floor}
                    width={1300}
                    height={500}
                    className="border rounded-lg shadow-md hover:shadow-lg transition"
                  />
                </div>
              ) : null,
            )}
          </div>
        )}
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
