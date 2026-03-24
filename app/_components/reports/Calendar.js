"use client";

export default function Calendar() {
  return (
    // This component uses Tailwind CSS for layout, spacing, colors, and buttons,
    <div className="flex flex-col items-start">
      <p className="px-5 mt-0 py-2 font-bold text-lg dark:text-black" style={{ fontFamily: "var(--font-titillium)" }}>Set Date:</p>

      <button
        // onClick={handleCurrent
        style={{ fontFamily: "var(--font-titillium)" }}
        className="px-6 py-3 mt-2 border rounded-4xl font-bold bg-white text-[#A6192E] hover:bg-[#A6192E] hover:text-white"
      >
        Current <span className="ml-5">{">"}</span>
      </button>

      <button
        // onClick={handleLast7Days}
        style={{ fontFamily: "var(--font-titillium)" }}
        className={`px-6 py-3 mt-4 border rounded-4xl font-bold bg-white text-[#6D2077] hover:bg-[#6D2077] hover:text-white`}
      >
        Last 7 Days <span className="ml-5">{">"}</span>
      </button>

      <button
        // onClick={handleToggleCalendar}
        style={{ fontFamily: "var(--font-titillium)" }}
        className={`px-6 py-3 mt-4 border rounded-4xl font-bold bg-white text-[#0C2340] hover:bg-[#0C2340] hover:text-white`}

      >
        Calendar <span className="ml-5">{">"}</span>
      </button>

      {/* {showCalendar && ( */}
        <div className="-ml-5 dark:text-black" style={{ fontFamily: "var(--font-titillium)" }}>
          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar value={startDate || dayjs()} onChange={handleDateClick} />
          </LocalizationProvider> */}
          {/* <p className="pl-8 text-sm dark:text-black"> */}
            {/* Selected Range: {startDate ? startDate.format("YYYY-MM-DD") : "—"}
            {endDate ? ` to ${endDate.format("YYYY-MM-DD")}` : ""} */}
          {/* </p> */}
        </div>
      

      <button
        type="button"
        onClick={() => onCreateReport(startDate, endDate, selectedReport)}
        className="mt-4 bg-[#aa2f39] text-white font-bold px-4 py-3 rounded-4xl hover:bg-[#8D1527]"
      >
        Create New Report <span className="ml-4">{">"}</span>
      </button>
    </div>

  )
}