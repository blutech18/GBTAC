//This component is a placeholder for the graph container that will display the customized graph based on user input from the Chart Settings.
// It currently contains a title and a placeholder area where the graph will be rendered in the future.
// The graph has two buttons for saving the current view and exporting the graph as a PDF

import CustomHandler from "../graphs/handlers/CustomHandler";

export default function GraphContainer({ selectedSensors, dateRange, settings, aggSettings }) {
  return (
    <div className="w-full h-full bg-white rounded p-4">
      <CustomHandler
        selectedSensors={selectedSensors}
        dateRange={dateRange}
        settings={settings}
        aggSettings={aggSettings}
      />
    </div>
  );
}
