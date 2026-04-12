import CustomHandler from "../graphs/handlers/CustomHandler";

/**
 * @author Temi Bankole
 */

/**
 * GraphContainer
 *
 * Thin layout wrapper that renders the CustomHandler graph within a styled
 * container. Passes all chart configuration props through to CustomHandler
 * without modification.
 *
 * @param {Array} selectedSensors - List of sensor objects to plot on the chart
 * @param {object} dateRange - Date range for filtering data, with from and to fields in YYYY-MM-DD format
 * @param {object} settings - Chart display settings including title, type, and axis labels
 * @param {object} aggSettings - Aggregation settings including time interval and aggregation type
 *
 * Notes:
 * - This component owns no state and performs no data fetching — all logic lives in CustomHandler
 * - Save and PDF export controls are rendered inside CustomHandler, not here
 */
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