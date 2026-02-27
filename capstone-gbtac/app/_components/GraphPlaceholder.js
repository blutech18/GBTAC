export default function GraphPlaceholder({ height = "h-64" }) {
  return (
    <div
      className={`w-full ${height} bg-white rounded-lg shadow flex items-center justify-center text-gray-400`}
    >
      Graph Placeholder
    </div>
  );
}
