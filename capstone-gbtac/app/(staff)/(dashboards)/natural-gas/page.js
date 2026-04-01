//add whatever X factor is used to convert natural gas units to kWh in the info tooltip
"use client";

import { useState, useEffect, useRef } from "react";

import DashboardLayout from "@/app/_components/DashboardLayout";
import DateRangePicker from "@/app/_components/DatePicker";
import InfoCard from "@/app/_components/InfoCard";
import ExportPDFButton from "@/app/_components/ExportPDFButton";

import NaturalGasHandler from "@/app/_components/graphs/handlers/NaturalGasHandler";

import { useDateValidation } from "@/app/_components/hooks/useDateValidation";

import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import { getDataRange } from "@/app/_utils/get-data-range";

import { FiInfo } from "react-icons/fi";


const dataRange = await getDataRange();
// defaults
const stateDefaults = {
  fromDate: dataRange.newest, 
  toDate: dataRange.newest,
}

export default function Page() {
  const chartRef = useRef(null);
  const chartRef2 = useRef(null);

  const STORAGE_KEY = "dashboard-natural-gas";
  
  //Unit state: kWh or W
  const [unit, setUnit] = useState("kWh");

  const [state, setState] = useState(() =>
    loadDashboardState(STORAGE_KEY, stateDefaults),
  );
   //initialize from saved state so it loads immediately
  const [appliedState, setAppliedState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, { fromDate: stateDefaults.fromDate, toDate: stateDefaults.toDate });
    if (saved.fromDate && saved.toDate) {
      return { fromDate: saved.fromDate, toDate: saved.toDate };
    }
    return null;
  });

  const [aggregation, setAggregation] = useState("none");
  const [dashboardStats, setDashboardStats] = useState(null);
  
  const { errors, validateAll } = useDateValidation({
    earliestDate: "2023-01-04",
    latestDate: dataRange.newest,
  });

  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  //Validate dates on every change to show errors immediately
  useEffect(() => {
    if (state.fromDate && state.toDate) {
      validateAll(state.fromDate, state.toDate);
    }
  }, [  state.fromDate, state.toDate, validateAll]);

  const handleSaveScreen = () => {
    saveDashboardState(STORAGE_KEY, state);

    saveRecentDashboard({
      id: "natural-gas",
      title: "Natural Gas Dashboard",
      path: "/dashboards/natural-gas",
      summary: {
        fromDate: state.fromDate,
        toDate: state.toDate,
        aggregation,
        unit,
      },
      saved: true,
    });

    alert(
      "Dashboard state saved! Your graph settings are restored for next login.",
    );
  };

  const stats = [
    {
      label: "Total Energy Consumption",
      value: dashboardStats?.totalEnergy ?? 0,
    },
    {
      label:
        aggregation === "Y"
          ? "Avg Yearly Natural Gas Usage"
          : "Avg Monthly Natural Gas Usage",
      value: dashboardStats?.avgGas ?? 0,
    },
    {
      label:
        aggregation === "Y"
          ? "Avg Yearly Electricity Usage"
          : "Avg Monthly Electricity Usage",
      value: dashboardStats?.avgElectricity ?? 0,
    },
    {
      label: aggregation === "Y" ? "Peak Energy Year" : "Peak Energy Month",
      value: dashboardStats?.peakMonth ?? "N/A",
    },
  ];

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;

    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day);
  };

  const formatDateRange = (from, to) => {
    if (!from || !to) return null;

    const fromDate = parseLocalDate(from);
    const toDate = parseLocalDate(to);

    const fromFormatted = fromDate.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const toFormatted = toDate.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return `As of: ${fromFormatted} - ${toFormatted}`;
  };

  const formatNumber = (num) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
  });

  // Compute displayed values based on unit
  const displayStats = stats.map((item) => {
    const subtitle = formatDateRange(appliedState?.fromDate, appliedState?.toDate);

    // Keep Peak Energy Month as text
    if (
      item.label === "Peak Energy Month" ||
      item.label === "Peak Energy Year"
    ) {
      let formatted = "N/A";

      if (item.value && item.value !== "N/A") {
        if (aggregation === "Y") {
          formatted = item.value;
        } else {
          const [year, month] = item.value.split("-");

          const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ];

          formatted = `${monthNames[Number(month) - 1]} ${year}`;
        }
      }

      return {
        ...item,
        value: formatted,
        unit: "",
        subtitle,
      };
    }

    // Numeric cards: show dash until loaded
    if (typeof item.value === "number") {
      const hasLoadedStats = dashboardStats !== null;

      if (!hasLoadedStats) {
        return {
          ...item,
          value: "-",
          unit,
          subtitle,
        };
      }

      const convertedValue = unit === "W" ? item.value * 1000 : item.value;

      return {
        ...item,
        value: formatNumber(convertedValue),
        unit,
        subtitle,
      };
    }

    return {
      ...item,
      value: item.value ?? "N/A",
      unit: "",
      subtitle,
    };
  });

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
            <div className="text-sm text-gray-700 leading-relaxed space-y-1">
              <p>
                Natural gas values are converted from GJ to kWh
                (1 GJ = 277.78 kWh).
              </p>
              <p>
                Values can be toggled between kWh and W
                (1&nbsp;kWh = 1000&nbsp;W).
              </p>
              <p>
                Total energy combines natural gas with electricity sensor
                30000_TL342.
              </p>
            </div>
          </div>
        </button>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-6 items-end mb-6">
          <DateRangePicker
            fromDate={state.fromDate}
            toDate={state.toDate}
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
                setAppliedState({ fromDate, toDate });
              } else {
                setAppliedState(null);
              }
            }}
            aggregation={aggregation}
            setAggregation={setAggregation}
            aggregationOptions={[
              { value: "none", label: "None" },
              { value: "Y", label: "Yearly" },
            ]}
          />
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
          {appliedState ? (
            <>
              <NaturalGasHandler
                startDate={appliedState?.fromDate}
                endDate={appliedState?.toDate}
                unit={unit}
                aggregation={aggregation}
                onStatsReady={setDashboardStats}
                chartRef={chartRef}
                chartRef2={chartRef2}
              />

            </>
          ) : (
            <div className="h-87.5 flex items-center justify-center text-gray-400 text-sm">
              Select a valid date range to load charts.
            </div>
          )}

          <div className="flex justify-end gap-4 mt-3">
            <button
              onClick={handleSaveScreen}
              className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
            >
              Save Screen
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
