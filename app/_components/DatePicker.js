export default function DateRangePicker({
  fromDate,
  toDate,
  setDate
}) {
  return (
    <div className="flex flex-wrap gap-4 items-end mb-6">
      <div>
        <label className="block text-sm text-gray-600 mb-1">From</label>
        <input
          type="date"
          value={fromDate || ""}
          onChange={(e) =>
            setDate({
              fromDate: e.target.value,
              toDate
            })
          }
          className="border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">To</label>
        <input
          type="date"
          value={toDate || ""}
          onChange={(e) =>
            setDate({
              fromDate,
              toDate: e.target.value
            })
          }
          className="border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={() =>
          setDate({
            fromDate,
            toDate
          })
        }
        className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
      >
        Apply
      </button>
    </div>
  );
}
