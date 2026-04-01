//Search Bar for adding sensors to a graph
//Displays a list of available sensors and add buttons
"use client";

import { useState, useMemo } from "react";
//useMemo hook helps optimize performance by memorizing the filtered sensor list.

export default function SensorSearch({ selectedSensors = [], setSelectedSensors, availableSensors = [] }) {

  const [searchTerm, setSearchTerm] = useState("");
  //useMemo hook helps optimize performance by memorizing the filtered sensor list.

  const filteredSensors = useMemo(() => {
    if (!searchTerm) return availableSensors;
    return availableSensors.filter(sensor =>
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, availableSensors]);

  //Function to add a sensor to the selectedSensors list if it's not already added
  const addSensor = (sensor) => {
    if (!setSelectedSensors) return;
    if (!selectedSensors.some(s => s.code === sensor.code)) {
      setSelectedSensors([...selectedSensors, sensor]);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm p-4 w-full h-80 flex flex-col">
      <div className="flex items-center mb-2 gap-2">
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
      <div className="flex-1 overflow-y-auto border rounded-sm bg-gray-100 text-gray-500 min-h-0 max-h-80 xl:max-h-104">
        {(filteredSensors.length) === 0 ? (
          <p className="text-gray-500 p-2">No sensors found</p>
        ) : (
          filteredSensors.map(sensor => {
            const isAdded = selectedSensors.some(s => s.code === sensor.code);

            return (
              <div key={sensor.code} className="flex justify-between items-center p-2 border-b">
                <span>{sensor.name}</span>
                <button
                  onClick={() => addSensor(sensor)}
                  className={`px-2 py-1 rounded-sm text-white ${
                    isAdded
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={isAdded}
                >
                  {isAdded ? "Added" : "Add"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
