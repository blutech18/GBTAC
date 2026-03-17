"use client";

//add whatever X factor is used to convert natural gas units to kWh in the info tooltip
import { useState, useEffect } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import DashboardLayout from "@/app/_components/DashboardLayout";
import DateRangePicker from "@/app/_components/DatePicker";
import GraphPlaceholder from "@/app/_components/GraphPlaceholder";
import InfoCard from "@/app/_components/InfoCard";
import ExportPDFButton from "@/app/_components/ExportPDFButton";
import { FiInfo } from "react-icons/fi";
import { useRef } from "react";

export default function Page() {
  const chartRef = useRef(null);
  const chartRef2 = useRef(null);

  const STORAGE_KEY = "dashboard-natural-gas";
   // Unit state: kWh or W
  const [unit, setUnit] = useState("kWh");

  const [state, setState] = useState(() =>
    loadDashboardState(STORAGE_KEY, {
      fromDate: "",
      toDate: "",
      floors: [],
      orientations: [],
    }),
  );

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
    saveDashboardState(STORAGE_KEY, state);

    saveRecentDashboard({
      id: "natural-gas",
      title: "Natural Gas Dashboard",
      path: "/dashboards/natural-gas",
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

    const stats = [
    { label: "Total Energy Consumption", value: 134350 },
    { label: "Avg Monthly Natural Gas Usage", value: 820 },
    { label: "Avg Monthly Electricity Usage", value: 10375 },
    { label: "Peak Energy Month", value: "January" },
  ];
   // Compute displayed values based on unit
  const displayStats = stats.map((item) => ({
    ...item,
    value: unit === "W" ? item.value * 1000 : item.value,
    unit: unit,
  }));

  return (
    <DashboardLayout
      title="Natural Gas Dashboard"
      titleRight={
        <button
          type="button"
          className="group relative block h-6 w-6 text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Natural gas conversion info"
        >
          <FiInfo className="h-6 w-6" />
          <div className="pointer-events-none absolute right-0 top-8 w-80 p-3 bg-white text-black text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Values are converted to kWh using a standard conversion factor of X
            kWh per unit of gas.
          </div>
        </button>
      }
    >
      <div className="container mx-auto px-4 py-8" style={{ fontFamily: "var(--font-titillium)" }}>
        <div className="flex flex-wrap gap-6 items-end mb-6">
          <DateRangePicker />
          <div className="mb-6">
  
          </div>
        </div>

        <InfoCard
          colsClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          items={displayStats}
        />
        <div className="flex justify-center mb-6 lg:justify-start">
          <button
            onClick={() => setUnit(unit === "kWh" ? "W" : "kWh")}
            className="px-4 py-2 bg-[#005EB8] text-white rounded hover:bg-[#004080] transition"
          >
            Toggle Units: {unit}
          </button>
      </div>

        <div className="mt-10 flex flex-col gap-4 relative">
            <div ref={chartRef}>
              <GraphPlaceholder />
            </div>
            <div className="flex justify-end gap-4 mt-3">
              <ExportPDFButton chartRef={chartRef} fileName="natural-gas-chart" />
            </div>
            <div ref={chartRef2}>
              <GraphPlaceholder />
            </div>
            <div className="flex justify-end gap-4 mt-3">
                <button
                  onClick={handleSaveScreen}
                  className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
                >
                  Save Screen
                </button>
            <ExportPDFButton chartRef={chartRef2} fileName="natural-gas-chart-2" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
