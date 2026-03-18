"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadRecentDashboards } from "../../utils/saveRecentDashboard";
import RecentDashboardCard from "../../_components/RecentDashboardCard";
import Breadcrumbs from "@/app/_components/Breadcrumbs";
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import Image from "next/image";
import Link from "next/link";

const API_BASE = "http://localhost:8000";

export default function StaffHome() {
  const [recent, setRecent] = useState([]);
  const [user, setUser] = useState("Staff");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/");
          return;
        }

        const data = await res.json();

        if (data.role !== "staff") {
          router.replace("/account-manager");
          return;
        }

        setUser(data.email);
        setLoading(false);
      } catch (error) {
        router.replace("/");
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const savedDashboards = loadRecentDashboards().filter((d) => d.saved);
    setRecent(savedDashboards);
  }, []);

  if (!mounted || loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] font-sans">
      <SecondaryNav
        displayLogin={false}
        displayLogout={true}
        displayProfile={true}
        employeeName={user}
      />
      <Navbar
        displayDashboards={true}
        displayReports={true}
        displayAbout={false}
        displayHome={false}
      />
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
        <div className="absolute inset-0 flex flex-row items-center sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 z-0">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight text-white px-4 lg:px-0">
            Welcome, {user}!
          </h1>
        </div>
      </div>
      <div>
        <Breadcrumbs />
      </div>
      <main className="flex-1 pb-12 px-4 pt-2 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <section className="relative mx-auto pb-10">
          <div className="relative bg-[#FDFDFD] overflow-hidden">
            <p className="text-xl md:text-2xl font-light text-gray-600 mb-10 max-w-3xl">
              Access your tools, reports, and dashboards to manage building
              performance.
            </p>

            <div className="mb-10 flex flex-wrap gap-6">
              <Link href="/report">
                <button className="px-6 py-3 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition">
                  Reports
                </button>
              </Link>
              <Link href="/profile">
                <button className="px-6 py-3 bg-[#6D2077] text-white rounded-sm hover:bg-[#4C145A] font-bold transition">
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
          </div>
        </section>
      </main>
      <div className="relative h-62.5">
        <Image src="/gbtac3.jpg" alt="Staff Welcome" fill priority />
      </div>

      <Footer />
    </div>
  );
}