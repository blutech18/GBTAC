//The component shows a list of sensors currently added to a graph
// It allows users to see their selected sensors and remove them if needed. 
// It will eventually be connected to the graph component to update the graph based on the selected sensors.

"use client";

export default function SelectedSensors({ selectedSensors = [], setSelectedSensors }) {
  // remove a sensor by id
  const removeSensor = (code) => {
    setSelectedSensors(selectedSensors.filter(sensor => sensor.code !== code));
  };

  return (
    <div
      className="bg-white rounded-sm shadow-sm p-4 w-full h-80 flex flex-col"
      style={{ fontFamily: "var(--font-titillium)" }}
    >
      <p className="font-semibold text-black mb-2">Selected Sensors</p>

      <div className="flex-1 overflow-y-auto border rounded-sm bg-gray-100 text-gray-500 min-h-0 max-h-80 xl:max-h-104">
        {selectedSensors.length === 0 ? (
          <p className="text-gray-500 p-2">No sensors selected</p>
        ) : (
          selectedSensors.map((sensor, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 border-b"
            >
              <span>{sensor.name}</span>
              <button
                onClick={() => removeSensor(sensor.code)}
                className="bg-[#912932] text-white px-4 py-2 rounded-sm hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
