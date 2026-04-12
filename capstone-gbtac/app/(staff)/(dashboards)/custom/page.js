"use client";

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

// Set defaults for chart and aggregation settings
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

/**
 * Page (Create Custom Chart)
 *
 * Allows users to build custom charts by selecting sensors, configuring chart
 * settings (title, type, axis labels), choosing a date range and aggregation
 * method, and previewing the result. Charts can be saved to Firestore and
 * exported as PDF.
 *
 * Non-obvious behavior:
 * - Maintains both "temp" state (user edits) and "main" state (applied values)
 *   to allow canceling edits without affecting the displayed chart.
 * - Content safety checks combined all titles into a single string to reduce
 *   API calls.
 * - Chart key uses currentChartId or "new" to force re-render of GraphContainer
 *   when loading a different saved chart.
 *
 * Notes:
 * - Commented out safety checks (lines ~160–170) can be re-enabled per-field
 *   if stricter validation is desired.
 * - Commented out example selectedSensors (lines ~55–58) used for development
 *   testing; remove or keep as reference.
 * - dataRange is fetched at module level (server-side); if client-side
 *   re-fetch is needed, move to useEffect.
 * @author Temi Bankole
 * @returns The custom chart builder page
 */
export default function Page() {
  const chartRef = useRef(null);

  // Applied state — reflects what is currently displayed in the graph
  const [currentChartId, setCurrentChartId] = useState(null);
  const [chartSettings, setChartSettings] = useState(chartSettingDefaults)
  const [aggregationSettings, setAggregationSettings] = useState(aggregationSettingsDefaults)
  const [dateRange, setDateRange] = useState(dateRangeDefaults);
  const [selectedSensors, setSelectedSensors] = useState([]);

  // Temp state — user edits these before clicking Apply
  const [tempChartSettings, setTempChartSettings] = useState(chartSettings);
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [tempAggregationSettings, setTempAggregationSettings] = useState(aggregationSettings)
  const [tempSelectedSensors, setTempSelectedSensors] = useState(selectedSensors);
  
  const [refreshChart, setRefreshChart] = useState(0);
  const [error, setError] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  
  // Full list of available sensors fetched on mount
  const [sensorList, setSensorList] = useState([])
  const fetchSensors = async () => {
    try {
      // Pull sensor codes/names once and feed both search + selected lists.
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphs/codesnames`, {credentials: "include",})
      const data = await res.json()
      setSensorList(data)
    }catch (e){
      console.log(e)
    }
  }
  useEffect(()=> {
    fetchSensors()
  }, [])

  /**
   * Resets the chart and all state to defaults. Used when the user clicks
   * "Reset Chart" or deletes the currently loaded chart.
   */
  const resetChart = () => {
    setCurrentChartId(null);
    setTempChartSettings(chartSettingDefaults);
    setTempDateRange(dateRangeDefaults);
    setTempSelectedSensors([]);
    setSelectedSensors([]);
    setDateRange(dateRangeDefaults);
    setAggregationSettings(aggregationSettingsDefaults)
    setTempChartSettings(chartSettingDefaults)
    setTempSelectedSensors([]);
    setTempDateRange(dateRangeDefaults);
    setTempAggregationSettings(aggregationSettingsDefaults)
  }

  /**
   * Loads a saved chart into state. Handles multiple schema versions
   * (selectedSensors vs sensors, dateRange vs dateFrom/dateTo, etc.) to
   * support backwards compatibility with older saved charts.
   *
   * @param {object} chart - Saved chart object from Firestore
   */
  const loadChart = (chart) => {
    setError("");
    const chartSensors = Array.isArray(chart?.selectedSensors)
      ? chart.selectedSensors
      : (Array.isArray(chart?.sensors) ? chart.sensors : []);
    // Support legacy payload shapes from previously saved charts.
    const chartFrom = chart?.dateRange?.from ?? chart?.dateFrom ?? dateRangeDefaults.from;
    const chartTo = chart?.dateRange?.to ?? chart?.dateTo ?? dateRangeDefaults.to;
    const chartAggTime = chart?.aggSettings?.time ?? chart?.time ?? dateRangeDefaults.time;
    const chartAggType = chart?.aggSettings?.type ?? chart?.type ?? dateRangeDefaults.type;

    setCurrentChartId(chart.id);
    setChartSettings(chart.settings ?? chartSettingDefaults);
    setSelectedSensors(chartSensors);
    setDateRange({ from: chartFrom, to: chartTo });
    setAggregationSettings({time: chartAggTime, type: chartAggType})

    // Update temp state so form inputs match loaded chart
    setTempChartSettings(chart.settings ?? chartSettingDefaults);
    setTempSelectedSensors(chartSensors);
    setTempDateRange({ from: chartFrom, to: chartTo });
    setTempAggregationSettings({time: chartAggTime, type: chartAggType})
  }

  /**
   * Validates temp state and applies it to main state if all checks pass.
   * Validates chart title/axis titles (alphanumeric + spaces/hyphens, max 50 chars),
   * aggregation settings, sensor selection, date range, and date order.
   * Runs content safety check on all titles combined.
   *
   * Notes:
   * - Per-field safety checks are commented out (lines ~160–170); can be
   *   re-enabled for stricter validation if needed.
   * - All titles are combined into one string for a single API call.
   */
  const handleApply = async () => {
    if (
      !tempChartSettings.chartTitle ||
      !/^[a-zA-Z0-9\s-]*$/.test(tempChartSettings.chartTitle) ||
      tempChartSettings.chartTitle.length > 50 ||
      (tempChartSettings.xAxisTitle && !/^[a-zA-Z0-9\s-]*$/.test(tempChartSettings.xAxisTitle)) ||
      (tempChartSettings.yAxisTitle && !/^[a-zA-Z0-9\s-]*$/.test(tempChartSettings.yAxisTitle)) ||
      !["line", "bar"].includes(tempChartSettings.chartType)
    ) {
      setError("Please handle all errors in Chart Settings before applying.");
      return;
    }
    if (!["none", "H", "D", "M", "Y"].includes(tempAggregationSettings.time) ||
    !["mean", "sum"].includes(tempAggregationSettings.type)) {
      setError("Please handle all errors in Time and Aggregation Settings before applying.");
      return;
    }
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
    
    let titles = tempChartSettings.chartTitle + " " + tempChartSettings.xAxisTitle + " " + tempChartSettings.yAxisTitle
    if(! await checkSafety(titles)){
      setError("Chart title or axis titles contain inappropriate content. Please modify and try again.");
      return;
    }

    // If all validations pass, update main state with temp values
    setChartSettings(tempChartSettings);
    setSelectedSensors(tempSelectedSensors);
    setDateRange(tempDateRange);
    setAggregationSettings(tempAggregationSettings)
    setError("")
  };

  /**
   * Saves the current chart configuration to Firestore. Updates currentChartId
   * and refreshes the GraphContainer. Shows success or error notification.
   *
   * Notes:
   * - If currentChartId is null, a new chart document is created.
   * - If currentChartId exists, that chart is updated.
   * - Notifications auto-dismiss after 3 seconds.
   */
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
      //Trigger ChartSelect reload so newly saved/updated chart appears immediately.
      setRefreshChart(prev => prev + 1);
    } catch (err) {
      console.error("Failed to save chart:", err);
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
    }
  };

  return (
    <DashboardLayout title="">
      <div className="w-full -mt-2 md:-mt-4">
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
        <div className="flex flex-col md:flex-row items-stretch gap-4 mb-5 w-full">
          <div className="w-full md:w-1/2 flex">
            <ChartSettings
              settings={tempChartSettings}
              setSettings={setTempChartSettings}
            />
          </div>
          <div className="w-full md:w-1/2 flex">
            <DateRange
              dateRange={tempDateRange}
              setDateRange={setTempDateRange}
              aggSettings={tempAggregationSettings}
              setAggSettings={setTempAggregationSettings}
            />
          </div>
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

        {/* Graph renders below with key to force re-render on chart load */}
        <div className="w-full overflow-hidden shadow-sm rounded-lg" ref={chartRef}>
          <GraphContainer 
            key={currentChartId ?? "new"}
            selectedSensors={selectedSensors} 
            dateRange={dateRange}
            settings={chartSettings}
            aggSettings={aggregationSettings}
          />
        </div>

        {/* Save and Export PDF buttons */}
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