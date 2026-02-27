//Search Bar for adding sensors to a graph
//Displays a list of available sensors and add buttons

export default function SensorSearch() {
  return (
    <div style={{ fontFamily: "var(--font-titillium)" }} className="bg-white rounded-sm shadow-sm p-4 mb-5 mt-1 w-1/2">
      <div className="flex items-center mb-4 gap-2">
        <p
          className="font-semibold text-black"
        >
          Sensor Search:
        </p>
        <input
          type="text"
          placeholder="Search sensors..."
          className="border p-2 text-gray-500 rounded-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600">
          Search
        </button>
      </div>
      <p className="font-semibold text-black mb-4">
        Available Sensors
      </p>
      <div className="h-64 bg-gray-200 rounded-sm flex items-center justify-center">
        <p className="text-gray-500">Sensor list will be displayed here</p>
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <button className="bg-[#912932] text-white px-4 py-2 rounded-sm hover:bg-red-700">
          Add Selected Sensors
        </button>
      </div>
    </div>
  );
}

