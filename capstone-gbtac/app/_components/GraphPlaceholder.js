/**
 * GraphPlaceholder
 *
 * Displays a spinning loading indicator while a graph is being fetched or
 * rendered. Intended to occupy the same space as the graph it precedes.
 *
 * @param {string} [height="h-64"] - Tailwind height class applied to the container
 *
 * Notes:
 * - height should match the height of the graph it replaces to prevent layout shift
 * @author Temi Bankole
 */
export default function GraphPlaceholder({ height = "h-64" }) {
  return (
    <div
      className={`w-full ${height} bg-white rounded-lg shadow flex items-center justify-center`}
    >
      <div className="flex flex-col items-center gap-2 text-gray-600">
        <svg
          className="animate-spin h-8 w-8 text-[#6D2077]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-sm font-medium">Loading graph...</span>
      </div>
    </div>
  );
}