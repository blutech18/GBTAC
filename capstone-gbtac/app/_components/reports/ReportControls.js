"use client";

import { useState, useEffect } from "react";
import SensorPanel from "./SensorPanel";
import TimeGranularityDropdown from "../TimeGranularityDropdown";

/**
 * ReportControls
 *
 * Manages and renders all controls for configuring a PDF report, including
 * sensor selection, report title, date range, and time interval. Validates
 * all inputs locally before delegating generation to the parent via onGenerate.
 *
 * @param {Array} selectedSensors - List of currently selected sensor objects
 * @param {Function} onSensorsChange - Called with the updated sensors array when selection changes
 * @param {string} chartTitle - Current report title value
 * @param {Function} onChartTitleChange - Called with the raw string value when the title changes
 * @param {string} from - Start date in YYYY-MM-DD format
 * @param {Function} onFromChange - Called with the raw string value when the from date changes
 * @param {string} to - End date in YYYY-MM-DD format
 * @param {Function} onToChange - Called with the raw string value when the to date changes
 * @param {string} timeInterval - Currently selected time granularity value
 * @param {Function} onTimeIntervalChange - Called with the updated value when the time interval changes
 * @param {Function} onGenerate - Called when all validation passes and the user clicks Generate Report
 *
 * Notes:
 * - All state except sensors and errorMessage is lifted to the parent — this component is
 *   intentionally controlled for all report configuration fields
 * - Sensor options are fetched once on mount from /graphs/codesnames
 * - Validation enforces: non-empty title (max 30 chars), at least one sensor, a valid date range,
 *   a from date no more than 8 years in the past, and a to date no later than 2025-12-31
 * - onGenerate is only called after all validation passes — the parent can assume inputs are valid
 * - errorMessage is cleared on a successful validation pass and displayed beneath the Generate button
 * @author Temi Bankole
 */
export default function ReportControls({
  selectedSensors, onSensorsChange,
  chartTitle, onChartTitleChange,
  from, onFromChange,
  to, onToChange,
  timeInterval, onTimeIntervalChange,
  onGenerate,
  isGenerating = false,
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [sensors, setSensors] = useState();

  const handleGenerateReport = () => {
    if (!chartTitle || chartTitle.trim().length === 0) {
      setErrorMessage("Please enter a report title.");
      return;
    }
    if (selectedSensors.length === 0) {
      setErrorMessage("Please select at least one sensor.");
      return;
    }
    if (!from || !to) {
      setErrorMessage("Please select a date range.");
      return;
    }
    if (new Date(from) > new Date(to)) {
      setErrorMessage("From date cannot be after To date.");
      return;
    }
    const today = new Date();
    const fromDate = new Date(from);
    // Cap from date to 8 years ago — the API only holds 8 years of sensor data
    const diffYears = (today - fromDate) / (1000 * 60 * 60 * 24 * 365);
    if (diffYears > 8) {
      setErrorMessage("From date cannot be more than 8 years ago.");
      return;
    }
    // Cap to date to the last date covered by the dataset
    const maxToDate = new Date("2025-12-31");
    const toDate = new Date(to);
    if (toDate > maxToDate) {
      setErrorMessage("To date cannot be past December 31, 2025.");
      return;
    }
    setErrorMessage("");
    onGenerate();
  };

  const loadSensors = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphs/codesnames`, { credentials: "include" });
    const data = await res.json();
    setSensors(data);
  };

  useEffect(() => {
    //eslint-disable-next-line react-hooks/set-state-in-effect
    loadSensors();
  }, []);

  return (
    <div className="space-y-6">
      <SensorPanel sensors={sensors} selectedSensors={selectedSensors} onSelect={onSensorsChange} />

      <div className="flex flex-col w-full space-y-2 text-[#212529]">
        <div>
          <label className="block text-sm mb-1">Report Title</label>
          <input
            type="text"
            value={chartTitle}
            onChange={(e) => onChartTitleChange(e.target.value)}
            placeholder="Enter report title"
            maxLength={30}
            className="border mb-1 border-gray-500 text-gray-700 rounded px-3 py-2 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">From</label>
            <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="border mb-1 border-gray-500 text-gray-500 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">To</label>
            <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="border mb-1 border-gray-500 text-gray-500 rounded px-3 py-2" />
          </div>
        </div>

        <div className="w-full text-[#212529]">
          <label className="block text-sm mb-1">Time Interval</label>
          <TimeGranularityDropdown
            value={timeInterval}
            onChange={onTimeIntervalChange}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <button
          className="w-full px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] disabled:bg-[#9FBFE2] disabled:cursor-not-allowed transition"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </button>
        {errorMessage && <p className="mt-5 text-red-600 font-bold">{errorMessage}</p>}
      </div>
    </div>
  );
}