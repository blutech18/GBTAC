"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function StaffLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Change this to the exact prank account email
  const prankEmail = "rick.rolld@sait.ca";
  const allowedPrankRoute = "/staff-welcome-page";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/");
          return;
        }

        const data = await res.json();
        const currentEmail = data.email?.toLowerCase?.() || "";

        if (data.role !== "staff") {
          router.replace("/account-manager");
          return;
        }

        // Restrict prank account to only the staff welcome page
        if (
          currentEmail === prankEmail.toLowerCase() &&
          pathname !== allowedPrankRoute
        ) {
          router.replace(allowedPrankRoute);
          return;
        }

        setLoading(false);
      } catch (error) {
        router.replace("/");
      }
    };

    checkSession();
  }, [router, pathname]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-[#005EB8] animate-spin"></div>
      </div>
    );
  }

  return children;
}