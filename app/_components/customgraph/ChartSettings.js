//This component contains various settings for customizing the chart display such as titles, axis, and chart type. 
//This component also has two other dropdowns containing the times (Hourly, Daily, Monthly, Yearly) and the aggregation.
"use client";

export default function ChartSettings({settings, setSettings}) {

  return (
    <div style={{ fontFamily: "var(--font-titillium)" }} className="bg-white rounded-sm shadow-sm p-4 mt-1 w-1/2">
      <h2 className="font-semibold text-black mb-7">Chart Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
        <input
          type="text"
          placeholder="Chart Title"
          value={settings.chartTitle}
          onChange={(e) => setSettings(prev => ({...prev, chartTitle: e.target.value}))}
          className="border p-2 rounded text-gray-500"
        />

        <select
          value={settings.chartType}
          onChange={(e) => setSettings(prev => ({...prev, chartType: e.target.value}))}
          className="border p-2 rounded text-gray-500"
        >
          <option value="line">Line</option>
          <option value="bar">Bar</option>
        </select>

        <input
          type="text"
          placeholder="X Axis Title"
          value={settings.xAxisTitle}
          onChange={(e) => setSettings(prev => ({...prev, xAxisTitle: e.target.value}))}
          className="border p-2 rounded text-gray-500"
        />

        <input
          type="text"
          placeholder="Y Axis Title"
          value={settings.yAxisTitle}
          onChange={(e) => setSettings(prev => ({...prev, yAxisTitle: e.target.value}))}
          className="border p-2 rounded text-gray-500"
        />
      </div>

      {/* Info text */}
      <div className="mt-4 text-gray-500">
        {settings.chartTitle
          ? "Chart settings implemented. You can change it anytime."
          : "Implement the chart settings to customize your chart and easily identify it later."}
      </div>
    </div>
  );
}

