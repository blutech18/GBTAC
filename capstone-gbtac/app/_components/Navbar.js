"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Navbar component
 *
 * Primary navigation bar with conditional link visibility controlled by props.
 * The "Graphs" dropdown is shown when displayDashboards is true, and injects
 * the current pathname as a `from` query param for breadcrumb context.
 *
 * @param {boolean} [displayHome=true] - Show the Home link
 * @param {boolean} [displayAbout=true] - Show the About Us link
 * @param {boolean} [displayDashboards=false] - Show the Graphs dropdown
 * @param {boolean} [displayReports=false] - Show the Reports link
 * @param {boolean} [displayAccountMngmt=false] - Show the Manage Accounts link
 * @param {boolean} [displayDashboardMngmt=false] - Show the Manage Dashboard link
 *
 * Notes:
 * - Dropdown links append ?from= using the current pathname for breadcrumb support
 * - Graphs dropdown supports both hover and click for keyboard accessibility
 *
 * @returns A responsive top navigation bar
 *
 * @author Cintya Lara Flores
 */

export default function Navbar({
  displayHome = true,
  displayAbout = true,
  displayDashboards = false,
  displayReports = false,
  displayAccountMngmt = false,
  displayDashboardMngmt = false,
}) {
  // Get the current pathname for constructing ?from= query params in dropdown links
  const pathname = usePathname();
  // State to control visibility of the Graphs dropdown menu
  const [graphsOpen, setGraphsOpen] = useState(false);

  // Encode current page as breadcrumb origin for dashboard links
  const fromParam = `?from=${encodeURIComponent(pathname.replace(/^\//, "") || "home")}`;

  // Dashboard links with injected ?from= for breadcrumb context
  const dashboardLinks = [
    { href: "/water-level", label: "Cistern Level" },
    { href: "/energy", label: "Energy" },
    { href: "/ambient-temperature", label: "Ambient Temperature" },
    { href: "/wall-temperature", label: "Wall Temperature" },
    { href: "/natural-gas", label: "Natural Gas" },
    { href: "/custom", label: "Custom Charts" },
  ];
  return (
    <nav className="w-full bg-[#A6192E] text-white px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 py-4 flex items-center justify-between">
      {/* Conditionally render links based on props*/}
      <ul className="font-heading flex space-x-8 text-white text-lg">
        {/*Display Home link*/}
        {displayHome && (
          <li>
            <Link href="/" className="hover:opacity-70 transition">
              Home
            </Link>
          </li>
        )}

        {/*Display About Us link*/}
        {displayAbout && (
          <li>
            <Link href="/about-us" className="hover:opacity-70 transition">
              About Us
            </Link>
          </li>
        )}

        {/* Display Graphs dropdown with conditional rendering and injected ?from= for breadcrumb context */}
        {displayDashboards && (
          // Dropdown closes on mouse leave; also toggles on click for keyboard users
          <li
            className="relative group z-10"
            onMouseEnter={() => setGraphsOpen(true)}
            onMouseLeave={() => setGraphsOpen(false)}
          >
            <button
              onClick={() => setGraphsOpen((prev) => !prev)}
              className="cursor-pointer hover:opacity-70 transition"
            >
              Graphs
            </button>
            {graphsOpen && (
              <ul className="absolute left-0 top-full w-44 bg-white text-black shadow-lg">
                {dashboardLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={`${href}${fromParam}`}
                      className="block px-4 py-2 hover:bg-gray-100 transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )}

        {/*Display Reports link*/}
        {displayReports && (
          <li>
            <Link href="/report" className="hover:opacity-70 transition">
              Reports
            </Link>
          </li>
        )}

        {/*Display Manage Accounts link*/}
        {displayAccountMngmt && (
          <li>
            <Link
              href="/account-manager"
              className="hover:opacity-70 transition"
            >
              Manage Accounts
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
