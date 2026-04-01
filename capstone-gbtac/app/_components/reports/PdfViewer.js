//This component displays the generated PDF report in an iframe.
//The PDF is passesed as a Blob object through the pdfBlob prop. If no PDF is available, it shows a placeholder message.

"use client";

export default function PDFViewer({ pdfBlob, onClear, isGenerating = false }) {
  return (
 
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 rounded-xl p-6 h-full flex flex-col gap-6">
      <p className="text-center my-2 italic textfont-semibold">
        Preview
      </p>

      <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-100 flex-1 flex justify-center items-center">
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded">
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <svg className="animate-spin h-8 w-8 text-[#6D2077]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-sm font-medium">Generating report...</span>
            </div>
          </div>
        )}
        {!pdfBlob && !isGenerating && (
          <div className="text-gray-500">
            No report generated yet.
          </div>
        )}
        {pdfBlob && (
          <iframe
            src={URL.createObjectURL(pdfBlob)} //create a temporary URL for the PDF blob to display in the iframe
            width="100%"
            height="500px"
            style={{ border: "none" }}
            title="Report PDF"
          />
        )}
      </div>

      <div className="flex justify-center mt-auto">
        <button
          className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
          onClick={onClear}
        >
          Create Another Report <span className="ml-2">{">"}</span>
        </button>
      </div>
    </div>
  );
}
