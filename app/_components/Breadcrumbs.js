"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const FROM_CRUMB_MAP = {
  "staff-welcome-page": {
    label: "Staff Welcome Page",
    href: "/staff-welcome-page",
  },
  // add more origins here if needed
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Build injected crumbs from the ?from= param
  const injectedCrumbs =
    from && FROM_CRUMB_MAP[from] ? [FROM_CRUMB_MAP[from]] : [];

  return (
    <nav className="sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 pt-5 pb-4 px-4">
      <ol className="flex items-center gap-2 text-gray-500">
        <li>
          <Link href="/" className="hover:text-black hover:underline">
            Home
          </Link>
        </li>

        {/* Injected middle crumbs from ?from= param */}
        {injectedCrumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-2">
            <span>/</span>
            <Link
              href={crumb.href}
              className="hover:text-black hover:underline capitalize"
            >
              {crumb.label}
            </Link>
          </li>
        ))}

        {/* Normal path-derived crumbs */}
        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const isLast = index === pathSegments.length - 1;

          return (
            <li key={href} className="flex items-center gap-2">
              <span>/</span>
              {isLast ? (
                <span className="text-gray-900 font-semibold capitalize">
                  {segment.replace(/-/g, " ")}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-black hover:underline capitalize"
                >
                  {segment.replace(/-/g, " ")}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
