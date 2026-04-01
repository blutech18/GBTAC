"use client";
import Link from "next/link";
/**
 * RecentDashboardCard component
 *
 * Displays a summary card for a recently saved dashboard.
 * Links to the dashboard path stored in the data object.
 *
 * @param {object} data - Saved dashboard data
 * @param {string} data.path - URL path to navigate to on click
 * @param {string} data.title - Display title of the dashboard
 * @param {string|number} [data.lastVisited] - Timestamp of last visit; shown as formatted date
 * @param {object} [data.summary] - Dashboard-specific summary fields
 * @param {string} [data.summary.fromDate] - Start date of the saved date range
 * @param {string} [data.summary.toDate] - End date of the saved date range
 *
 * Notes:
 * - Marked as client component to avoid hydration mismatch from new Date()
 * - Summary fields are optional and rendered only when present
 *
 * @returns A clickable dashboard summary card
 *
 * @author Cintya Lara Flores
 */

export default function RecentDashboardCard({ data }) {
  return (
    <Link href={data.path}>
      <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer">
        <h3 className="text-lg font-medium">{data.title}</h3>

        <p className="text-sm text-gray-500 mt-1">
          Last saved: {new Date(data.lastVisited).toLocaleString()}
        </p>

        <div className="mt-3 text-sm space-y-1">
          <p>
            <span className="font-medium">Date range:</span>{" "}
            {data.summary.fromDate || "—"} → {data.summary.toDate || "—"}
          </p>

          <p>
            <span className="font-medium">Graphs:</span>{" "}
            {data.summary.graphs?.slice(0, 5).join(", ") || "Default"}
            {data.summary.graphs?.length > 5 ? ", ..." : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
