"use client";

import { useEffect, useState } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import Carousel from "../../../_components/Carousel";
import { useDateValidation } from "../../../_components/hooks/useDateValidation";

import LineHandler from "@/app/_components/graphs/handlers/LineHandler";
import PieHandler from "@/app/_components/graphs/handlers/PieHandler";

import { getDataRange } from "@/app/_utils/get-data-range";

// ****BUG****Top-level await is not supported in "use client" components — getDataRange
// should be called inside a useEffect or fetched server-side and passed as a prop
const dataRange = await getDataRange();
// defaults
const stateDefaults = { fromDate: dataRange.newest, toDate: dataRange.newest };

const STORAGE_KEY = "dashboard-energy";

/**
 * EnergyDashboard
 *
 * Dashboard page for visualizing building energy generation and consumption.
 * Renders KPI stat cards (average, max, min for both generation and consumption),
 * a line chart comparing consumption vs generation over time, and a pie chart
 * breaking down solar panel generation by source.
 *
 * Notes:
 * - State is split into `state` (staged) and `appliedState` (committed). The
 *   charts and KPI fetch only update when Apply is clicked on the DatePicker.
 * - KPI stats are fetched from the backend on every state change, including
 *   before Apply is clicked. This means the cards may show stale data relative
 *   to the chart while a date is being typed but not yet applied.
 * - The unit toggle (W / kWh) converts values client-side from the raw W values
 *   returned by the API; no refetch is needed on unit change.
 * - The PieHandler endDate is capped at 2025-12-31 due to a known data
 *   availability limit on the solar sensor series.
 *
 * @author Cintya Lara Flores
 */
export default function EnergyDashboard() {
  const [state, setState] = useState(() =>
    loadDashboardState(STORAGE_KEY, stateDefaults),
  );

  //initialize from saved state so charts load immediately on page load
  const [appliedState, setAppliedState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, stateDefaults);
    if (saved.fromDate && saved.toDate) {
      return { fromDate: saved.fromDate, toDate: saved.toDate };
    }
    return null;
  });

  //errors from date validation
  const { errors, validateAll } = useDateValidation({
    earliestDate: "2019-02-13",
    latestDate: dataRange.forecast,
  });

  /**
   * parseLocalDate
   *
   * Parses a YYYY-MM-DD string as a local-time Date to avoid the UTC offset
   * shift that occurs with new Date(dateStr) on date-only strings.
   *
   * @param {string | null} dateStr - Date string in YYYY-MM-DD format
   * @returns {Date | null} Parsed local Date, or null if dateStr is false
   */
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day);
  };

  /**
   * formatDateRange
   *
   * Formats a from/to date pair into a compact range string used as the
   * subtitle on KPI stat cards.
   *
   * @param {string} from - Start date in YYYY-MM-DD format
   * @param {string} to   - End date in YYYY-MM-DD format
   * @returns {string | null} Formatted range string, or null if either date is falsy
   */
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
  const [unit, setUnit] = useState("W");

  const [aggregation, setAggregation] = useState("none");

  // Persist staged state and refresh KPI cards on every state change
  useEffect(() => {
    saveDashboardState(STORAGE_KEY, state);
    fetchStats();
  }, [state]);

  // Persist staged state and refresh KPI cards on every state change
  useEffect(() => {
    if (state.fromDate && state.toDate) {
      validateAll(state.fromDate, state.toDate);
    }
  }, [state.fromDate, state.toDate, validateAll]);

  // Base stats
  const [stats, setStats] = useState([
    { label: "Average Generation", value: "-" },
    { label: "Maximum Generation", value: "-" },
    { label: "Minimum Generation", value: "-" },
    { label: "Average Generation", value: "-" },
    { label: "Maximum Consumption", value: "-" },
    { label: "Minimum Consumption", value: "-" },
  ]);

  // Fetches KPI card values from the backend for the currently applied date range
  const fetchStats = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/energy/cards?start=${appliedState?.fromDate}&end=${appliedState?.toDate}`,
      { credentials: "include" },
    );
    const data = await res.json();
    console.log("stats data:", data);
    setStats(data);
  };

  // Converts raw W values to kWh client-side when the unit toggle is active;
  // subtitle reflects the applied date range rather than a live sensor timestamp
  const displayStats = stats.map((item) => ({
    ...item,
    value:
      typeof item.value === "number"
        ? parseFloat(
            (unit === "kWh" ? item.value / 1000 : item.value).toFixed(2),
          )
        : item.value,
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
      <div className="flex flex-wrap gap-6 items-start mb-6">
        {/* ── Controls row: date range picker ── */}
        <div>
          <DatePicker
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
                // Invalid range — clear applied state so charts are hidden
                setAppliedState(null);
              }
            }}
            aggregation={aggregation}
            setAggregation={setAggregation}
          />
        </div>
      </div>

      {/* ── KPI stat cards ── */}
      <div className="mb-6">
        <Carousel items={displayStats} horizontal maxVisible={3} />
      </div>

      <div className="flex justify-center mb-6 lg:justify-start">
        <button
          onClick={() => setUnit(unit === "kWh" ? "W" : "kWh")}
          className="px-4 py-2 bg-[#005EB8] text-white rounded hover:bg-[#004080] transition"
        >
          Toggle Units: {unit}
        </button>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
        <LineHandler
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
          aggTime={aggregation}
          aggType={"sum"}
        />

        {/* endDate capped at 2025-12-31 — solar sensor data ends there */}
        <PieHandler
          sensorList={[
            "30000_TL252", // PV-CarportSolar_Total
            "30000_TL253", // PV-RooftopSolar_Total
          ]}
          startDate={appliedState?.fromDate}
          endDate={appliedState?.toDate}
          graphTitle={`Solar Panel Generation, ${appliedState?.fromDate} to ${appliedState?.toDate < "2025-12-31" ? appliedState?.toDate : "2025-12-31"}`}
          label={"Wh"} // **check: unsure if right unit
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
