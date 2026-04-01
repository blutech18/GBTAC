const RECENT_KEY = "dashboard-recent";
const MAX_ITEMS = 5;

/**
 * saveRecentDashboard
 *
 * Prepends an entry to the recently visited dashboards list in localStorage,
 * deduplicates by id, and trims the list to MAX_ITEMS (5).
 *
 * @param {{ id: string, [key: string]: any }} entry - Dashboard to record;
 *        must include an id field for deduplication
 *
 * Notes:
 * - No-ops silently on server-side calls (no window).
 * - lastVisited is always overwritten with the current timestamp, even if the
 *   entry already existed in the list.
 * - Guard against missing lastVisited from stale localStorage entries by
 *   always spreading entry last and setting lastVisited explicitly.
 *
 * @author Cintya Lara Flores
 */

export function saveRecentDashboard(entry) {
  if (typeof window === "undefined") return;

  const existing = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");

  // Remove any prior record of this dashboard before prepending the fresh one
  const filtered = existing.filter((e) => e.id !== entry.id);

  const updated = [
    {
      ...entry,
      lastVisited: new Date().toISOString(),
    },
    ...filtered,
  ].slice(0, MAX_ITEMS);

  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

/**
 * loadRecentDashboards
 *
 * Retrieves the recently visited dashboards list from localStorage.
 *
 * @returns {Array<{ id: string, lastVisited: string, [key: string]: any }>}
 *          Ordered list of recent dashboards, most recent first, or an empty
 *          array if nothing is stored or on server-side calls.
 *
 * Notes:
 * - No schema validation — stale fields may be present if the shape changed.
 */
export function loadRecentDashboards() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
}

/**
 * clearRecentDashboards
 *
 * Removes the recently visited dashboards list from localStorage entirely.
 *
 * Notes:
 * - No-ops silently on server-side calls (no window).
 */
export function clearRecentDashboards() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_KEY);
}
