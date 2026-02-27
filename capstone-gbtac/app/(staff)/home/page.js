"use client";

import { useState, useEffect } from "react";
import { loadRecentDashboards } from "../../utils/saveRecentDashboard";
import RecentDashboardCard from "../../_components/RecentDashboardCard";

import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function StaffHome({ employeeName = "John Doe" }) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const savedDashboards = loadRecentDashboards().filter((d) => d.saved);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(savedDashboards);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <SecondaryNav
        displayLogin={false}
        displayLogout={true}
        displayProfile={true}
      />
      <Navbar
        displayDashboards={true}
        displayReports={true}
        displayAbout={false}
        displayHome={false}
      />

      <main className="flex-1 py-12 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <section className="relative max-w-7xl mx-auto py-10">
          <div className="relative bg-white rounded-md shadow-sm overflow-hidden">
            <div className="relative h-62.5">
              <Image
                src="/current.jpg"
                alt="Background Accent"
                fill
                style={{ objectFit: "cover" }}
                className="opacity-80"
                priority
              />

              <div className="absolute inset-0 bg-black/40"></div>

              <div className="absolute inset-0 flex items-center px-12 z-0">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                  Welcome, {employeeName}!
                </h1>
              </div>
            </div>

            {/* Content area */}
            <div className="px-12 py-16">
              <p className="text-xl md:text-2xl font-light text-gray-600 dark:text-gray-300 mb-10 max-w-3xl">
                Access your tools, reports, and dashboards to manage building
                performance.
              </p>

              <div className="mb-16 flex flex-wrap gap-6">
                <Link href="/reports">
                  <button className="px-6 py-3 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition">
                    Reports
                  </button>
                </Link>
                <Link href="/profile">
                  <button className="px-6 py-3 bg-[#6D2077] text-white rounded-sm hover:bg-[#7F121F] font-bold transition">
                    Profile
                  </button>
                </Link>
              </div>

              <h2 className="text-2xl font-semibold mb-6">
                Recently Saved Dashboards
              </h2>

              {recent.length === 0 ? (
                <p className="text-gray-500">No dashboards saved yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {recent.map((dash) => (
                    <RecentDashboardCard key={dash.id} data={dash} />
                  ))}
                </div>
              )}

              <div className="mt-10">
                <Image
                  src="/gbtac2.jpg"
                  alt="Staff Welcome"
                  width={1200}
                  height={700}
                  className="rounded-md"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
