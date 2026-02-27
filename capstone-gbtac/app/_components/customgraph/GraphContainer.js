//This component is a placeholder for the graph container that will display the customized graph based on user input from the Chart Settings.
// It currently contains a title and a placeholder area where the graph will be rendered in the future.
// The graph has two buttons for saving the current view and exporting the graph as a PDF

export default function GraphContainer() {
  return (
    <div className="bg-white rounded-sm shadow-sm p-4 mb-8">

      <p
        style={{ fontFamily: "var(--font-titillium)" }}
        className="font-semibold text-black mb-4"
      >
        Graph Container
      </p>
      <div className="h-64 bg-gray-200 rounded-sm flex items-center justify-center mb-4">
        <p className="text-gray-500">Graph will be rendered here</p>
      </div>
      <div className="flex justify-end gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600">
          Save View
        </button>
        <button className="bg-[#912932] text-white px-4 py-2 rounded-sm hover:bg-red-700">
          Export PDF
        </button>
      </div>

    </div>
  );
}

