"use client";

export default function PDFViewer() {
  return (
    // This container uses Tailwind CSS for styling while the PDF calendar/datepicker is from Material-UI
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 rounded-xl p-6 space-y-6 dark:text-black">
      <p className="text-center my-2 italic textfont-semibold" style={{ fontFamily: "var(--font-titillium)" }}>Preview</p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[400px] flex justify-center items-center">
        {/* {!pdfUrl && <div className="text-gray-500" style={{ fontFamily: "var(--font-titillium)" }}>No report generated yet.</div>}
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            style={{ border: "none" }}
            title="Report PDF"
          />
        )} */}
      </div>

      <div className="flex justify-center mt-10">
        <button
          className="bg-[#A6192E] text-white font-bold px-5 py-3 rounded-4xl hover:bg-[#7A1222]"
          // onClick={onClear}
        >
          Create Another Report <span className="ml-5">{">"}</span>
        </button>
      </div>
    </div>
  )

}