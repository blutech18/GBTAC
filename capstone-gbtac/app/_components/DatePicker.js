import { useState } from "react"

export default function DateRangePicker({
  fromDate,
  toDate,
  setDate
}) {

  const [tempFrom, setTempFrom] = useState(fromDate)
  const [tempTo, setTempTo] = useState(toDate)

  const setDates = () => {
    setDate({
      fromDate: tempFrom,
      toDate: tempTo
    })
  }

  return (
    <div className="flex flex-wrap gap-4 items-end mb-6">
      <div>
        <label className="block text-sm text-gray-600 mb-1">From</label>
        <input
          type="date"
          value={tempFrom}
          onChange={(e) => setTempFrom(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">To</label>
        <input
          type="date"
          value={tempTo}
          onChange={(e) => setTempTo(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={setDates}
        className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
      >
        Apply
      </button>
    </div>
  );
}
