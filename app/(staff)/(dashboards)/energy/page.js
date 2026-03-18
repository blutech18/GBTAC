"use client";

import { useEffect, useState } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import Carousel from "../../../_components/Carousel";
import TimeGranularityDropdown from "@/app/_components/TimeGranularityDropdown";
import { useDateValidation } from "../../../_components/hooks/useDateValidation";

import LineHandler from "@/app/_components/graphs/handlers/LineHandler";
import PieHandler from "@/app/_components/graphs/handlers/PieHandler";
import InfoCard from "@/app/_components/InfoCard";

const STORAGE_KEY = "dashboard-energy";

export default function EnergyDashboard() {
  const [state, setState] = useState(() =>
    loadDashboardState(STORAGE_KEY, { fromDate: "", toDate: "" })
  );

  //initialize from saved state so charts load immediately on page load
  const [appliedState, setAppliedState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, { fromDate: "", toDate: "" });
    if (saved.fromDate && saved.toDate) {
      return { fromDate: saved.fromDate, toDate: saved.toDate };
    }
    return null;
  });

  //errors from date validation
  const { errors, setErrors, validate, validateAll } = useDateValidation({
    earliestDate: "2019-02-13",
    latestDate: "2026-01-8",
  });


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
  // Unit state: kWh or W
  const [unit, setUnit] = useState("kWh");

  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  // Base stats
  const stats = [
    { label: "Average", value: 98 },
    { label: "Minimum", value: 180 },
    { label: "Maximum", value: 950 },
    { label: "Utility Bill Calgary kWh", value: 1234 },
  ];

  // Compute displayed values based on unit
  const displayStats = stats.map((item) => ({
    ...item,
    value: unit === "W" ? item.value * 1000 : item.value,
    unit: unit,
    subtitle: formatDateRange(appliedState?.fromDate, appliedState?.toDate),
  }));

  const handleSaveScreen = () => {
    saveDashboardState(STORAGE_KEY, state);
    saveRecentDashboard({
      id: "energy",
      title: "Energy Dashboard",
      path: "/energy?from=staff-welcome-page",
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
      <div className="flex flex-wrap gap-6 items-end mb-6">
      <DatePicker
        fromDate={state.fromDate}
        toDate={state.toDate}
        errors={errors}
        onDateChange={(field, value, otherDate) => {
          //validate on every change, shows errors immediately
          setErrors((prev) => ({ ...prev, [field]: validate(field, value, otherDate) }));
        }}
        setDate={({ fromDate, toDate }) => {
          const nextState = { ...state, fromDate, toDate };
          setState(nextState);

            if (fromDate && toDate && validateAll(fromDate, toDate)) {
              setAppliedState({ fromDate, toDate });
            } else {
              setAppliedState(null);
            }
          }}
        />
        <div>
          <label className="block text-sm font-medium mb-1">
            Time Interval
          </label>
          <TimeGranularityDropdown />
        </div>
      </div>
      <div className="lg:hidden mb-6">
        <Carousel items={displayStats} horizontal />
      </div>
      <div className="hidden lg:block">
        <InfoCard
          colsClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          items={displayStats}
        />
      </div>
      <div className="flex justify-center mb-6 lg:justify-start">
        <button
          onClick={() => setUnit(unit === "kWh" ? "W" : "kWh")}
          className="px-4 py-2 bg-[#005EB8] text-white rounded hover:bg-[#004080] transition"
        >
          Toggle Units: {unit}
        </button>
      </div>
      {/* Graphs */}

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
        <LineHandler
          chartType={"line"}
          sensorList={[
            "30000_TL340", // GBT Generation Hourly Wh
            "30000_TL341", // GBT Consumption Hourly Wh
            "30000_TL339", // GBT Net Energy Hourly Wh
          ]}
          startDate={appliedState?.fromDate}
          endDate={appliedState?.toDate}
          graphTitle={`Consumption vs Generation, ${appliedState?.fromDate} to ${appliedState?.toDate}`}
          yTitle={"Wh"}
          xTitle={"hours"}
          xUnit={"hour"}
          aggTime={"none"}
          aggType={"sum"}
        />

        <PieHandler
          sensorList={[
            "30000_TL252", // PV-CarportSolar_Total
            "30000_TL253", // PV-RooftopSolar_Total
          ]}
          startDate={appliedState?.fromDate}
          endDate={appliedState?.toDate}
          graphTitle={`Solar Panel Generation, ${appliedState?.fromDate} to ${appliedState?.toDate < "2025-12-31" ? appliedState?.toDate : "2025-12-31"}`}
          label={"kWh"} // **check: unsure if right unit
        />
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
