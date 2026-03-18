"use client";
import { useState, useEffect } from "react";
import { auth } from "./_utils/firebase";
import SecondaryNav from "./_components/SecondaryNav";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-[#FdFdFd] font-sans">
      <SecondaryNav />
      <Navbar displayHome={false} />
      <main className="flex-1 bg-gray-100 w-full sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 px-4 py-8">
        <section className="mx-auto bg-white shadow-sm px-12 py-16">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl text-start font-extrabold tracking-tight text-gray-900">
            Green Building Technology Access Centre Analytics
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-xl md:text-2xl font-light text-gray-600 max-w-3xl">
            Interactive building analytics and performance insights
          </p>

          {/* CTA */}
          <div className="mt-10">
            {isLoggedIn ? (
              <Link href="/staff-welcome-page">
                <button className="px-8 py-3 font-heading text-lg bg-[#6D2077] text-white rounded-sm hover:bg-[#4C145A] font-bold transition">
                  Go to My Welcome Page
                </button>
              </Link>
            ) : (
              <Link href="/guest-dashboard">
                <button className="px-8 py-3 font-heading text-lg bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition">
                  Go to Guest Dashboard
                </button>
              </Link>
            )}
          </div>

          {/* Image */}
          <div className="mt-16">
            <Image
              src="/Image (11).jfif"
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
