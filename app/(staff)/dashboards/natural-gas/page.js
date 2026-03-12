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
      <div className="container mx-auto px-4 py-8"
      style={{ fontFamily: "var(--font-titillium)" }}>
        <DateRangePicker />
        <InfoCard
          items={[
            { label: "Total Energy Consumption", value: "134,350 kWh" },
            { label: "Avg Monthly Natural Gas Usage", value: "820 kWh" },
            { label: "Avg Monthly Electricity Usage", value: "10,375 kWh" },
            { label: "Peak Energy Month", value: "January" },
          ]}
        />
        {/* Chart Section */}
        <div className="mt-10 flex flex-col gap-4 relative">
            <div ref={chartRef}>
              <GraphPlaceholder />
            </div>
            <div className="flex justify-end gap-4 mt-3">
                <button
                  onClick={handleSaveScreen}
                  className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
                >
                  Save Screen
                </button>
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
