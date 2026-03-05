"use client";

//Page for Customizable Graph Section
import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import ChartSettings from "../../../_components/customgraph/ChartSettings";
import SensorSearch from "../../../_components/customgraph/SensorSearch";
import SelectedSensors from "../../../_components/customgraph/SelectedSensors";
import GraphPlaceholder from "@/app/_components/GraphPlaceholder";
import DateRange from "../../../_components/customgraph/DateRange";
import ExportPDFButton from "@/app/_components/ExportPDFButton";
import { useRef } from "react";

export default function Page() {
  const chartRef = useRef(null);

  return (
    <main className="bg-gray-50 min-h-screen">
      <SecondaryNav />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-10 dark:text-black"
          style={{ fontFamily: "var(--font-titillium)" }}>
          Create Custom Chart
        </h1>

        {/*Chart Settings and Date Range*/}
        <div className="flex gap-4 mb-5">
          <ChartSettings />
          <DateRange />
        </div>
      
        {/*Sensor Search and Selected Sensors*/}
        <div className="flex gap-4">
          <SensorSearch />
          <SelectedSensors />
        </div>
        <div ref={chartRef}>
          <GraphPlaceholder />
        </div>
        <div className="flex justify-end gap-4 mt-4">
        <button className="bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition px-4 py-2">
          Save View
        </button>
        <ExportPDFButton chartRef={chartRef} fileName="custom-chart" />
      </div>
      </div>
      <Footer />
    </main>
  );
}
