"use client";
// Page for Customizable Graph Section
import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import ChartSettings from "../../../_components/customgraph/ChartSettings";
import SensorSearch from "../../../_components/customgraph/SensorSearch";
import SelectedSensors from "../../../_components/customgraph/SelectedSensors";
import GraphPlaceholder from "@/app/_components/GraphPlaceholder";
import DateRange from "../../../_components/customgraph/DateRange";
import ChartSelect from "../../../_components/customgraph/ChartSelect";
import { useState, useRef, useEffect } from "react";
import ExportPDFButton from "@/app/_components/ExportPDFButton";



export default function Page() {

  // State for erros
  const [error, setError] = useState(null);

  // Chart ref for PDF export
  const chartRef = useRef(null);

  // Applied chart state (what GraphContainer actually reads)
  const [currentChartId, setCurrentChartId] = useState(null);
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "2025-12-31", to: "2025-12-31" });
  const [chartSettings, setChartSettings] = useState({
    chartTitle: "",
    xAxisTitle: "",
    yAxisTitle: "",
    chartType: "line",
  })

  // Temp state (user edits these before clicking Apply)
  const [tempSelectedSensors, setTempSelectedSensors] = useState(selectedSensors);
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [tempChartSettings, setTempChartSettings] = useState(chartSettings)
  
  // full list of sensors and codes
  const [sensorList, setSensorList] = useState([])
  const fetchSensors = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/graphs/codesnames")
      const data = await res.json()
      setSensorList(data)
    }catch (e){
      console.log(e)
    }
  }

  useEffect(()=> {
    fetchSensors()
  }, [])

  // Reset chart to default
  const resetChart = () => {
    setCurrentChartId(null);
    setChartSettings({
      chartTitle: "",
      xAxisTitle: "",
      yAxisTitle: "",
      chartType: "line",
    })
    setSelectedSensors([]);
    setDateRange({ from: null, to: null });

    // Also reset temp state
    setTempChartSettings({
      chartTitle: "",
      xAxisTitle: "",
      yAxisTitle: "",
      chartType: "line",
    })
    setTempSelectedSensors([]);
    setTempDateRange({ from: null, to: null });
  }

  // Load a chart into state
  const loadChart = (chart) => {
    setCurrentChartId(chart.id);
    setSettings(chart.settings);
    setSelectedSensors(chart.sensors);
    setDateRange({ from: chart.dateFrom, to: chart.dateTo });

    // Also update temp state so the inputs match loaded chart
    setTempSettings(chart.settings);
    setTempSelectedSensors(chart.sensors);
    setTempDateRange({ from: chart.dateFrom, to: chart.dateTo });
  }

  // Apply button handler
  const handleApply = () => {
    setError(null); // Clear previous errors
    // Basic validation
    if (!tempChartSettings) {
      setError("Please enter chart settings.");
      return;
    } 
    if (tempSelectedSensors.length === 0) {
      setError("Please select at least one sensor.");
      return;
    }
    if (!tempDateRange.from || !tempDateRange.to) {
      setError("Please select a valid date range.");
      return;
    }
    if (new Date(tempDateRange.from) > new Date(tempDateRange.to)) {
      setError("Start date cannot be after end date.");
      return;
    }
    // If all validations pass, update the main state with temp values
    setChartSettings(tempChartSettings);
    setSelectedSensors(tempSelectedSensors);
    setDateRange(tempDateRange);
  }
  useEffect(() => {
    console.log(settings)
    
  }, [selectedSensors])

  return (
    <main className="bg-gray-50 min-h-screen">
      <SecondaryNav />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-10 dark:text-black"
          style={{ fontFamily: "var(--font-titillium)" }}>
          Create Custom Chart
        </h1>

        {/* Chart Selection */}
        <div className="mb-5 w-full md:w-1/2">
          <ChartSelect
            currentChartId={currentChartId}
            onLoadChart={loadChart}
            onDeleteChart={resetChart}
            onResetChart={resetChart}
          />
        </div>

        {/* Chart Settings and Date Range */}
        <div className="flex flex-col md:flex-row gap-4 mb-5 w-full">
          <ChartSettings
            settings={tempChartSettings}
            setSettings={setTempChartSettings}
          />
          <DateRange
            dateRange={tempDateRange}
            setDateRange={setTempDateRange}
          />
        </div>

        {/* Sensor Search and Selected Sensors */}
        <div className="flex gap-4 mb-4">
          <SensorSearch
            selectedSensors={tempSelectedSensors}
            setSelectedSensors={setTempSelectedSensors}
            availableSensors={sensorList}
            className="flex-1"
          />
          <SelectedSensors
            selectedSensors={tempSelectedSensors}
            setSelectedSensors={setTempSelectedSensors}
            className="flex-1"
          />
        </div>

          {/* Error Message Display*/}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>

        {/* Graph below */}
        <div className="w-full" ref={chartRef}>
          <GraphContainer 
            selectedSensors={selectedSensors} 
            dateRange={dateRange}
            settings={settings}
          />
        </div>

        {/* Ssve and Export PDF button */}
        <div className="flex justify-end mt-6">
        </div>
          <div className="flex justify-end gap-4">
            <button className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
          >
            Save View
            </button>
            <ExportPDFButton
              chartRef={chartRef}
              fileName={tempChartSettings || "custom_chart"}
            />
          </div>
      </div>
      <Footer />
    </main>
  );
}