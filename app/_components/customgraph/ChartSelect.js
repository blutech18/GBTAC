//This component fetches Staff saved charts and allows them to select one to display from the dropdown. 
// It also has a delete button and loads a chart preview when a chart is selected.
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/_utils/firebase";
import { fetchUserCharts, fetchChartById, deleteChart } from "@/app/utils/storage";
import ConfirmModal from "../ConfirmModal";

export default function ChartSelect({
  currentChartId,
  onLoadChart,
  onDeleteChart,
  onResetChart,
  refreshChart
}) {

  const [charts, setCharts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch previously saved charts from Firestore
  useEffect(() => {
    const loadCharts = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const data = await fetchUserCharts(user.email);
        setCharts(data);
      } catch (err) {
        console.error("Failed to fetch charts:", err);
      }
    };
    loadCharts();
  }, [refreshChart]);

  // Handle chart selection from dropdown
  const handleSelect = async (e) => {
    const id = e.target.value;
    if (id === "new") {
      onResetChart();
      return;
    }

    const user = auth.currentUser;
    if (!user) return;
    try {
      const chart = await fetchChartById(user.email, id);
      if (chart) onLoadChart(chart);
    } catch (err) {
      console.error("Failed to fetch chart:", err);
    }
  };

  // Handle chart deletion
  const handleDelete = async () => {
    if (!currentChartId) return;
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteChart(user.email, currentChartId);
      onDeleteChart();
      setCharts(charts.filter(chart => chart.id !== currentChartId));
      alert("Chart deleted successfully!");
    } catch (err) {
      console.error("Failed to delete chart:", err);
      alert("Failed to delete chart");
    }
  };

  return (
    <div
      style={{ fontFamily: "var(--font-titillium)" }}
      className="bg-white rounded-sm shadow-sm p-4 w-1/2"
    >
      <h2 className="font-semibold text-black mb-2">
        Load An Existing Chart
      </h2>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <label className="text-sm text-black mb-1">Chart Title</label>
          <select
            value={currentChartId || "new"}
            onChange={handleSelect}
            className="border p-2 rounded text-gray-500 w-full"
          >
            <option value="new">-- Select a chart --</option>
            {charts.map(chart => (
              <option key={chart.id} value={chart.id}>
                {chart.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={!currentChartId}
            className={`px-6 py-2 rounded text-white w-full font-semibold ${
              currentChartId
                ? "bg-[#912932] hover:bg-red-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Info text */}
      <div className="mt-4 text-gray-500">
        {currentChartId
          ? "Loaded chart is editable below."
          : "Select an existing chart to view or edit."}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete Chart"
          message="Are you sure you want to delete this chart? This cannot be undone."
          confirmText="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
