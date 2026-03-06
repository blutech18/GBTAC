//Search Bar for adding sensors to a graph
//Displays a list of available sensors and add buttons
"use client";

import { useState, useMemo } from "react";
//useMemo hook helps optimize performance by memorizing the filtered sensor list.

export default function SensorSearch({ selectedSensors, setSelectedSensors, availableSensors }) {

  const [searchTerm, setSearchTerm] = useState("");
  //Memorized filtered sensor list based on search term
  const filteredSensors = useMemo(() => {
    if (!searchTerm) return availableSensors;
    return availableSensors.filter(sensor =>
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, availableSensors]);

  //Function to add a sensor to the selectedSensors list if it's not already added
  const addSensor = (sensor) => {
    if (!selectedSensors.some(s => s.code === sensor.code)) {
      setSelectedSensors([...selectedSensors, sensor]);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm p-4 mb-5 mt-1 w-1/2" style={{ fontFamily: "var(--font-titillium)" }}>
      <div className="flex items-center mb-4 gap-2">
        <p className="font-semibold text-black">Sensor Search:</p>
        <input
          type="text"
          placeholder="Search sensors..."
          className="border p-2 text-gray-500 rounded-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <p className="font-semibold text-black mb-2">Available Sensors</p>
      <div className="max-h-64 overflow-y-auto border rounded-sm bg-gray-100 text-gray-500">
        {(filteredSensors.length) === 0 ? (
          <p className="text-gray-500 p-2">No sensors found</p>
        ) : (
          filteredSensors.map(sensor => (
            <div key={sensor.code} className="flex justify-between items-center p-2 border-b">
              <span>{sensor.name}</span>
              <button
                onClick={() => addSensor(sensor)}
                className={`px-2 py-1 rounded-sm text-white ${
                  selectedSensors.some(s => s.code === sensor.code)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={selectedSensors.some(s => s.code === sensor.code)}
              >
                {selectedSensors.some(s => s.code === sensor.code) ? "Added" : "Add"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
