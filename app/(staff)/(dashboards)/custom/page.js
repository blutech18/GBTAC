"use client";

//Page for Customizable Graph Section
import ChartSettings from "../../../_components/customgraph/ChartSettings";
import SensorSearch from "../../../_components/customgraph/SensorSearch";
import SelectedSensors from "../../../_components/customgraph/SelectedSensors";
import GraphContainer from "@/app/_components/customgraph/GraphContainer";
import DateRange from "../../../_components/customgraph/DateRange";
import DashboardLayout from "@/app/_components/DashboardLayout";
import ExportPDFButton from "@/app/_components/ExportPDFButton";
import ChartSelect from "@/app/_components/customgraph/ChartSelect";
import ConfirmModal from "@/app/_components/ConfirmModal";
import NotificationModal from "@/app/_components/NotificationModal";
import { saveCustomDashboard } from "@/app/utils/saveCustomizedCharts";
import { auth } from "@/app/_utils/firebase";
import { useRef, useState, useEffect } from "react";
import { checkSafety } from "@/app/_utils/content-safety";
import { getDataRange } from "@/app/_utils/get-data-range";

const dataRange = await getDataRange();

// set defaults for state variables
const chartSettingDefaults = {
  chartTitle: "",
  chartType: "line",
  xAxisTitle: "",
  yAxisTitle: ""
}
const aggregationSettingsDefaults = {
  time: "none", 
  type: "mean"
}
const dateRangeDefaults = { 
  from: dataRange.newest, 
  to: dataRange.newest, 
  timeInterval: aggregationSettingsDefaults.time, 
  aggregation: aggregationSettingsDefaults.type 
}

