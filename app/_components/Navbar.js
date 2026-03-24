import Link from "next/link";

export default function Navbar({
  displayHome = true,
  displayAbout = true,
  displayDashboards = false,
  displayReports = false,
  displayAccountMngmt = false,
  displayDashboardMngmt = false,
}) {
  return (
    <nav
      className="
        w-full bg-[#A6192E] text-white
        sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32
        p-4
      "
    >
      <ul className="flex space-x-8 text-white">
        {displayHome && (
          <li>
            <Link href="/" className="hover:opacity-70 transition">
              Home
            </Link>
          </li>
        )}

        {displayAbout && (
          <li>
            <Link href="/about-us" className="hover:opacity-70 transition">
              About Us
            </Link>
          </li>
        )}

        {displayDashboards && (
          <li className="relative group z-10">
            <span className="cursor-pointer hover:opacity-70 transition">
              Graphs
            </span>
            <div className="absolute left-0 top-full h-2 w-full" />

            <ul
              className="
                  absolute left-0 top-full mt-2 w-44
                  bg-white text-black shadow-lg
                  opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible
                  transition duration-150
                "
            >
              <li>
                <Link
                  href="/water-level?from=staff-welcome-page"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Cistern Level
                </Link>
              </li>
              <li>
                <Link
                  href="/energy?from=staff-welcome-page"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Energy
                </Link>
              </li>
              <li>
                <Link
                  href="/ambient-temperature?from=staff-welcome-page"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Ambient Temperature
                </Link>
              </li>
              <li>
                <Link
                  href="/wall-temperature?from=staff-welcome-page"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Wall Temperature
                </Link>
              </li>
              <li>
                <Link
                  href="/natural-gas?from=staff-welcome-page"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Natural Gas
                </Link>
              </li>
              <li>
                <Link
                  href="/custom?from=staff-welcome-page"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Custom Charts
                </Link>
              </li>
            </ul>
          </li>
        )}

        {displayReports && (
          <li>
            <Link href="/report" className="hover:opacity-70 transition">
              Reports
            </Link>
          </li>
        )}

        {displayAccountMngmt && (
          <li>
            <Link
              href="/account-management"
              className="hover:opacity-70 transition"
            >
              Account Management
            </Link>
          </li>
        )}
        {displayDashboardMngmt && (
          <li>
            <Link
              href="/dashboard-management"
              className="block px-4 py-2 hover:bg-gray-100"
            >
              Dashboard Management
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
