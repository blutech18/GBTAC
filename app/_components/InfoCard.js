export default function InfoCard({
  items,
  horizontal = false,
  colsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}) {
  const currentDate = new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const Card = ({ item, index }) => {
    // Only dynamically compute unit if a function is passed
    const unit =
      typeof item.unit === "function" ? item.unit(item.value) : item.unit;

    // Optional: color positive/negative values (only for difference)
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
          {item.value} {unit}
        </p>

        <p className="text-xs text-gray-400 mt-1">As of: {currentDate}</p>
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

  return (
    <div className={`grid ${colsClass} gap-6 mb-6`}>
      {items.map((item, i) => (
        <Card key={i} item={item} index={i} />
      ))}
    </div>
  );
}
