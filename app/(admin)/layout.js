"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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

        if (data.role !== "admin") {
          router.replace("/staff-welcome-page");
          return;
        }

        setLoading(false);
      } catch (error) {
        router.replace("/");
      }
    };

    checkSession();
  }, [router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-[#005EB8] animate-spin"></div>
      </div>
    );
  }

  return children;
}