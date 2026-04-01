import { db } from "../_utils/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

/**
 * loadDashboardState
 *
 * Retrieves and parses a dashboard's persisted state from localStorage.
 *
 * @param {string} key          - localStorage key to read from
 * @param {object} defaultState - Fallback value if nothing is stored or parsing fails
 * @returns {object} Parsed state object, or defaultState
 *
 * Notes:
 * - Returns defaultState on server-side calls (no window) to keep SSR safe.
 * - No schema validation — stale fields may be present if the shape changed.
 *
 * @author Cintya Lara Flores
 */
export function loadDashboardState(key, defaultState) {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultState;
  } catch {
    return defaultState;
  }
}

/**
 * saveDashboardState
 *
 * Serialises and persists a dashboard's state to localStorage.
 *
 * @param {string} key   - localStorage key to write to
 * @param {object} state - State object to serialise and store
 *
 * Notes:
 * - No-ops silently on server-side calls (no window).
 */
export function saveDashboardState(key, state) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(state));
}

//Custom Chart specific functions ******BUG******
return loadDashboardState("customChart", {
  id: null,
  title: "",
  sensors: [],
  dateFrom: null,
  dateTo: null,
});

/**
 * saveCustomChartState
 *
 * Persists the custom chart builder state to localStorage.
 *
 * @param {object} chart - Custom chart state to store
 */
export function saveCustomChartState(chart) {
  saveDashboardState("customChart", chart);
}

/**
 * fetchUserCharts
 *
 * Fetches all saved charts belonging to the given user from Firestore.
 *
 * @param {string} userEmail - Email address used as the Firestore document key
 * @returns {Promise<Array<{ id: string, [key: string]: any }>>} Array of chart
 *          objects, each with its Firestore document ID merged in
 *
 * Notes:
 * - Returns an empty array if the user has no charts.
 * - Throws if the Firestore request fails; callers should handle accordingly.
 */
export async function fetchUserCharts(userEmail) {
  const snapshot = await getDocs(
    collection(db, "allowedUsers", userEmail, "charts"),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * fetchChartById
 *
 * Fetches a single saved chart by its Firestore document ID.
 *
 * @param {string} userEmail - Email address used as the Firestore document key
 * @param {string} chartId   - Firestore document ID of the chart to fetch
 * @returns {Promise<{ id: string, [key: string]: any } | null>} The chart object
 *          with its document ID merged in, or null if the document does not exist
 *
 * Notes:
 * - Throws if the Firestore request fails; callers should handle accordingly.
 */
export async function fetchChartById(userEmail, chartId) {
  const snapshot = await getDoc(
    doc(db, "allowedUsers", userEmail, "charts", chartId),
  );
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

/**
 * deleteChart
 *
 * Deletes a chart from Firestore by its document ID.
 *
 * @param {string} userEmail - Email address used as the Firestore document key
 * @param {string} chartId   - Firestore document ID of the chart to delete
 * @returns {Promise<void>} A promise that resolves when the chart is deleted
 *
 * Notes:
 * - Throws if the Firestore request fails; callers should handle accordingly.
 */
export async function deleteChart(userEmail, chartId) {
  await deleteDoc(doc(db, "allowedUsers", userEmail, "charts", chartId));
}
