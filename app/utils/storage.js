import { db } from "../_utils/firebase"
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";

//Dashboard-specific localStorage functions. 
export function loadDashboardState(key, defaultState) {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultState;
  } catch {
    return defaultState;
  }
}

export function saveDashboardState(key, state) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(state));
}

//Custom Chart specific functions
  return loadDashboardState("customChart", {
    id: null,
    title: "",
    sensors: [],
    dateFrom: null,
    dateTo: null
  });

export function saveCustomChartState(chart) {
  saveDashboardState("customChart", chart);
}

//Chart-specific localStorage functions. 
export async function fetchUserCharts(userEmail) {
  const snapshot = await getDocs(
    collection(db, "allowedUsers", userEmail, "charts")
  );
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

//Fetch a single chart by ID
export async function fetchChartById(userEmail, chartId) {
  const snapshot = await getDoc(
    doc(db, "allowedUsers", userEmail, "charts", chartId)
  );
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

//Delete a chart by ID
export async function deleteChart(userEmail, chartId) {
  await deleteDoc(
    doc(db, "allowedUsers", userEmail, "charts", chartId)
  );
}