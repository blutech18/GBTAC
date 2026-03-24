import Link from "next/link";

export default function RecentDashboardCard({ data }) {
  return (
    <Link href={data.path}>
      <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer">
        <h3 className="text-lg font-medium">{data.title}</h3>

        <p className="text-sm text-gray-500 mt-1">
          Last saved: {new Date(data.lastVisited).toLocaleString()}
        </p>

        <div className="mt-3 text-sm space-y-1">
          <p>
            <span className="font-medium">Date range:</span>{" "}
            {data.summary.fromDate || "—"} → {data.summary.toDate || "—"}
          </p>

          <p>
            <span className="font-medium">Graphs:</span>{" "}
            {data.summary.graphs?.slice(0, 5).join(", ") || "Default"}
            {data.summary.graphs?.length > 5 ? ", ..." : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
