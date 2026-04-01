"use client";

import { useState, useEffect } from "react";
import { loadRecentDashboards } from "../../utils/saveRecentDashboard";
import RecentDashboardCard from "../../_components/RecentDashboardCard";
import Breadcrumbs from "@/app/_components/Breadcrumbs";
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "../../_utils/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * StaffHome page
 *
 * Authenticated staff landing page. Displays a personalized welcome banner,
 * quick-access links, and recently saved dashboards from localStorage.
 *
 * Notes:
 * - Recent dashboards are loaded from localStorage on mount
 * - Navbar hides Home and About — staff pages have their own navigation context
 *
 * @returns The staff welcome page
 *
 * @author Cintya Lara Flores
 */

export default function StaffHome() {
  const [recent, setRecent] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRickRollUser, setIsRickRollUser] = useState(false);

  const user = `${firstName} ${lastName}`.trim();

  // Change this to the exact prank account email
  const prankEmail = "rick.rolld@sait.ca";

  useEffect(() => {
    const savedDashboards = loadRecentDashboards().filter((d) => d.saved);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(savedDashboards);

    // Fetch user email, check if prank account, and load name from Firestore
    const fetchUserName = async () => {
      const currentEmail = auth.currentUser?.email?.toLowerCase();
      if (!currentEmail) return;

      // Check if this is the Rick Roll account
      if (currentEmail === prankEmail.toLowerCase()) {
        setIsRickRollUser(true);
      }

      // Get user info from Firestore
      const userDoc = doc(db, "allowedUsers", currentEmail);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
      } else {
        console.log("No such document!");
      }
    };

    fetchUserName();
  }, []);

  // If prank account, show Rick Roll page instead of normal dashboard
  if (isRickRollUser) {
    return (
      <div className="flex flex-col min-h-screen bg-black font-sans">

        {/* Navigation (limited access) */}
        <SecondaryNav
          displayLogin={false}
          displayLogout={true}
          displayProfile={false}
          employeeName={user || "Staff User"}
        />

         {/* Hide dashboard navigation */}
        <Navbar
          displayDashboards={false}
          displayReports={false}
          displayAbout={false}
          displayHome={false}
        />

        {/* Rick Roll content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
          <h1 className="text-white text-4xl md:text-6xl font-extrabold text-center mb-6">
            Welcome, {user || "Staff User"}!
          </h1>

          <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/20">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
              title="Special Welcome Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <p className="text-white/80 mt-4 text-center">
            Loading your personalized dashboard...
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfdfd] font-sans">
      <SecondaryNav />

      {/* Home and About hidden — staff pages use their own navigation context */}
      <Navbar
        displayDashboards={true}
        displayReports={true}
        displayAbout={false}
        displayHome={false}
      />

      {/* Hero banner with welcome message */}
      <div className="relative h-62.5">
        <Image
          src="/current.jpg"
          alt="Background Accent"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-80"
          priority
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-row items-center sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 z-0">
          <h1 className="text-4xl md:text-4xl lg:text-7xl font-extrabold tracking-tight text-white px-4 lg:px-0">
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
            {/* Content area */}
            <p className="text-xl md:text-2xl font-light text-gray-600 mb-10 max-w-3xl">
              Access your tools, reports, and dashboards to manage building
              performance.
            </p>
            {/* Quick-access navigation links */}
            <div className="mb-10 flex flex-wrap gap-6 justify-center lg:justify-start">
              <Link
                href="/report"
                className="font-heading text-lg px-6 py-3 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition inline-block"
              >
                Reports
              </Link>
              <Link
                href="/profile"
                className="font-heading text-lg px-6 py-3 bg-[#6D2077] text-white rounded-sm hover:bg-[#4C145A] font-bold transition inline-block"
              >
                Profile
              </Link>
            </div>

            <h2 className="text-2xl font-semibold mb-6">
              Recently Saved Dashboards
            </h2>

            {/* Recent Dashboard Cards */}
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
      
      {/* Decorative footer image */}
      <div className="relative h-62.5">
        <Image src="/gbtac3.jpg" alt="Staff Welcome" fill priority />
      </div>

      <Footer />
    </div>
  );
}