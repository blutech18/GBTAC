// Page: Energy Overview (Guest)
// Read-only public-facing version of the Energy Dashboard.
// Same layout as EnergyDashboard — just DatePicker + aggregation + chart.
// No KPI cards, no unit toggle, no save button, no pie chart.
//
// @author Temi Bankole
// @author Dominique Lee

"use client";

import { useState } from "react";
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import Breadcrumbs from "../../_components/Breadcrumbs";
import DatePicker from "../../_components/DatePicker";
import LineHandler from "../../_components/graphs/handlers/LineHandler";
import { useDateValidation } from "../../_components/hooks/useDateValidation";

const stateDefaults = { fromDate: "2024-10-01", toDate: "2024-10-07" };

export default function EnergyData() {
  const [state, setState] = useState(stateDefaults);

  const [appliedState, setAppliedState] = useState({
    fromDate: stateDefaults.fromDate,
    toDate: stateDefaults.toDate,
  });

  const [aggregation, setAggregation] = useState("none");

  const { errors, validateAll } = useDateValidation({
    earliestDate: "2019-02-13",
    latestDate: "2025-12-31",
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <SecondaryNav displayDashboards={true} />
      <Navbar />

      <div className="bg-gray-100">
        <Breadcrumbs />
      </div>

      <main className="flex-1 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 px-4 py-2">
        <div className="mx-auto bg-white rounded-md shadow-sm px-12 py-10">

          <div className="mb-5">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Energy Trends
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View GBTAC building energy data over time
            </p>
          </div>

          {/* ── Date range picker + aggregation ── */}
          <div className="flex flex-wrap gap-6 items-start mb-8">
            <DatePicker
              fromDate={state.fromDate}
              toDate={state.toDate}
              errors={errors}
              onDateChange={(field, value) => {
                setState((prev) => ({
                  ...prev,
                  [field === "from" ? "fromDate" : "toDate"]: value,
                }));
              }}
              setDate={({ fromDate, toDate }) => {
                setState((prev) => ({ ...prev, fromDate, toDate }));
                if (fromDate && toDate && validateAll(fromDate, toDate)) {
                  setAppliedState({ fromDate, toDate });
                } else {
                  setAppliedState(null);
                }
              }}
              aggregation={aggregation}
              setAggregation={setAggregation}
            />
          </div>

          {/* ── Chart ── */}
          <div className="grid grid-cols-1 gap-6 mt-6">
            {appliedState ? (
              <LineHandler
                key={`${appliedState.fromDate}-${appliedState.toDate}-${aggregation}`}
                sensorList={[
                  "30000_TL340",
                  "30000_TL341",
                  "30000_TL339",
                ]}
                startDate={appliedState.fromDate}
                endDate={appliedState.toDate}
                graphTitle={`Consumption vs Generation, ${appliedState.fromDate} to ${appliedState.toDate}`}
                yTitle={"Wh"}
                xTitle={"hours"}
                xUnit={"hour"}
                aggTime={aggregation}
                aggType={"sum"}
                apiPrefix="/graphs/guest"
              />
            ) : (
              <div className="flex items-center justify-center h-80 rounded-md border border-dashed border-gray-300 text-gray-400 text-sm">
                Select a valid date range and click Apply
              </div>
            )}
          </div>
        </div>
        <div className="text-center text-lg text-gray-500 mt-8 px-4">
          This information is displayed for educational purposes only.
        </div>
      </main>
      <Footer />
    </div>
  );
}
