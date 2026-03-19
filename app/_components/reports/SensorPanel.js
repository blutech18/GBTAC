//This component is for the Staff to search through the sensors in database and select any amount to be generated for the report. 
//It is used in the ReportControls component, and it holds the state for the selected sensor, which is passed down to the ReportControls component as a prop.

"use client";
import { useState } from "react";


export default function SensorPanel({ sensors = [], selectedSensors = [], onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");

  //Filter sensors based on search
  const filteredSensors = sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  //Handle checkbox toggle
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
      <label
        className="text-lg text-[#212529] mb-2 font-semibold"
        style={{ fontFamily: "var(--font-titillium)" }}
      >
        Select Sensors
      </label>
      <input
        type="text"
        placeholder="Search sensors..."
        className="mb-2 p-2 border border-gray-900 rounded text-[#212529]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <label
        className="text-base text-[#212529] mb-2"
        style={{ fontFamily: "var(--font-titillium)" }}
      >
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