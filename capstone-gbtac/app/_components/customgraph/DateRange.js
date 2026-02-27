//This component allows users to select a date range for filtering sensor data. 
//The component also includes basic styling to match the overall design of the application.
"use client";

export default function DateRange({ from, to, onChange }) {
  return (
    <div style={{ fontFamily: "var(--font-titillium)" }} className="bg-white rounded-sm shadow-sm p-4 mt-1 w-1/2">
      <h2 className="font-semibold text-black mb-4">Date Range</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => onChange(e.target.value, to)}
            max={to || undefined}
            className="border p-2 rounded text-gray-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => onChange(from, e.target.value)}
            min={from || undefined}
            className="border p-2 rounded text-gray-500"
          />
        </div>
      </div>
    </div>
  );
}
