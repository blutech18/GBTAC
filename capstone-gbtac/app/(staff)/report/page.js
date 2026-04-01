"use client";

import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import ReportControls from "@/app/_components/reports/ReportControls";
import PDFViewer from "../../_components/reports/PdfViewer";
import { useState } from "react";
import { checkSafety } from "@/app/_utils/content-safety";
import { getDataRange } from "@/app/_utils/get-data-range";

const dataRange = await getDataRange();

export default function Page() {

    const [selectedSensors, setSelectedSensors] = useState([]);
    const [chartTitle, setChartTitle] = useState("");
    const [from, setFrom] = useState(dataRange.newest);
    const [to, setTo] = useState(dataRange.newest);
    const [timeInterval, setTimeInterval] = useState("none");
    const [pdfBlob, setPdfBlob] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    //calls backend API returning the blob to display generated report
    const handleGenerate = async () => {
      setIsGenerating(true);
      if(! await checkSafety(chartTitle)){
        alert("Chart title contains inappropriate content. Please modify and try again.");
        setIsGenerating(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/?sensors=${selectedSensors.map(s => s.code).join(",")}&start=${from}&end=${to}&agg=${timeInterval}&agg_type=mean&title=${chartTitle}`, {credentials: "include",});
        const pdf = await res.blob();
        setPdfBlob(pdf);
      } finally {
        setIsGenerating(false);
      }

    }
    const handleClear = () => {
        setSelectedSensors([]);
      setChartTitle("");
        setFrom("");
        setTo("");
        setTimeInterval("hourly");
        setPdfBlob(null);
    }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-[#212529]">
      <SecondaryNav
        displayLogout={true}
        displayProfile={true}
        displayLogin={false}
      />
      <Navbar displayDashboards displayHome={false} displayAbout={false} displayReports={true} />
      <main className="flex-1 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 py-8">
        <h1 className="text-3xl font-semibold mb-6 text-[#212529]">
          Reports
        </h1>
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
            <PDFViewer pdfBlob={pdfBlob} onClear={handleClear} isGenerating={isGenerating} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}