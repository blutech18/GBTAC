//This component displays the generated PDF report in an iframe.
//The PDF is passesed as a Blob object through the pdfBlob prop. If no PDF is available, it shows a placeholder message.

"use client";

export default function PDFViewer({ pdfBlob, onClear }) {
  return (
 
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 rounded-xl p-6 space-y-6">
      <p className="text-center my-2 italic textfont-semibold">
        Preview
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[400px] flex justify-center items-center">
        {!pdfBlob && (
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

      <div className="flex justify-center mt-10">
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
