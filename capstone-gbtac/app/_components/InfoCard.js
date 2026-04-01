const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * InfoCard component
 *
 * Renders a collection of stat cards, each showing a label, a value with an
 * optional unit, and an optional subtitle. Supports two layout modes: a
 * responsive CSS grid (default) or a horizontal scrollable row of fixed-width
 * cards.
 *
 * @param {Array<{
 *   label:     string,
 *   value:     number | string,
 *   unit?:     string | Function,
 *   subtitle?: string | null
 * }>} items - Cards to render. See Notes for subtitle and unit behaviour.
 *
 * @param {boolean}  [horizontal=false] - When true, renders cards as a
 *                                        flex row instead of a grid.
 * @param {string}   [colsClass]        - Tailwind grid-cols class to override
 *                                        the automatic column count derived
 *                                        from items.length.
 *
 * Notes:
 * - unit: if a function, it is called with item.value and its return value is
 *   used as the unit string. A function unit also enables positive/negative
 *   green/red colouring on the value.
 * - subtitle: undefined → shows "As of: <current date/time>"; null or "" →
 *   shows nothing; any other string → shown as-is.
 * - colsClass is ignored in horizontal mode.
 * - GRID_COLS caps at 4 columns; pass colsClass explicitly for wider grids.
 *
 * @author Cintya Lara Flores
 */

export default function InfoCard({ items, horizontal = false, colsClass }) {
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
