"use client";

import { useEffect, useState } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import LineHandler from "../../../_components/graphs/handlers/LineHandler";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import { useDateValidation } from "../../../_components/hooks/useDateValidation";
import { getDataRange } from "@/app/_utils/get-data-range";

// ****BUG****Top-level await is not supported in "use client" components — getDataRange
// should be called inside a useEffect or fetched server-side and passed as a prop
const dataRange = await getDataRange();
const STORAGE_KEY = "dashboard-wall-temp";
const DEFAULT_FROM_DATE = "2018-10-13";
const DEFAULT_TO_DATE = dataRange.newest;

// 24 wall sensors mapped by floor, derived from database naming conventions.
// ****BUG****
// 2nd Floor is in FLOOR_OPTIONS but has an empty array in FLOOR_SENSOR_MAP —
// Selecting it will silently produce zero sensors with no feedback to the user.
// This should either be removed from FLOOR_OPTIONS or have a disabled state in the UI until sensors are added.
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

/**
 * WallTempDashboard
 *
 * Dashboard page for visualising wall temperature readings across 24 GBTAC
 * building sensors. Allows filtering by date range, floor level, and cardinal
 * orientation, then renders a line chart for the active sensor set.
 *
 * Notes:
 * - State is split into `state` (staged) and `appliedState` (committed).
 *   Unlike other dashboards, appliedState is never null — it initialises
 *   directly from saved state or defaults so the chart loads immediately.
 * - Floor and orientation filters apply immediately on toggle without requiring
 *   Apply, because they filter the already-fetched sensor list client-side.
 * - Sensor list is derived in two steps: floor filter → orientation filter.
 *   An empty selection in either dimension means "all" for that dimension.
 * - The Save Screen button persists the current state to localStorage and also
 *   saves a record to the Recent Dashboards list with a summary of the current filters.
 *
 * @author Cintya Lara Flores
 * @author Dominique Lee
 */
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
  // ****CHECK*** appliedState is never null on first load — Unlike AmbientTempDashboard,
  // this dashboard initialises appliedState directly from saved state (or defaults),
  // so it can never be null. The !appliedState guards on floorFiltered and activeSensors
  // are therefore dead code. Worth aligning with the other dashboards for consistency.
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
    latestDate: dataRange.forecast,
  });

  const { fromDate, toDate, floors = [], orientations = [] } = state;

  // Persist staged state on every change so settings survive a page reload
  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  // Re-run validation on every date change to keep error UI current
  useEffect(() => {
    if (state.fromDate && state.toDate) {
      validateAll(state.fromDate, state.toDate);
    }
  }, [state.fromDate, state.toDate, validateAll]);

  // Step 1: resolve sensor codes for the selected floors (empty = all floors)
  const floorFiltered = !appliedState
    ? []
    : appliedState.floors.length === 0
      ? Object.values(FLOOR_SENSOR_MAP).flat()
      : appliedState.floors.flatMap((f) => FLOOR_SENSOR_MAP[f] || []);

  // Step 2: narrow by orientation (empty = all orientations)
  const activeSensors = !appliedState
    ? []
    : appliedState.orientations.length === 0
      ? floorFiltered
      : floorFiltered.filter((code) =>
          appliedState.orientations.includes(SENSOR_ORIENTATION[code]),
        );

  // Toggles a single value in a multi-select filter and immediately applies it
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

  // Selects all options for a dimension, or clears it if all are already selected
  const handleSelectAll = (key, options) => {
    setState((prev) => {
      const currentValues = prev[key] || [];

      // Toggle: if everything is already selected, deselect all
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

  // Saves the current dashboard state to localStorage and also records a summary in the Recent Dashboards list
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
      {/* ── Controls row: date range, floor filter, orientation filter ── */}
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
                // Invalid range — clear applied state so the chart is hidden
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

      {/* ── Line chart — keyed on dates + sensor list to force remount on change ── */}
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
