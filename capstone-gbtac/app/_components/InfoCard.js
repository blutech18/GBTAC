export default function InfoCard({ items, horizontal = false }) {
  if (horizontal) {
    return (
      <>
        {items.map((item, i) => (
          <div
            key={i}
            className="flex-none w-75 bg-linear-to-r from-[#00A3E0]/10 to-[#55CAF0]/50 rounded-lg shadow p-5 border-l-4 border-[#005EB8] mr-6"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold text-gray-800">{item.value}</p>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-linear-to-r from-[#00A3E0]/10 to-[#55CAF0]/50 rounded-lg shadow p-5 border-l-4 border-[#005EB8]"
        >
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="text-2xl font-bold text-gray-800">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
