"use client";

/**
 * @author Temi Bankole
 */

/**
 * SelectedSensors
 *
 * Displays a scrollable list of sensors currently added to the chart and
 * allows users to remove individual sensors by code.
 *
 * @param {Array} [selectedSensors=[]] - List of sensor objects currently selected, each with a code and name field
 * @param {Function} setSelectedSensors - State setter called with the filtered array when a sensor is removed
 *
 * Notes:
 * - Sensors are keyed by array index rather than code — reordering the list externally may cause React key warnings
 * - Removal is by sensor.code, not sensor.name, so sensors with duplicate names are handled correctly
 */
export default function SelectedSensors({ selectedSensors = [], setSelectedSensors }) {

  const removeSensor = (code) => {
    setSelectedSensors(selectedSensors.filter(sensor => sensor.code !== code));
  };

  return (
    <div className="bg-white rounded-sm shadow-sm p-4 w-full h-80 flex flex-col">
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