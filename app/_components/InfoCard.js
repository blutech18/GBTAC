const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export default function InfoCard({
  items,
  horizontal = false,
  colsClass,
}) {
  const currentDate = new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const Card = ({ item, index }) => {
    // Dynamic unit support
    const unit =
      typeof item.unit === "function" ? item.unit(item.value) : item.unit;

    // Subtitle logic:
    // undefined -> use auto date
    // null or "" -> show nothing
    // string -> show custom subtitle
    const subtitleText =
      item.subtitle !== undefined ? item.subtitle : `As of: ${currentDate}`;

    // Color positive / negative values when needed
    const valueColor =
      typeof item.value === "number" && typeof item.unit === "function"
        ? item.value >= 0
          ? "text-green-600"
          : "text-red-600"
        : "text-gray-800";

    return (
      <div
        key={index}
        className={
          horizontal
            ? "flex-none w-[300px] bg-gradient-to-r from-[#00A3E0]/10 to-[#55CAF0]/50 rounded-lg shadow p-5 border-l-4 border-[#005EB8] mr-6"
            : "bg-gradient-to-r from-[#00A3E0]/10 to-[#55CAF0]/50 rounded-lg shadow p-5 border-l-4 border-[#005EB8]"
        }
      >
        <p className="text-sm text-gray-500">{item.label}</p>

        <p className={`text-2xl font-bold ${valueColor}`}>
          {item.value}
          {unit ? ` ${unit}` : ""}
        </p>

        {subtitleText && (
          <p className="text-xs text-gray-400 mt-1">{subtitleText}</p>
        )}
      </div>
    );
  };

  if (horizontal) {
    return (
      <>
        {items.map((item, i) => (
          <Card key={i} item={item} index={i} />
        ))}
      </>
    );
  }

  const finalColsClass = colsClass || GRID_COLS[items.length] || GRID_COLS[4];

  return (
    <div className={`grid ${finalColsClass} gap-6 mb-8`}>
      {items.map((item, i) => (
        <Card key={i} item={item} index={i} />
      ))}
    </div>
  );
}
