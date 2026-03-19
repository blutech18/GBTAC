"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:8000";

export default function StaffLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
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

        setLoading(false);
      } catch (error) {
        router.replace("/");
      }
    };

    checkSession();
  }, [router]);

  if (!mounted || loading) return null;

  return children;
}