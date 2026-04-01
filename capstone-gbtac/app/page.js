"use client";
import { useState, useEffect } from "react";
import { auth } from "./_utils/firebase";
import SecondaryNav from "./_components/SecondaryNav";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import Image from "next/image";
import Link from "next/link";

/**
 * Home page
 *
 * Public-facing landing page for the GBTAC Analytics platform.
 * Displays a title, subtitle, a context-aware CTA, and a building image.
 *
 * The CTA routes authenticated users to their staff welcome page and
 * unauthenticated users to the guest dashboard.
 *
 * Notes:
 * - Auth state is observed locally to drive the CTA
 * - Navbar hides the Home link since this is the home page
 *
 * @returns The GBTAC Analytics landing page
 *
 * @author Cintya Lara Flores
 */

export default function Home() {
  // Local state to track if user is authenticated for CTA routing
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Listen for auth state changes to determine which CTA to show
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-[#fdfdfd] font-sans">
      <SecondaryNav />

      {/* Home link hidden — this is the home page */}
      <Navbar displayHome={false} />

      <main className="flex-1 bg-gray-100 w-full px-4 py-8 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <section className="mx-auto bg-white shadow-sm px-6 py-8 md:px-12 md:py-16">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl text-start font-extrabold tracking-tight text-gray-900">
            Green Building Technology Access Centre Analytics
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-xl md:text-2xl font-light text-gray-600 max-w-3xl">
            Interactive building analytics and performance insights
          </p>

          {/* CTA routes to staff page if logged in, guest dashboard otherwise */}
          <div className="mt-10">
            {isLoggedIn ? (
              <Link
                href="/staff-welcome-page"
                className="px-8 py-3 font-heading text-lg bg-[#6D2077] text-white rounded-sm hover:bg-[#4C145A] font-bold transition inline-block"
              >
                Go to My Welcome Page
              </Link>
            ) : (
              <Link
                href="/energy-trends"
                className="px-8 py-3 font-heading text-lg bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition inline-block"
              >
                Explore Energy Trends
              </Link>
            )}
          </div>

          {/* GBTAC Image */}
          <div className="mt-16">
            <Image
              src="/GBTACbuilding.webp"
              alt="GBTAC building"
              width={2000}
              height={700}
              className="rounded-md"
              priority
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
