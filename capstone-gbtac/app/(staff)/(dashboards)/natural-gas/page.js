"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/app/_components/DashboardLayout";
import DateRangePicker from "@/app/_components/DatePicker";
import InfoCard from "@/app/_components/InfoCard";
import ExportPDFButton from "@/app/_components/ExportPDFButton";
import NotificationModal from "@/app/_components/NotificationModal";

import NaturalGasHandler from "@/app/_components/graphs/handlers/NaturalGasHandler";
import { useDateValidation } from "@/app/_components/hooks/useDateValidation";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import { getDataRange } from "@/app/_utils/get-data-range";

import { FiInfo } from "react-icons/fi";

const dataRange = await getDataRange();

// Default state uses latest available data
const stateDefaults = {
  fromDate: dataRange.newest,
  toDate: dataRange.newest,
};

/**
 * NaturalGasDashboardPage
 *
 * Main dashboard page for visualizing natural gas and electricity consumption.
 * Displays data over a selected date range with unit conversion (GJ → kWh)
 * and optional aggregation (None or Yearly). Shows charts and summary statistics.
 *
 * Handles date selection, aggregation, unit conversion, and state persistence.
 * Dashboard state is stored locally and can be reused across sessions.
 *
 * Notes:
 * - Maintains both 'state' (user edits) and 'appliedState' (used for charts)
 *   to prevent unnecessary re-renders from invalid ranges.
 * - Unit toggle (kWh ↔ W) is client-side only and does not affect stored data.
 * - Natural gas values are converted from GJ to kWh (1 GJ = 277.78 kWh)
 *   in the NaturalGasHandler component.
 * - Backend data loading may cause temporary null values; UI shows placeholders.
 *
 * @returns The natural gas dashboard page with filters, charts, and summary stats
 *
 * @author Anna Isabelle Yabut
 * @author Temi Bankole
 */
export default function Page() {
  const chartRef = useRef(null);
  const chartRef2 = useRef(null);

  // Namespaced key to keep this dashboard's persisted values isolated.
  const STORAGE_KEY = "dashboard-natural-gas";

  //Unit toggle: kWh or W (display only, does not affect data or storage)
  const [unit, setUnit] = useState("kWh");

  //User edits made via DateRangePicker
  const [state, setState] = useState(() =>
    loadDashboardState(STORAGE_KEY, stateDefaults),
  );
  // Initialize applied state from storage so charts load immediately.
  // Synced with charts only after validation passes to prevent invalid updates.
  const [appliedState, setAppliedState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, {
      fromDate: stateDefaults.fromDate,
      toDate: stateDefaults.toDate,
    });
    if (saved.fromDate && saved.toDate) {
      return { fromDate: saved.fromDate, toDate: saved.toDate };
    }
    return null;
  });

  const [aggregation, setAggregation] = useState("none");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const { errors, validateAll } = useDateValidation({
    earliestDate: "2023-01-04",
    latestDate: dataRange.newest,
  });

  //Persist state to localStorage whenever it changes
  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
  }, [state]);

  // Validate dates on every change to show errors immediately
  useEffect(() => {
    if (state.fromDate && state.toDate) {
      validateAll(state.fromDate, state.toDate);
    }
  }, [state.fromDate, state.toDate, validateAll]);

  /**
   * handleSaveScreen
   *
   * Saves the current dashboard state (dates, aggregation, unit) to localStorage
   * and adds it to the recent dashboards list. Shows confirmation feedback.
   */
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
        graphs: ["Natural Gas"],
      },
      saved: true,
    });

    setShowSaveNotification(true);
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

  /**
   * Parses a YYYY-MM-DD date string into a local Date object.
   * Returns null if the input is falsy.
   *
   * @param {string} dateStr - Date string in YYYY-MM-DD format
   * @returns {Date|null} Parsed Date object in local timezone
   */
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;

    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day);
  };

  /**
   * Formats a date range into a readable string: "As of: MMM D, YYYY - MMM D, YYYY".
   * Returns null if either date is missing.
   *
   * @param {string} from - Start date in YYYY-MM-DD format
   * @param {string} to - End date in YYYY-MM-DD format
   * @returns {string|null} Formatted date range string
   */
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

  /**
   * Formats a number with thousands separator and exactly 2 decimal places.
   *
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  const formatNumber = (num) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Transform stats for display: format numbers based on unit, format dates, handle loading state
  const displayStats = stats.map((item) => {
    const subtitle = formatDateRange(
      appliedState?.fromDate,
      appliedState?.toDate,
    );

    // Peak period (month/year) is text, not numeric — depends on aggregation level
    if (
      item.label === "Peak Energy Month" ||
      item.label === "Peak Energy Year"
    ) {
      let formatted = "N/A";

      if (item.value && item.value !== "N/A") {
        if (aggregation === "Y") {
          // Yearly aggregation: just show the year
          formatted = item.value;
        } else {
          // Monthly aggregation: convert YYYY-MM to "MMM YYYY"
          const [year, month] = item.value.split("-");

          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
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

    // Numeric cards: show "-" while loading, then convert unit and format
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

          {/* Tooltip explains unit conversions and data sources */}
          <div className="pointer-events-none absolute right-0 top-8 w-80 p-3 bg-white text-black text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="text-sm text-gray-700 leading-relaxed space-y-1">
              <p>
                Natural gas values are converted from GJ to kWh (1 GJ = 277.78
                kWh).
              </p>
              <p>
                Values can be toggled between kWh and W (1&nbsp;kWh =
                1000&nbsp;W).
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

              //Only push dates to charts when the full range passes validation.
              if (fromDate && toDate && validateAll(fromDate, toDate)) {
                setAppliedState({ fromDate, toDate });
              } else {
                //Hide charts for incomplete/invalid ranges to prevent bad queries.
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
            //Display-unit toggle only; source data remains unchanged.
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
                onSaveScreen={handleSaveScreen}
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
            {appliedState ? (
              <ExportPDFButton
                chartRef={chartRef2}
                fileName={`natural-gas-dashboard-${appliedState.fromDate}-${appliedState.toDate}`}
              />
            ) : null}
          </div>

          {showSaveNotification && (
            <NotificationModal
              title="Success"
              message="Dashboard state saved! Your graph settings are restored for next login."
              onClose={() => setShowSaveNotification(false)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
