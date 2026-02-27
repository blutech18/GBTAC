"use client";

export default function ExportPDFButton() {
  const handleExport = () => {
    window.print();
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-[#A6192E] text-white font-semibold rounded hover:bg-[#8B1527] transition flex items-center gap-2"
    >
      {/* Printer icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
      </svg>
      Export PDF
    </button>
  );
}
