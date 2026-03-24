//This component will export charts as PDFs.
//It will use the chart's ref to capture the chart as an image and then use jsPDF to create a PDF document.
// Then it will trigger a download of the PDF file.
//libaries needed: html2canvas, jsPDF

"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ConfirmModal from "./ConfirmModal";

export default function ExportPDFButton({ chartRef, fileName }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleExport = async () => {
    if (!chartRef.current) {
      console.error("Chart reference is not available.");
      return;
    }

    try {
      // Capture the chart as an image
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL("image/png");

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Calculate the dimensions of the image in the PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add the image to the PDF
      const pdfFileName = fileName || "chart"; //default file name if not provided
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${pdfFileName}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmModal(true)}
        className="bg-[#912932] text-white font-semibold px-6 py-2 md:px-4 md:py-2 rounded-sm hover:bg-red-700 transition w-full sm:w-auto"
      >
        Export PDF
      </button>

      {showConfirmModal && (
        <ConfirmModal
          title="Export PDF"
          message="Are you sure you want to export as PDF?"
          confirmText="Export"
          variant="danger"
          onConfirm={async () => {
            setShowConfirmModal(false);
            await handleExport();
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </>
  );
}



