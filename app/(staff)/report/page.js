"use client";

import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import ReportControls from "@/app/_components/reports/ReportControls";
import PDFViewer from "../../_components/reports/PdfViewer";
import { useState } from "react";

export default function Page() {

    const [selectedSensors, setSelectedSensors] = useState([]);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [timeInterval, setTimeInterval] = useState("hourly");
    const [pdfBlob, setPdfBlob] = useState(null);

    const handleGenerate = async () => {
        console.log(selectedSensors);
        const res = await fetch(`http://127.0.0.1:8000/report/?sensors=${selectedSensors.map(s => s.code).join(",")}&start=${from}&end=${to}&agg=${timeInterval}&agg_type=mean`);
        const pdf = await res.blob();
        setPdfBlob(pdf);

    }
    const handleClear = () => {
        setSelectedSensors([]);
        setFrom("");
        setTo("");
        setTimeInterval("hourly");
        setPdfBlob(null);
    }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-[#212529]" style={{ fontFamily: "var(--font-titillium)" }}>
      <SecondaryNav
        displayLogout={true}
        displayProfile={true}
        displayLogin={false}
      />
      <Navbar displayDashboards displayHome={false} displayAbout={false} />
      <main className="flex-1 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 py-8">
        <h1 className="text-3xl font-semibold mb-6 text-[#212529]">
          Reports
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="col-span-1 p-6 bg-white shadow-md rounded-xl border space-y-6">
            <div className="text-xl font-semibold mb-4 text-[#212529]">
              Report Controls
            </div>
            <ReportControls
              selectedSensors={selectedSensors}
              onSensorsChange={setSelectedSensors}
              from={from}
              onFromChange={setFrom}
              to={to}
              onToChange={setTo}
              timeInterval={timeInterval}
              onTimeIntervalChange={setTimeInterval}
              onGenerate={handleGenerate}
            />
          </div>
          <div className="col-span-2">
            <PDFViewer pdfBlob={pdfBlob} onClear={handleClear} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}