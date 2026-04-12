"use client";

import { useState } from "react";

/**
 * SensorPanel
 *
 * Renders a searchable, scrollable list of sensors as checkboxes, allowing
 * staff to select any number of sensors to include in a generated report.
 *
 * @param {Array} [sensors=[]] - Full list of available sensor objects fetched by the parent
 * @param {Array} [selectedSensors=[]] - List of currently selected sensor objects
 * @param {Function} onSelect - Called with the updated selected sensors array on each toggle
 *
 * Notes:
 * - Sensor options are fetched and owned by the parent (ReportControls) — this component
 *   is fully controlled and holds no fetch logic
 * - Filtering is case-insensitive and matches against sensor.name only, not sensor.code
 * - Selection and deselection are by sensor.code to correctly handle sensors with duplicate names
 * @author Temi Bankole 
 */
export default function SensorPanel({ sensors = [], selectedSensors = [], onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSensors = sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (sensor) => {
    const isSelected = selectedSensors.some(s => s.code === sensor.code);
    if (isSelected) {
      onSelect(selectedSensors.filter(s => s.code !== sensor.code));
    } else {
      onSelect([...selectedSensors, sensor]);
    }
  };

  return (
    <div className="flex flex-col h-62 overflow-y-auto border p-5 rounded shadow-sm">
      <label className="text-[#212529] block text-md mb-1 font-semibold">
        Select Sensors
      </label>
      <input
        type="text"
        placeholder="Search sensors..."
        className="mb-2 p-2 border border-gray-900 rounded text-[#212529]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <label className="text-sm text-[#212529] mb-2">
        {sensors.length} sensors available
      </label>
      <div className="flex flex-col gap-1">
        {filteredSensors.length > 0 ? (
          filteredSensors.map((sensor) => (
            <label key={sensor.code} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSensors.some(s => s.code === sensor.code)}
                onChange={() => handleToggle(sensor)}
                className="w-4 h-4"
              />
              <span className="text-[#212529] text-sm">{sensor.name}</span>
            </label>
          ))
        ) : (
          <span className="text-gray-400 text-sm">No sensors found.</span>
        )}
      </div>
    </div>
  );
}