export default function Page() {
  const chartRef = useRef(null);

  //State variables
  const [currentChartId, setCurrentChartId] = useState(null);
  const [chartSettings, setChartSettings] = useState(chartSettingDefaults)
  const [aggregationSettings, setAggregationSettings] = useState(aggregationSettingsDefaults)
  const [dateRange, setDateRange] = useState(dateRangeDefaults);
  const [selectedSensors, setSelectedSensors] = useState([]);
  // const [selectedSensors, setSelectedSensors] = useState([
  //   {code: "30000_TL252", name: "Carport"},
  //   {code: "30000_TL253", name: "Rooftop"}
  // ]);

  // Temp state (user edits these before clicking Apply)
  const [tempChartSettings, setTempChartSettings] = useState(chartSettings);
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [tempAggregationSettings, setTempAggregationSettings] = useState(aggregationSettings)
  const [tempSelectedSensors, setTempSelectedSensors] = useState(selectedSensors);
  
  const [refreshChart, setRefreshChart] = useState(0); // Used to trigger re-render of graph when loading/saving charts
  const [error, setError] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  
  // full list of sensors and codes
  const [sensorList, setSensorList] = useState([])
  const fetchSensors = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphs/codesnames`, {credentials: "include",})
      const data = await res.json()
      setSensorList(data)
    }catch (e){
      console.log(e)
    }
  }

  useEffect(()=> {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSensors()
  }, [])

  // Reset chart to default
  const resetChart = () => {
    setCurrentChartId(null);
    setTempChartSettings(chartSettingDefaults);
    setTempDateRange(dateRangeDefaults);
    setTempSelectedSensors([]);
    setSelectedSensors([]);
    setDateRange(dateRangeDefaults);
    setAggregationSettings(aggregationSettingsDefaults)

    // Also reset temp state
    setTempChartSettings(chartSettingDefaults)
    setTempSelectedSensors([]);
    setTempDateRange(dateRangeDefaults);
    setTempAggregationSettings(aggregationSettingsDefaults)
  }

  // Load a chart into state
  const loadChart = (chart) => {
    setError("");
    const chartSensors = Array.isArray(chart?.selectedSensors)
      ? chart.selectedSensors
      : (Array.isArray(chart?.sensors) ? chart.sensors : []);
    const chartFrom = chart?.dateRange?.from ?? chart?.dateFrom ?? dateRangeDefaults.from;
    const chartTo = chart?.dateRange?.to ?? chart?.dateTo ?? dateRangeDefaults.to;
    const chartAggTime = chart?.aggSettings?.time ?? chart?.time ?? dateRangeDefaults.time;
    const chartAggType = chart?.aggSettings?.type ?? chart?.type ?? dateRangeDefaults.type;

    setCurrentChartId(chart.id);
    setChartSettings(chart.settings ?? chartSettingDefaults);
    setSelectedSensors(chartSensors);
    setDateRange({ from: chartFrom, to: chartTo });
    setAggregationSettings({time: chartAggTime, type: chartAggType})

    // Also update temp state so the inputs match loaded chart
    setTempChartSettings(chart.settings ?? chartSettingDefaults);
    setTempSelectedSensors(chartSensors);
    setTempDateRange({ from: chartFrom, to: chartTo });
    setTempAggregationSettings({time: chartAggTime, type: chartAggType})
  }

  // Apply button handler
  const handleApply = async () => {
    if (tempSelectedSensors.length === 0) {
      setError("Please select at least one sensor");
      return;
    }
    if (!tempDateRange.from || !tempDateRange.to) {
      setError("Please select a date range");
      return;
    }
    if (new Date(tempDateRange.from) > new Date(tempDateRange.to)) {
      setError("Start date cannot be after end date.");
      return;
    }
    
    if(! await checkSafety(tempChartSettings.chartTitle)){
      setError("Title must be appropriate");
      return;
    }
    if(! await checkSafety(tempChartSettings.xAxisTitle)){
      setError("X Axis Title must be appropriate");
      return;
    }
    if(! await checkSafety(tempChartSettings.yAxisTitle)){
      setError("Y Axis Title must be appropriate");
      return;
    }

    // If all validations pass, update the main state with temp values
    setChartSettings(tempChartSettings);
    setSelectedSensors(tempSelectedSensors);
    setDateRange(tempDateRange);
    setAggregationSettings(tempAggregationSettings)
    setError("")
  };

   //Function to save chart to Firestore
  const handleSave = async () => {
    const user = auth.currentUser;
    try {
      const savedId = await saveCustomDashboard({
        userEmail: user.email,
        chartId: currentChartId,
        settings: tempChartSettings,
        dateRange: tempDateRange,
        selectedSensors: tempSelectedSensors,
        aggSettings: tempAggregationSettings
      });
      setCurrentChartId(savedId);
      setShowSaveModal(false);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
      setRefreshChart(prev => prev + 1);
    } catch (err) {
      console.error("Failed to save chart:", err);
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000); //3 second timeout for error notification
    }
  };

  return (
    <DashboardLayout title="">
      <div className="mx-auto w-full max-w-7xl -mt-2 md:-mt-4">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Create Custom Chart
        </h1>
        <div className="mb-4 md:mb-5 w-full max-w-md md:max-w-none md:w-1/2">
          <ChartSelect
            currentChartId={currentChartId}
            onLoadChart={loadChart}
            onDeleteChart={resetChart}
            onResetChart={resetChart}
            refreshChart={refreshChart}
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
            aggSettings={tempAggregationSettings}
            setAggSettings={setTempAggregationSettings}
          />
        </div>

        <div className="flex flex-col xl:flex-row gap-4 mb-4">
          <div className="w-full xl:w-1/2 flex flex-col">
            <SensorSearch
              selectedSensors={tempSelectedSensors}
              setSelectedSensors={setTempSelectedSensors}
              availableSensors={sensorList}
              className="flex-1"
            />
          </div>
          <div className="w-full xl:w-1/2 flex flex-col">
            <SelectedSensors
              selectedSensors={tempSelectedSensors}
              setSelectedSensors={setTempSelectedSensors}
              className="flex-1"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 md:p-2 bg-red-100 text-red-700 rounded-sm text-sm md:text-base">
            {error}
          </div>
        )}

        <div className="mb-5 md:mb-4 flex justify-end">
          <button
            className="px-10 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition w-full xl:w-auto"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>

        {/* Graph below */}
        <div className="w-full overflow-hidden shadow-sm rounded-lg" ref={chartRef}>
          <div style={{ height: "700px" }} className="w-full">
          <GraphContainer 
            key={currentChartId ?? "new"}
            selectedSensors={selectedSensors} 
            dateRange={dateRange}
            settings={chartSettings}
            aggSettings={aggregationSettings}
          />
          </div>
        </div>

        {/* Save and Export PDF button */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-5">
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-6 py-2 md:px-4 md:py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition w-full sm:w-auto order-2 sm:order-1"
          >
            Save Chart
          </button>
          <div className="w-full sm:w-auto order-1 sm:order-2">
            <ExportPDFButton
              chartRef={chartRef}
              fileName={tempChartSettings.chartTitle || "custom_chart"}
            />
          </div>
        </div>
      </div>
      {showSaveModal && (
        <ConfirmModal
          title="Save Chart"
          message="Are you sure you want to save this chart? It can be deleted later."
          confirmText="Save"
          variant="primary"
          onConfirm={handleSave}
          onCancel={() => setShowSaveModal(false)}
        />
      )}
      {showSuccessNotification && (
        <NotificationModal
          title="Success"
          message="Chart saved successfully!"
          onClose={() => setShowSuccessNotification(false)}
        />
      )}
      {showErrorNotification && (
        <NotificationModal
          title="Error"
          message="Failed to save chart. Please try again."
          variant="error"
          onClose={() => setShowErrorNotification(false)}
        />
      )}
    </DashboardLayout>
  );
}