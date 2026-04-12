"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/_utils/firebase";
import { fetchUserCharts, fetchChartById, deleteChart } from "@/app/utils/storage";
import ConfirmModal from "../ConfirmModal";
import NotificationModal from "../NotificationModal";

/**
 * @author Temi Bankole
 */

/**
 * ChartSelect
 *
 * Fetches and displays a dropdown of the current staff user's saved charts.
 * Selecting a chart loads it into the editor; a delete button removes the
 * currently loaded chart after confirmation.
 *
 * @param {string|null} currentChartId - ID of the currently loaded chart, or null if none selected
 * @param {Function} onLoadChart - Called with the full chart object when a saved chart is selected
 * @param {Function} onDeleteChart - Called after the current chart is successfully deleted
 * @param {Function} onResetChart - Called when the user selects the "new chart" option
 * @param {any} refreshChart - Changing this value triggers a re-fetch of the user's saved charts
 *
 * Notes:
 * - Requires a Firebase authenticated user — renders but does nothing if auth.currentUser is null
 * - Chart list is re-fetched whenever refreshChart changes, allowing parents to trigger a refresh
 *   after a save
 */
export default function ChartSelect({
  currentChartId,
  onLoadChart,
  onDeleteChart,
  onResetChart,
  refreshChart
}) {

  const [charts, setCharts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    variant: "success",
  });

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

  const handleDelete = async () => {
    setShowDeleteModal(false);

    if (!currentChartId) return;
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteChart(user.email, currentChartId);
      onDeleteChart();
      setCharts(prevCharts => prevCharts.filter(chart => chart.id !== currentChartId));
      setNotification({
        open: true,
        title: "Success",
        message: "Chart deleted successfully!",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to delete chart:", err);
      setNotification({
        open: true,
        title: "Error",
        message: "Failed to delete chart",
        variant: "error",
      });
    }
  };

  return (
    <div className="bg-white rounded shadow-sm p-4 w-1/2">
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

      {/* Hint text — reflects whether a chart is currently loaded */}
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

      {notification.open && (
        <NotificationModal
          title={notification.title}
          message={notification.message}
          variant={notification.variant}
          onClose={() =>
            setNotification({
              open: false,
              title: "",
              message: "",
              variant: "success",
            })
          }
        />
      )}
    </div>
  );
}