"use client";

import { useEffect, useState } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import LineHandler from "../../../_components/graphs/handlers/LineHandler";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import { useDateValidation } from "../../../_components/hooks/useDateValidation";

const STORAGE_KEY = "dashboard-wall-temp";
const DEFAULT_FROM_DATE = "2018-10-13";
const DEFAULT_TO_DATE = "2025-12-31";

// Mapping for the 24 Wall sensors derived from database naming
const FLOOR_SENSOR_MAP = {
  Basement: [
    "30000_TL57",
    "30000_TL56",
    "30000_TL55", // East Basement
    "30000_TL39",
    "30000_TL38", // North Basement
    "30000_TL69",
    "30000_TL68",
    "30000_TL67",
    "30000_TL66",
    "30000_TL95", // South Basement
  ],
  "1st Floor": [
    "30000_TL90", // North 1st floor
    "30000_TL71",
    "30000_TL70", // South 1st floor
    "30000_TL65",
    "30000_TL64",
    "30000_TL63",
    "30000_TL62",
    "30000_TL61",
    "30000_TL60",
    "30000_TL59",
    "30000_TL58", // West 1st floor
  ],
  "2nd Floor": [],
};

const SENSOR_ORIENTATION = {
  "30000_TL57": "East",
  "30000_TL56": "East",
  "30000_TL55": "East",
  "30000_TL39": "North",
  "30000_TL38": "North",
  "30000_TL90": "North",
  "30000_TL69": "South",
  "30000_TL68": "South",
  "30000_TL67": "South",
  "30000_TL66": "South",
  "30000_TL95": "South",
  "30000_TL71": "South",
  "30000_TL70": "South",
  "30000_TL62": "West",
  "30000_TL61": "West",
  "30000_TL60": "West",
  "30000_TL59": "West",
  "30000_TL58": "West",
  "30000_TL65": "West",
  "30000_TL64": "West",
  "30000_TL63": "West",
};

const SENSOR_LABELS = {
  // Basement East
  "30000_TL57": "East 1 Basement",
  "30000_TL56": "East 2 Basement",
  "30000_TL55": "East 3 Basement",

  // Basement North
  "30000_TL39": "North 1 Basement",
  "30000_TL38": "North 2 Basement",

  // Basement South
  "30000_TL69": "South 1 Basement",
  "30000_TL68": "South 2 Basement",
  "30000_TL67": "South 3 Basement",
  "30000_TL66": "South 4 Basement",
  "30000_TL95": "South 5 Basement",

  // 1st Floor
  "30000_TL90": "North 1st Floor",
  "30000_TL71": "South 1 1st Floor",
  "30000_TL70": "South 2 1st Floor",
  "30000_TL65": "West 1 1st Floor",
  "30000_TL64": "West 2 1st Floor",
  "30000_TL63": "West 3 1st Floor",
  "30000_TL62": "West 4 1st Floor",
  "30000_TL61": "West 5 1st Floor",
  "30000_TL60": "West 6 1st Floor",
  "30000_TL59": "West 7 1st Floor",
  "30000_TL58": "West 8 1st Floor",
};

const FLOOR_OPTIONS = ["Basement", "1st Floor", "2nd Floor"];
const ORIENTATION_OPTIONS = ["North", "South", "East", "West"];

export default function WallTempDashboard() {
  const [state, setState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, {});
    return {
      fromDate: saved.fromDate || DEFAULT_FROM_DATE,
      toDate: saved.toDate || DEFAULT_TO_DATE,
      floors: saved.floors || [],
      orientations: saved.orientations || [],
    };
  });

  //initialize from saved state so chart loads immediately
  const [appliedState, setAppliedState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, {});
    return {
      fromDate: saved.fromDate || DEFAULT_FROM_DATE,
      toDate: saved.toDate || DEFAULT_TO_DATE,
      floors: saved.floors || [],
      orientations: saved.orientations || [],
    };
  });

  const { errors, validateAll } = useDateValidation({
    earliestDate: "2018-10-13",
    latestDate: "2026-01-07",
  });

  const { fromDate, toDate, floors = [], orientations = [] } = state;


  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  //validate dates on every change to show errors immediately
  useEffect(() => {
    if (state.fromDate && state.toDate) {
      validateAll(state.fromDate, state.toDate);
    }
  }, [  state.fromDate, state.toDate, validateAll]);

  const floorFiltered = !appliedState
    ? []
    : appliedState.floors.length === 0
      ? Object.values(FLOOR_SENSOR_MAP).flat()
      : appliedState.floors.flatMap((f) => FLOOR_SENSOR_MAP[f] || []);

  const activeSensors = !appliedState
    ? []
    : appliedState.orientations.length === 0
      ? floorFiltered
      : floorFiltered.filter((code) =>
          appliedState.orientations.includes(SENSOR_ORIENTATION[code]),
        );

  const handleMultiSelect = (key, value) => {
    setState((prev) => {
      const currentValues = prev[key] || [];

      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      const optionOrder =
        key === "floors" ? FLOOR_OPTIONS : ORIENTATION_OPTIONS;

      const sortedValues = optionOrder.filter((option) =>
        updatedValues.includes(option),
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
    saveDashboardState(STORAGE_KEY, state);

    saveRecentDashboard({
      id: "wall-temperature",
      title: "Wall Temperature Dashboard",
      path: "/wall-temperature?from=staff-welcome-page",
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

  const [aggregation, setAggregation] = useState("none");

  return (
    <DashboardLayout title="Wall Temperature Dashboard">
      <div className="flex flex-wrap gap-6 items-start mb-6">
        <div>
          <DatePicker
            fromDate={fromDate}
            toDate={toDate}
            errors={errors}
            onDateChange={(field, value) => {
              setState((prev) => ({
                ...prev,
                [field === "from" ? "fromDate" : "toDate"]: value,
              }));
            }}
            setDate={({ fromDate, toDate }) => {
              const nextState = { ...state, fromDate, toDate };
              setState(nextState);

              if (fromDate && toDate && validateAll(fromDate, toDate)) {
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
            aggregation={aggregation}
            setAggregation={setAggregation}
          />
        </div>

        <div>
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

        <div>
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

      <div
        id="chart-print-area"
        className="bg-white rounded-lg shadow-md p-4 mt-6"
      >
        {appliedState && activeSensors.length > 0 ? (
          <LineHandler
            key={`${appliedState.fromDate}-${appliedState.toDate}-${activeSensors.join(",")}`}
            sensorList={activeSensors}
            sensorLabels={SENSOR_LABELS}
            startDate={appliedState.fromDate}
            endDate={appliedState.toDate}
            graphTitle="Wall Temperature"
            yTitle="Temperature (°C)"
            xTitle="Time"
            aggTime={aggregation}
            aggType={"mean"}
          />
        ) : (
          <div className="h-87.5 flex items-center justify-center text-gray-400 text-sm">
            Graph Placeholder
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
