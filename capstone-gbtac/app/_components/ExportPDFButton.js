"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ConfirmModal from "./ConfirmModal";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

const trimCanvasWhitespace = (sourceCanvas, padding = 8) => {
  const context = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!context) return sourceCanvas;

  const { width, height } = sourceCanvas;
  const imageData = context.getImageData(0, 0, width, height).data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  // Treat mostly white and transparent pixels as whitespace.
  const whiteThreshold = 248;
  const alphaThreshold = 6;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = imageData[index];
      const g = imageData[index + 1];
      const b = imageData[index + 2];
      const a = imageData[index + 3];

      const isTransparent = a <= alphaThreshold;
      const isNearWhite = r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold;

      if (!isTransparent && !isNearWhite) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return sourceCanvas;
  }

  const paddedMinX = Math.max(0, minX - padding);
  const paddedMinY = Math.max(0, minY - padding);
  const paddedMaxX = Math.min(width - 1, maxX + padding);
  const paddedMaxY = Math.min(height - 1, maxY + padding);

  const croppedWidth = paddedMaxX - paddedMinX + 1;
  const croppedHeight = paddedMaxY - paddedMinY + 1;

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = croppedWidth;
  croppedCanvas.height = croppedHeight;

  const croppedContext = croppedCanvas.getContext("2d");
  if (!croppedContext) return sourceCanvas;

  croppedContext.drawImage(
    sourceCanvas,
    paddedMinX,
    paddedMinY,
    croppedWidth,
    croppedHeight,
    0,
    0,
    croppedWidth,
    croppedHeight,
  );

  return croppedCanvas;
};

/**
 * ExportPDFButton
 *
 * Renders a button that captures a referenced chart element as an image and
 * downloads it as a landscape A4 PDF. Prompts the user for confirmation before
 * exporting.
 *
 * @param {React.RefObject} chartRef - Ref attached to the chart DOM element to capture
 * @param {string} [fileName="chart"] - Base name for the downloaded file, without extension
 *
 * Notes:
 * - Capture is performed by html2canvas and conversion by jsPDF — both must be installed
 * - Image dimensions are scaled to fit the full PDF page width while preserving aspect ratio
 * - If chartRef.current is null at export time, the export is aborted and an error is logged
 * @author Temi Bankole
 */
export default function ExportPDFButton({ chartRef, fileName }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleExport = async () => {
    if (!chartRef.current) {
      console.error("Chart reference is not available.");
      return;
    }

    try {
      const capturedCanvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const canvas = trimCanvasWhitespace(capturedCanvas);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      //Reserve margins and a compact header so chart content fits tightly.
      const margin = 7;
      const headerGap = 4;
      const headerHeight = 14;

      //Add SAIT logo and report metadata in the header.
      try {
        const logo = await loadImage("/collegiate_logo_red2.png");
        const logoWidth = 34;
        const logoHeight = (logo.height / logo.width) * logoWidth;
        pdf.addImage(logo, "PNG", margin, margin, logoWidth, logoHeight);
      } catch (error) {
        console.warn("Logo not added to PDF header:", error);
      }

      const title = fileName ? `${fileName} report` : "Chart report";
      const generatedAt = new Date().toLocaleString();
      pdf.setTextColor(33, 37, 41);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text(title, pageWidth - margin, margin + 6, { align: "right" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(`Generated: ${generatedAt}`, pageWidth - margin, margin + 12, {
        align: "right",
      });

      const contentX = margin;
      const contentY = margin + headerHeight + headerGap;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - contentY - margin;

      //Fit the screenshot inside the content box without over-scaling.
      const widthScale = contentWidth / canvas.width;
      const heightScale = contentHeight / canvas.height;
      const fitScale = Math.min(widthScale, heightScale);

      const renderWidth = canvas.width * fitScale;
      const renderHeight = canvas.height * fitScale;
      const renderX = contentX + (contentWidth - renderWidth) / 2;
      const renderY = contentY + (contentHeight - renderHeight) / 2;

      const pdfFileName = fileName || "chart";
      pdf.addImage(imgData, "PNG", renderX, renderY, renderWidth, renderHeight);
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