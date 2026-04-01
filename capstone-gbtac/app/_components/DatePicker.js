import TimeGranularityDropdown from "./TimeGranularityDropdown";
import { useState } from "react";

/**
 * DateRangePicker
 *
 * Controls for selecting a from/to date range, a time aggregation granularity,
 * and an Apply button that commits all three values at once. Changes are staged
 * in local state until Apply is clicked, so the parent is never updated with a
 * partial or invalid range.
 *
 * @param {string}   fromDate         - Initial from date in YYYY-MM-DD format
 * @param {string}   toDate           - Initial to date in YYYY-MM-DD format
 * @param {Function} setDate          - Called with { fromDate, toDate } on Apply
 * @param {object}   [errors={}]      - Validation errors; { from?: string, to?: string }
 * @param {Function} [onDateChange]   - Optional live callback called on each input change
 *                                      before Apply, signature: (field, value, otherValue)
 * @param {string}   aggregation      - Initial aggregation granularity value
 * @param {Function} setAggregation   - Called with the new aggregation value on Apply
 *
 * Notes:
 * - The Apply button is disabled whenever errors.from or errors.to is truthy.
 * - onDateChange is optional and called with ?. so it is safe to omit.
 * - tempTo is not stale in the "from" onChange — only the From field is changing,
 *   so tempTo still reflects the latest committed To value at that point.
 *
 * @author Cintya Lara Flores
 */

export default function DateRangePicker({
  fromDate,
  toDate,
  setDate,
  errors = {},
  onDateChange,
  aggregation,
  setAggregation,
  aggregationOptions,
}) {
  const [tempFrom, setTempFrom] = useState(fromDate);
  const [tempTo, setTempTo] = useState(toDate);

  const [tempAggregation, setTempAggregation] = useState(aggregation);
  const hasErrors = errors.from || errors.to;

  // Commits all staged values to the parent at once
  const setDates = () => {
    setDate({
      fromDate: tempFrom,
      toDate: tempTo,
    });
    setAggregation(tempAggregation);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col">
        <label className="block text-sm mb-1">From</label>
        <input
          type="date"
          value={tempFrom}
          onChange={(e) => {
            setTempFrom(e.target.value);
            onDateChange?.("from", e.target.value, tempTo);
          }}
          className={`border rounded px-3 py-2 ${errors.from ? "border-red-500" : ""}`}
        />

        {/* Reserved space for error message to prevent layout shift */}
        <div className="h-4 mt-1">
          {errors.from && (
            <p className="text-red-500 text-xs mt-1">{errors.from}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <label className="block text-sm mb-1">To</label>
        <input
          type="date"
          value={tempTo}
          onChange={(e) => {
            setTempTo(e.target.value);
            onDateChange?.("to", e.target.value, tempFrom);
          }}
          className={`border rounded px-3 py-2 ${errors.to ? "border-red-500" : ""}`}
        />
        {/* Reserved space for error message to prevent layout shift */}
        <div className="h-4 mt-1">
          {errors.to && (
            <p className="text-red-500 text-xs mt-1">{errors.to}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <label className="block text-sm mb-1">Aggregation</label>
        <TimeGranularityDropdown
          value={tempAggregation}
          onChange={setTempAggregation}
          options={aggregationOptions}
        />
        <div className="h-4 mt-1" />
      </div>

      <div className="flex flex-col">
        {/* Reserved space to align button baseline with the input labels */}
        <div className="h-5 mb-1" />
        <button
          onClick={setDates}
          disabled={hasErrors}
          className={`px-4 py-2 text-white font-semibold rounded transition ${
            hasErrors
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#005EB8] hover:bg-[#004080]"
          }`}
        >
          Apply
        </button>
        <div className="h-4 mt-1" />
      </div>
    </div>
  );
}
