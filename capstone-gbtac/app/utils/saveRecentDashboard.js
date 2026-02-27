const RECENT_KEY = "dashboard-recent";
const MAX_ITEMS = 5;

export function saveRecentDashboard(entry) {
  if (typeof window === "undefined") return;

  const existing = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");

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

export function loadRecentDashboards() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
}

export function clearRecentDashboards() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_KEY);
}
