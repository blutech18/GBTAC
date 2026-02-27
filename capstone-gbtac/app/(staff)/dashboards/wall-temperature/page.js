"use client";

import { useEffect, useState } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import SecondaryNav from "../../../_components/SecondaryNav";
import Navbar from "../../../_components/Navbar";
import Footer from "../../../_components/Footer";
import DatePicker from "../../../_components/DatePicker";
import InfoCard from "../../../_components/InfoCard";
import LineHandler from "../../../_components/graphs/handlers/LineHandler";
import ExportPDFButton from "../../../_components/ExportPDFButton";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import { FiInfo } from "react-icons/fi";


const STORAGE_KEY = "dashboard-wall-temp-v2"; // v2 clears old cached dates
const DEFAULT_FROM = "2018-10-13"; // earliest date in DB
const DEFAULT_TO   = "2025-12-31"; // latest date in DB

// Real wall temperature sensor codes per floor (from building floor plans)
const FLOOR_SENSOR_MAP = {
  "Basement":  ["20003_TL2", "20004_TL2", "20005_TL2", "20006_TL2"],
  "1st Floor": ["20007_TL2", "20008_TL2", "20009_TL2", "20010_TL2", "20011_TL2"],
  "2nd Floor": ["20012_TL2", "20013_TL2", "20014_TL2", "20015_TL2", "20016_TL2", "20016_TL5"],
};
const FLOOR_OPTIONS = Object.keys(FLOOR_SENSOR_MAP);

export default function WallTempDashboard() {
  const [state, setState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, {});
    return {
      fromDate: DEFAULT_FROM,
      toDate: DEFAULT_TO,
      floors: [],
      ...saved,
    };
  });

  const { fromDate, toDate, floors = [] } = state;

  // Compute which sensors to show based on floor selection
  const activeSensors =
    floors.length === 0
      ? Object.values(FLOOR_SENSOR_MAP).flat()
      : floors.flatMap((f) => FLOOR_SENSOR_MAP[f] || []);

  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  const toggleFloor = (floor) => {
    const updated = floors.includes(floor)
      ? floors.filter((f) => f !== floor)
      : [...floors, floor];
    setState((prev) => ({ ...prev, floors: updated }));
  };

  const toggleAllFloors = () => {
    setState((prev) => ({
      ...prev,
      floors: prev.floors.length === FLOOR_OPTIONS.length ? [] : FLOOR_OPTIONS,
    }));
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
      },
      saved: true,
    });
    alert(
      "Dashboard state saved! Your graph settings are restored for next login.",
    );
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <SecondaryNav displayLogout={true} displayProfile={true} displayLogin={false} />
      <Navbar displayDashboards displayHome={false} displayAbout={false} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1
            className="text-4xl font-bold dark:text-black"
            style={{ fontFamily: "var(--font-titillium)" }}
          >
            Wall Temperature Dashboard
          </h1>
          <div className="relative group">
            <FiInfo className="w-10 h-8 text-black cursor-pointer hover:text-gray-700 transition-colors" />
            <div className="absolute right-0 top-8 w-80 p-3 bg-white text-black text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              Wall temperature sensors monitor surface temperatures on building walls across all floors and orientations.
            </div>
          </div>
        </div>

        <InfoCard
          items={[
            { label: "Basement Avg", value: "—" },
            { label: "1st Floor Avg", value: "—" },
            { label: "2nd Floor Avg", value: "—" },
          ]}
        />

        {/* Chart Section */}
        <div className="mt-10 flex flex-col gap-4 relative">
          <div className="flex flex-wrap gap-6 items-end">
            <DatePicker
              fromDate={fromDate}
              toDate={toDate}
              setDate={({ fromDate: f, toDate: t }) =>
                setState((prev) => ({ ...prev, fromDate: f, toDate: t }))
              }
            />

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-black">Floor Levels</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={toggleAllFloors}
                  className={`px-3 py-1 text-sm border rounded transition ${
                    floors.length === FLOOR_OPTIONS.length
                      ? "bg-[#6D2077] text-white border-[#6D2077]"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                {FLOOR_OPTIONS.map((floor) => (
                  <button
                    key={floor}
                    onClick={() => toggleFloor(floor)}
                    className={`px-3 py-1 text-sm border rounded transition ${
                      floors.includes(floor)
                        ? "bg-[#6D2077] text-white border-[#6D2077]"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {floor}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div id="chart-print-area" className="bg-white rounded-lg shadow-md p-4">
            <LineHandler
              key={activeSensors.join(",")}
              sensorList={activeSensors}
              startDate={fromDate || DEFAULT_FROM}
              endDate={toDate || DEFAULT_TO}
              graphTitle="Wall Temperature"
              yTitle="Temperature (°C)"
              xTitle="Time"
            />
          </div>

          <div className="text-sm text-center text-gray-500 mt-2">
            All information is displayed for educational purposes only.
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <ExportPDFButton />
          <button
            onClick={handleSaveScreen}
            className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
          >
            Save Screen
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
