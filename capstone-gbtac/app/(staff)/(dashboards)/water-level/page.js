"use client";

import { useEffect, useState, useCallback } from "react";
import { saveRecentDashboard } from "../../../utils/saveRecentDashboard";
import DashboardLayout from "../../../_components/DashboardLayout";
import DatePicker from "../../../_components/DatePicker";
import { loadDashboardState, saveDashboardState } from "../../../utils/storage";
import Carousel from "../../../_components/Carousel";
import { useDateValidation } from "../../../_components/hooks/useDateValidation";
import InfoCard from "../../../_components/InfoCard";
import LineHandler from "@/app/_components/graphs/handlers/LineHandler";
import { getDataRange } from "@/app/_utils/get-data-range";
import ExportPDFButton from "@/app/_components/ExportPDFButton";

const STORAGE_KEY = "dashboard-water-level";

/**
 * WaterLevelDashboard
 *
 * Dashboard page for visualizing cistern water level readings.
 * Includes KPI stat cards for average, max, and min levels over
 * the selected date range, and a line chart showing level over time.
 * The date range is selectable via a DatePicker control, and the
 * dashboard state can be saved to localStorage and appears in the
 * Recent Dashboards list for quick access.
 *
 * @author Cintya Lara Flores
 */
export default function WaterLevelDashboard() {
  const [dataRange, setDataRange] = useState({
    oldest: "",
    newest: "",
    forecast: "2100-12-31",
  });

  const [state, setState] = useState(() =>
    loadDashboardState(STORAGE_KEY, { fromDate: "", toDate: "" })
  );

  const [appliedState, setAppliedState] = useState(() => {
    const saved = loadDashboardState(STORAGE_KEY, { fromDate: "", toDate: "" });
    if (saved.fromDate && saved.toDate) {
      return {
        fromDate: saved.fromDate,
        toDate: saved.toDate,
      };
    }
    return { fromDate: "", toDate: "" };
  });

  const [unit, setUnit] = useState("%");
  const TANK_CAPACITY = 32000;
  const [aggregation, setAggregation] = useState("none");

  const [stats, setStats] = useState([
    { label: "Average Level", value: "-" },
    { label: "Maximum Level", value: "-" },
    { label: "Minimum Level", value: "-" },
  ]);

  const [extremeDates, setExtremeDates] = useState({
    maxTs: null,
    minTs: null,
  });

  const { errors, validateAll } = useDateValidation({
    earliestDate: "2018-10-13",
    latestDate: dataRange?.forecast || "2100-12-31",
  });

  useEffect(() => {
    let isMounted = true;

    const initialiseDashboard = async () => {
      const range = await getDataRange();
      if (!isMounted) return;

      setDataRange(range);

      const defaults = {
        fromDate: range.oldest,
        toDate: range.newest,
      };

      const saved = loadDashboardState(STORAGE_KEY, defaults);

      const nextState =
        saved.fromDate && saved.toDate ? saved : defaults;

      setState(nextState);
      setAppliedState(nextState);
    };

    initialiseDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (state.fromDate && state.toDate) {
      saveDashboardState(STORAGE_KEY, state);
    }
  }, [state]);

  useEffect(() => {
    if (state.fromDate && state.toDate) {
      validateAll(state.fromDate, state.toDate);
    }
  }, [state.fromDate, state.toDate, validateAll]);

  /**
   * parseLocalDate
   *
   * Parses a YYYY-MM-DD string as a local-time Date to avoid the UTC offset
   * shift that occurs with new Date(dateStr) on date-only strings.
   *
   * @param {string | null} dateStr - Date string in YYYY-MM-DD format
   * @returns {Date | null} Parsed local Date, or null if dateStr is falsy
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

  const formatSingleDate = (timestamp) => {
    if (!timestamp) return null;

    const date = new Date(timestamp);

    return `As of: ${date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const convertValue = (value) => {
    if (value == null || value === "-") return "-";

    const numericValue = Number(value);

    if (unit === "L") {
      return ((numericValue / 100) * TANK_CAPACITY).toFixed(2);
    }

    return numericValue.toFixed(2);
  };

  const displayStats = stats.map((item) => {
    let subtitle = formatDateRange(appliedState?.fromDate, appliedState?.toDate);

    if (item.label === "Maximum Level") {
      subtitle = formatSingleDate(extremeDates.maxTs);
    } else if (item.label === "Minimum Level") {
      subtitle = formatSingleDate(extremeDates.minTs);
    }

    return {
      ...item,
      value: convertValue(item.value),
      unit,
      subtitle,
    };
  });

  const handleStatsReady = useCallback((graphStats) => {
    if (!graphStats) {
      setStats([
        { label: "Average Level", value: "-" },
        { label: "Maximum Level", value: "-" },
        { label: "Minimum Level", value: "-" },
      ]);

      setExtremeDates({
        maxTs: null,
        minTs: null,
      });

      return;
    }

    setStats([
      {
        label: "Average Level",
        value: Number(graphStats.avg).toFixed(2),
      },
      {
        label: "Maximum Level",
        value: Number(graphStats.max).toFixed(2),
      },
      {
        label: "Minimum Level",
        value: Number(graphStats.min).toFixed(2),
      },
    ]);

    setExtremeDates({
      maxTs: graphStats.maxTs,
      minTs: graphStats.minTs,
    });
  }, []);

  const handleSaveScreen = () => {
    saveDashboardState(STORAGE_KEY, state);
    saveRecentDashboard({
      id: "water-level",
      title: "Cistern Level Dashboard",
      path: "/water-level?from=staff-welcome-page",
      summary: {
        fromDate: state.fromDate,
        toDate: state.toDate,
      },
      saved: true,
    });

    alert(
      "Dashboard state saved! Your graph settings are restored for next login."
    );
  };

  const xAxisTitle =
    aggregation === "none" || aggregation === "H"
      ? "Hours"
      : aggregation === "D"
      ? "Days"
      : aggregation === "M"
      ? "Months"
      : aggregation === "Y"
      ? "Years"
      : "Time";

  return (
    <DashboardLayout title="Cistern Level Dashboard">
      <div className="flex flex-wrap gap-6 items-start mb-6">
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
                setAppliedState(null);
              }
            }}
            aggregation={aggregation}
            setAggregation={setAggregation}
          />
        </div>
      </div>

      <div id="water-level-dashboard-export">
        <div className="lg:hidden mb-6">
          <Carousel items={displayStats} horizontal />
        </div>

        <div className="hidden lg:block">
          <InfoCard
            colsClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            items={displayStats}
          />
        </div>

        <div className="flex justify-center mb-6 lg:justify-start">
          <button
            onClick={() => setUnit(unit === "%" ? "L" : "%")}
            className="px-4 py-2 bg-[#005EB8] text-white rounded hover:bg-[#004080] transition"
          >
            Toggle Units: {unit}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-4 mt-6">
            <LineHandler
              sensorList={["20000_TL93"]}
              startDate={appliedState?.fromDate}
              endDate={appliedState?.toDate}
              graphTitle={`Cistern Water Level, ${appliedState?.fromDate} to ${appliedState?.toDate}`}
              yTitle={unit === "L" ? "Water Level (L)" : "Water Level (%)"}
              xTitle={xAxisTitle}
              xUnit={"day"}
              aggTime={aggregation}
              aggType={"mean"}
              onStatsReady={handleStatsReady}
              unit={unit}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <ExportPDFButton
          targetId="water-level-dashboard-export"
          fileName="cistern-water-level-dashboard.pdf"
        />

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