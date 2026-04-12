"use client";

import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Breadcrumbs from "@/app/_components/Breadcrumbs";
import Footer from "@/app/_components/Footer";
import ReportControls from "@/app/_components/reports/ReportControls";
import PDFViewer from "../../_components/reports/PdfViewer";
import NotificationModal from "@/app/_components/NotificationModal";
import { useState } from "react";
import { checkSafety } from "@/app/_utils/content-safety";
import { getDataRange } from "@/app/_utils/get-data-range";

const dataRange = await getDataRange();

/**
 * Page
 *
 * Reports page where staff can configure and generate a PDF report from sensor
 * data. Renders ReportControls alongside a PDFViewer that displays the result.
 *
 * Notes:
 * - dataRange is fetched at module level with a top-level await; this requires
 *   the Next.js runtime to support async module evaluation
 * - From and to dates are initialised to dataRange.newest so the form defaults
 *   to the most recent available data
 * - handleGenerate runs a content safety check on the chart title before
 *   calling the API; generation is blocked and the user is alerted if the
 *   check fails
 * - The report API is called with agg_type hardcoded to "mean"; this is not
 *   currently exposed as a user-configurable option
 * - handleClear resets timeInterval to "hourly" rather than "none" which is
 *   the default used elsewhere; this may be unintentional
 * - Logout and profile are shown and login is hidden; this page requires an
 *   authenticated session
 *
 * @author Temi Bankole
 */
export default function Page() {
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [chartTitle, setChartTitle] = useState("");
  const [from, setFrom] = useState(dataRange.newest);
  const [to, setTo] = useState(dataRange.newest);
  const [timeInterval, setTimeInterval] = useState("none");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [showSafetyNotification, setShowSafetyNotification] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calls backend API returning the blob to display generated report.
  const handleGenerate = async () => {
    setIsGenerating(true);
    if (!await checkSafety(chartTitle)) {
      setShowSafetyNotification(true);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/?sensors=${selectedSensors.map((s) => s.code).join(",")}&start=${from}&end=${to}&agg=${timeInterval}&agg_type=mean&title=${chartTitle}`,
        { credentials: "include" },
      );
      const pdf = await res.blob();
      setPdfBlob(pdf);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setSelectedSensors([]);
    setChartTitle("");
    setFrom("");
    setTo("");
    setTimeInterval("hourly");
    setPdfBlob(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-[#212529]">
      <SecondaryNav
        displayLogout={true}
        displayProfile={true}
        displayLogin={false}
      />
      <Navbar
        displayDashboards
        displayHome={false}
        displayAbout={false}
        displayReports={true}
      />
      <Breadcrumbs />
      <main className="flex-1 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 py-8">
        <h1 className="text-3xl font-semibold mb-6 text-[#212529]">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="col-span-2 md:col-span-1 p-6 bg-white shadow-md rounded-xl border space-y-6">
            <div className="text-xl font-semibold mb-4 text-[#212529]">
              Report Controls
            </div>
            <ReportControls
              selectedSensors={selectedSensors}
              onSensorsChange={setSelectedSensors}
              chartTitle={chartTitle}
              onChartTitleChange={setChartTitle}
              from={from}
              onFromChange={setFrom}
              to={to}
              onToChange={setTo}
              timeInterval={timeInterval}
              onTimeIntervalChange={setTimeInterval}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
          <div className="col-span-2 flex">
            <PDFViewer
              pdfBlob={pdfBlob}
              onClear={handleClear}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </main>

      {showSafetyNotification && (
        <NotificationModal
          title="Error"
          message="Chart title contains inappropriate content. Please modify and try again."
          variant="error"
          onClose={() => setShowSafetyNotification(false)}
        />
      )}

      <Footer />
    </div>
  );
}
