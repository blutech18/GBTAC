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

export default function RecentDashboardCard({ data, onDelete }) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition group">
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete?.(data.id);
        }}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
        aria-label="Remove dashboard"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <Link href={data.path} className="block p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#005EB8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {data.title}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Last saved: {new Date(data.lastVisited).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-3" />

        {/* Meta */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 flex-shrink-0"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-gray-500">
              {data.summary.fromDate || "—"} → {data.summary.toDate || "—"}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 flex-shrink-0 mt-0.5"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span className="text-gray-500 line-clamp-1">
              {data.summary.graphs?.length > 0
                ? data.summary.graphs.slice(0, 5).join(", ")
                : "Default"}
              {data.summary.graphs?.length > 5 ? ", ..." : ""}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
