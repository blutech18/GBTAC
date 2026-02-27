"use client";

import { useEffect, useState } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import CardCarousel from "../../../_components/CardCarousel";
import GraphPlaceholder from "../../../_components/GraphPlaceholder";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";

import LineHandler from "@/app/_components/graphs/handlers/LineHandler";

const STORAGE_KEY = "dashboard-energy";

export default function EnergyDashboard() {
  const [state, setState] = useState(() =>
    loadDashboardState(STORAGE_KEY, {
      fromDate: "",
      toDate: "",
    }),
  );

  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  const handleSaveScreen = () => {
    saveDashboardState(STORAGE_KEY, state);
    saveRecentDashboard({
      id: "energy",
      title: "Energy Dashboard",
      path: "/dashboards/energy",
      summary: {
        fromDate: state.fromDate,
        toDate: state.toDate,
        graphs: Object.keys(state.visibleGraphs || {}).filter(
          (g) => state.visibleGraphs[g],
        ),
      },
      saved: true,
    });

    alert(
      "Dashboard state saved! Your graph settings are restored for next login.",
    );
  };

  return (
    <DashboardLayout title="Energy Dashboard">
      <CardCarousel
        items={[
          { label: "Current Usage", value: "120 kWh" },
          { label: "Daily Avg", value: "98 kWh" },
          { label: "Peak Usage", value: "180 kWh" },
          { label: "Approximate Cost", value: "$14.20" },
          { label: "Total Energy", value: "950 kWh" },
          { label: "Utility Bill Calgary kWh", value: "1234 kWh" },
        ]}
        horizontal
      />

      <DatePicker
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <GraphPlaceholder />
        <GraphPlaceholder />
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveScreen}
          className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
        >
          Save Screen
        </button>
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
