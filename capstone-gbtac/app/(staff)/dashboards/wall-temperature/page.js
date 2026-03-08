"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import InfoCard from "../../../_components/InfoCard";
import LineHandler from "../../../_components/graphs/handlers/LineHandler";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import {
  FLOOR_OPTIONS,
  ORIENTATION_OPTIONS,
  FLOOR_SENSOR_MAP,
  SENSOR_ORIENTATION,
} from "./wallSensorConfig";

const STORAGE_KEY = "dashboard-wall-temp";
const API_ENDPOINT = "http://127.0.0.1:8000";

const FLOOR_IMAGES = {
  Basement: "/floors/GBTAC-basement-level.png",
  "1st Floor": "/floors/GBTAC-level1.png",
  "2nd Floor": "/floors/GBTAC-level2.png",
  Roof: "/floors/GBTAC-level2.png", // reuse or add roof image when available
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

  const [appliedState, setAppliedState] = useState(null);
  // Wall sensors from API (same data as ambient) — client: "yung data sa ambient, same lang sa wall"
  const [apiWallSensors, setApiWallSensors] = useState([]);

  const { fromDate, toDate, floors = [], orientations = [] } = state;
  const useApiWallSensors = apiWallSensors.length > 0;

  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  useEffect(() => {
    fetch(`${API_ENDPOINT}/graphs/sensors/wall`)
      .then((r) => r.json())
      .then((list) => Array.isArray(list) && setApiWallSensors(list))
      .catch(() => setApiWallSensors([]));
  }, []);

  // When API returns wall sensors (e.g. 24 with data), use them; else use 74 from config
  const floorFiltered =
    !appliedState
      ? []
      : useApiWallSensors
        ? apiWallSensors.map((s) => s.code)
        : appliedState.floors.length === 0
          ? Object.values(FLOOR_SENSOR_MAP).flat()
          : appliedState.floors.flatMap((f) => FLOOR_SENSOR_MAP[f] || []);

  const activeSensors =
    !appliedState
      ? []
      : useApiWallSensors
        ? floorFiltered
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
      const nextState = { ...prev, [key]: updatedValues };

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
          setDate={({ fromDate, toDate }) => {
            const nextState = { ...state, fromDate, toDate };
            setState(nextState);

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

        {useApiWallSensors && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Using {apiWallSensors.length} wall sensors (same data source as ambient).
          </p>
        )}

        {!useApiWallSensors && (
          <>
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
          </>
        )}
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

      <div id="chart-print-area" className="bg-white rounded-lg shadow-md p-4 mt-6">
        {appliedState && activeSensors.length > 0 ? (
          <LineHandler
            key={`${appliedState.fromDate}-${appliedState.toDate}-${activeSensors.join(",")}`}
            sensorList={activeSensors}
            startDate={appliedState.fromDate}
            endDate={appliedState.toDate}
            graphTitle="Wall Temperature"
            yTitle="Temperature (°C)"
            xTitle="Time"
          />
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-400 text-sm">
            Select date range and at least one floor or orientation to view the graph.
          </div>
        )}
      </div>

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
              FLOOR_IMAGES[floor] ? (
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
