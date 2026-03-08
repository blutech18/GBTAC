export default function InfoCard({ items, horizontal = false }) {
  const currentDate = new Date().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const Card = ({ item, index }) => (
    <div
      key={index}
      className={
        horizontal
          ? "flex-none w-[300px] bg-gradient-to-r from-[#00A3E0]/10 to-[#55CAF0]/50 rounded-lg shadow p-5 border-l-4 border-[#005EB8] mr-6"
          : "bg-gradient-to-r from-[#00A3E0]/10 to-[#55CAF0]/50 rounded-lg shadow p-5 border-l-4 border-[#005EB8]"
      }
    >
      <p className="text-sm text-gray-500">{item.label}</p>

      <p className="text-2xl font-bold text-gray-800">{item.value}</p>

      <p className="text-xs text-gray-400 mt-1">As of: {currentDate}</p>
    </div>
  );

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item, i) => (
        <Card key={i} item={item} index={i} />
      ))}
    </div>
  );
}
