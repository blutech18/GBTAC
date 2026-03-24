import TimeGranularityDropdown from "./TimeGranularityDropdown";
import { useState } from "react";

export default function DateRangePicker({
  fromDate,
  toDate,
  setDate,
  errors = {},
  onDateChange,
  aggregation,
  setAggregation
}) {

  const [tempFrom, setTempFrom] = useState(fromDate)
  const [tempTo, setTempTo] = useState(toDate)

  const [tempAggregation, setTempAggregation] = useState(aggregation)
  const hasErrors = errors.from || errors.to;

  const setDates = () => {
    setDate({
      fromDate: tempFrom,
      toDate: tempTo
    })
    setAggregation(tempAggregation);
  }
  

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col">
        <label className="block text-sm mb-1">From</label>
        <input
          type="date"
          value={tempFrom}
          onChange={(e) => {
              setTempFrom(e.target.value)
              onDateChange?.("from", e.target.value, tempTo);
            }}
          className={`border rounded px-3 py-2 ${errors.from ? "border-red-500" : ""}`}
        />
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
              setTempTo(e.target.value)
              onDateChange?.("to", e.target.value, tempFrom);
            }}
            className={`border rounded px-3 py-2 ${errors.to ? "border-red-500" : ""}`}
          />
          <div className="h-4 mt-1">
            {errors.to && (
              <p className="text-red-500 text-xs mt-1">{errors.to}</p>
            )}
          </div>
      </div>

      <div className="flex flex-col">
        <label className="block text-sm mb-1">Aggregation</label>
        <TimeGranularityDropdown value={tempAggregation} onChange={setTempAggregation} />
        <div className="h-4 mt-1"/>
    </div>

    <div className="flex flex-col">
      <div className="h-5 mb-1" /> 
      <button
        onClick={setDates}
        disabled={hasErrors}
        className={`px-4 py-2 text-white font-semibold rounded transition ${
          hasErrors ? "bg-gray-400 cursor-not-allowed" : "bg-[#005EB8] hover:bg-[#004080]"
        }`}
      >
        Apply
      </button>
      <div className="h-4 mt-1" /> 
    </div>
  </div>
  );
}
