"use client";

import { useState } from "react";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import InfoCard from "../../../_components/InfoCard";
import GraphPlaceholder from "../../../_components/GraphPlaceholder";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";

const STORAGE_KEY = "dashboard-water-level";

export default function WaterLevelDashboard() {
  const [state, setState] = useState(() =>
    loadDashboardState(STORAGE_KEY, {
      fromDate: "",
      toDate: "",
      visibleGraphs: {},
    }),
  );

  const { fromDate, toDate } = state;

  const handleStateChange = (newState) => {
    setState(newState);
    saveDashboardState(STORAGE_KEY, newState);
  };

  const handleSaveScreen = () => {
    saveDashboardState(STORAGE_KEY, state);

    saveRecentDashboard({
      id: "water-level",
      title: "Cistern Level Dashboard",
      path: "/dashboards/water-level",
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
    <DashboardLayout title="Cistern Level Dashboard">
      <InfoCard
        items={[
          { label: "Current Level", value: "82%" },
          { label: "Daily Avg", value: "78%" },
          { label: "Past 7 Days Max", value: "95%" },
          { label: "Difference vs Yesterday", value: "+2%" },
        ]}
      />

      <DatePicker
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={(v) => handleStateChange({ ...state, fromDate: v })}
        setToDate={(v) => handleStateChange({ ...state, toDate: v })}
      />

      <GraphPlaceholder />

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
