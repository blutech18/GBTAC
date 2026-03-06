//Dashbnoard-specific localStorage functions. 
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
