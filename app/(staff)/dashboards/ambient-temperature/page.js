"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import InfoCard from "../../../_components/InfoCard";
import LineHandler from "../../../_components/graphs/handlers/LineHandler";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import Carousel from "@/app/_components/Carousel";

const STORAGE_KEY = "dashboard-ambient-temp";

// 13 sensors mapped by floor from building floor plans
const FLOOR_SENSOR_MAP = {
  Basement: ["20004_TL2", "20005_TL2", "20006_TL2"],
  "1st Floor": ["20007_TL2", "20008_TL2", "20009_TL2", "20010_TL2", "20011_TL2"],
  "2nd Floor": ["20012_TL2", "20013_TL2", "20014_TL2", "20015_TL2", "20016_TL2"],
};

// Orientation derived from display names in sensor_names table
const SENSOR_ORIENTATION = {
  "20004_TL2": "East",   // East 1 Basement
  "20005_TL2": "West",   // West Basement
  "20006_TL2": "East",   // East 2 Basement
  "20007_TL2": "North",  // North (West) 1st Floor
  "20008_TL2": "South",  // South 1 1st Floor
  "20009_TL2": "South",  // South 2 1st Floor
  "20010_TL2": "East",   // East 1st Floor
  "20011_TL2": "Middle", // Middle 1st Floor
  "20012_TL2": "West",   // West 2nd Floor
  "20013_TL2": "Middle", // Middle 2nd Floor
  "20014_TL2": "East",   // East 2nd Floor
  "20015_TL2": "South",  // South 1 2nd Floor
  "20016_TL2": "South",  // South 2 2nd Floor
};

const SENSOR_LABELS = {
  "20004_TL2": "East 1 Basement",
  "20005_TL2": "West Basement",
  "20006_TL2": "East 2 Basement",
  "20007_TL2": "North (West) 1st Floor",
  "20008_TL2": "South 1 1st Floor",
  "20009_TL2": "South 2 1st Floor",
  "20010_TL2": "East 1st Floor",
  "20011_TL2": "Middle 1st Floor",
  "20012_TL2": "West 2nd Floor",
  "20013_TL2": "Middle 2nd Floor",
  "20014_TL2": "East 2nd Floor",
  "20015_TL2": "South 1 2nd Floor",
  "20016_TL2": "South 2 2nd Floor"
};

const formatAsOf = (ts, sensorCode) => {
  if (!ts) return null;
  const formatted = new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const sensorName = SENSOR_LABELS[sensorCode] || sensorCode;
  return `As of ${formatted} ${sensorName}`;
};

const FLOOR_OPTIONS = ["Basement", "1st Floor", "2nd Floor"];
const ORIENTATION_OPTIONS = ["North", "South", "East", "West", "Middle"];
const FLOOR_IMAGES = {
  Basement: "/floors/GBTAC-basement-level.png",
  "1st Floor": "/floors/GBTAC-level1.png",
  "2nd Floor": "/floors/GBTAC-level2.png",
};

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

  const [appliedState, setAppliedState] = useState(null);
  const [kpiStats, setKpiStats] = useState(null);

  const handleStatsReady = useCallback((stats) => setKpiStats(stats), []);

  const { fromDate, toDate, floors = [], orientations = [] } = state;

  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  // Step 1: filter by floor (empty = all floors after Apply)
  const floorFiltered =
    !appliedState
      ? []
      : appliedState.floors.length === 0
        ? Object.values(FLOOR_SENSOR_MAP).flat()
        : appliedState.floors.flatMap((f) => FLOOR_SENSOR_MAP[f] || []);

  // Step 2: filter by orientation (empty = all orientations)
  const activeSensors =
    !appliedState
      ? []
      : appliedState.orientations.length === 0
        ? floorFiltered
        : floorFiltered.filter((code) =>
            appliedState.orientations.includes(SENSOR_ORIENTATION[code]),
          );

  const handleMultiSelect = (key, value) => {
    setKpiStats(null);
    setState((prev) => {
      const currentValues = prev[key] || [];

      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      const optionOrder =
        key === "floors" ? FLOOR_OPTIONS : ORIENTATION_OPTIONS;

      const sortedValues = optionOrder.filter((option) =>
        updatedValues.includes(option)
      );

      const nextState = { ...prev, [key]: sortedValues };

      if (nextState.fromDate && nextState.toDate) {
        setAppliedState({
          fromDate: nextState.fromDate,
          toDate: nextState.toDate,
          floors: nextState.floors,
          orientations: nextState.orientations,
        });
      }

      return nextState;
    });
  };

  const handleSelectAll = (key, options) => {
    setKpiStats(null);
    setState((prev) => {
      const currentValues = prev[key] || [];

      const updatedValues =
        currentValues.length === options.length ? [] : [...options];

      const nextState = {
        ...prev,
        [key]: updatedValues,
      };

      if (nextState.fromDate && nextState.toDate) {
        setAppliedState({
          fromDate: nextState.fromDate,
          toDate: nextState.toDate,
          floors: nextState.floors,
          orientations: nextState.orientations,
        });
      }

      return nextState;
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
      <div className="flex flex-wrap gap-6 items-end mb-6">
        <DatePicker
          fromDate={fromDate}
          toDate={toDate}
          setDate={({ fromDate, toDate }) => {
            const nextState = { ...state, fromDate, toDate };
            setState(nextState);
            setKpiStats(null);

            if (fromDate && toDate) {
              setAppliedState({
                fromDate,
                toDate,
                floors: nextState.floors,
                orientations: nextState.orientations,
              });
            } else {
              setAppliedState(null);
            }
          }}
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
            label: "Average Building Temperature",
            value: kpiStats ? kpiStats.avg.toFixed(2) + "°C" : "—",
            subtitle: null,
          },
          {
            label: "High",
            value: kpiStats ? kpiStats.max.toFixed(2) + "°C" : "—",
            subtitle: kpiStats ? formatAsOf(kpiStats.maxTs, kpiStats.maxSensorCode) : null,
          },
          {
            label: "Low",
            value: kpiStats ? kpiStats.min.toFixed(2) + "°C" : "—",
            subtitle: kpiStats ? formatAsOf(kpiStats.minTs, kpiStats.minSensorCode) : null,
          },
        ]}
      />

      <div id="chart-print-area" className="bg-white rounded-lg shadow-md p-4 mt-6">
        {appliedState && activeSensors.length > 0 ? (
          <LineHandler
            key={`${appliedState.fromDate}-${appliedState.toDate}-${activeSensors.join(",")}`}
            sensorList={activeSensors}
            sensorLabels={SENSOR_LABELS}
            startDate={appliedState.fromDate}
            endDate={appliedState.toDate}
            graphTitle="Ambient Temperature"
            yTitle="Temperature (°C)"
            xTitle="Time"
            onStatsReady={handleStatsReady}
          />
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-400 text-sm">
            Graph Placeholder
          </div>
        )}
      </div>

      <div className="mt-6 p-4 border rounded bg-white dark:bg-gray-900">
        <h3 className="font-semibold mb-4">Selected Floor Layout</h3>

        {floors.length === 0 ? (
          <div className="border border-dashed p-6 text-center text-sm text-gray-500">
            Select a floor to preview layout.
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            {floors.map((floor) =>
              FLOOR_IMAGES[floor] ? ( // only render if the image exists
                <div key={floor} className="text-center mt-8">
                  <p className="text-xl mb-2 font-medium">{floor}</p>

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
