"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Maps query param values (?from=...) to breadcrumb entries.
 * Used to inject navigation context that is not part of the URL path.
 * Note: labels should be pre-formatted (e.g. "Staff Welcome Page"), no auto-casing is applied.
 */
const FROM_CRUMB_MAP = {
  "staff-welcome-page": {
    label: "Staff Welcome Page",
    href: "/staff-welcome-page",
  },
  // add more origins here if needed
};

/**
 * Breadcrumbs component
 *
 * Generates a breadcrumb navigation trail based on:
 * - Current pathname (URL segments)
 * - Optional `from` query parameter for injected navigation context
 *
 * Example:
 * /water-level/reports?from=staff-welcome-page
 * → Home / Staff Welcome Page / Water Level / Reports
 *
 * Notes:
 * - Last segment is rendered as plain text (not a link)
 * - URL segments are formatted (kebab-case → readable text)
 *
 *  @author Cintya Lara Flores
 */
export default function Breadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  // Split the current path into segments (e.g., "/a/b/c" → ["a","b","c"])
  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Inject additional breadcrumb(s) based on ?from= query param
  // This allows preserving navigation context across pages
  const injectedCrumbs =
    from && FROM_CRUMB_MAP[from] ? [FROM_CRUMB_MAP[from]] : [];

  return (
    <nav className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 pt-5 pb-4">
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
              className="hover:text-black hover:underline"
            >
              {crumb.label}
            </Link>
          </li>
        ))}

        {/* Normal path-derived crumbs */}
        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const isLast = index === pathSegments.length - 1;
          // Convert kebab-case segment to readable label
          const label = segment.replace(/-/g, " ");

          return (
            <li key={href} className="flex items-center gap-2">
              <span>/</span>
              {isLast ? (
                <span className="text-gray-900 font-semibold capitalize">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-black hover:underline capitalize"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
