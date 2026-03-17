"use client";

import { useState } from "react";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import InfoCard from "../../../_components/InfoCard";
import GraphPlaceholder from "../../../_components/GraphPlaceholder";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import Carousel from "@/app/_components/Carousel";

const STORAGE_KEY = "dashboard-water-level";

export default function WaterLevelDashboard() {
  const [appliedState, setAppliedState] = useState(null);
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

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;

    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day); // local time ✅
  };

  const formatDateRange = (from, to) => {
    if (!from || !to) return null;

    const fromDate = parseLocalDate(from);
    const toDate = parseLocalDate(to);

    const fromFormatted = fromDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });

    const toFormatted = toDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });

    return `As of: ${fromFormatted} - ${toFormatted}`;
  };

  const stats = [
    {
      label: "Average Level",
      value: 82,
      unit: "%",
      subtitle: formatDateRange(appliedState?.fromDate, appliedState?.toDate),
    },
    {
      label: "Maximum Level",
      value: 78,
      unit: "%",
      subtitle: formatDateRange(appliedState?.fromDate, appliedState?.toDate),
    },
    {
      label: "Minimum Level",
      value: 95,
      unit: "%",
      subtitle: formatDateRange(appliedState?.fromDate, appliedState?.toDate),
    },
  ];

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
      <DatePicker
        fromDate={fromDate}
        toDate={toDate}
        setDate={({ fromDate, toDate }) => {
          const nextState = { ...state, fromDate, toDate };
          handleStateChange(nextState);

          if (fromDate && toDate) {
            setAppliedState({ fromDate, toDate });
          } else {
            setAppliedState(null);
          }
        }}
      />
      <div className="lg:hidden mb-6">
        <Carousel items={stats} horizontal />
      </div>
      <div className="hidden lg:block">
        <InfoCard
          colsClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          items={stats}
        />
      </div>
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
