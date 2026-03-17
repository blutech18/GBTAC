"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_utils/auth-context";

export default function StaffLayout({ children }) {
  const { user, loading, isAllowed, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user || !isAllowed) {
      router.replace("/login");
      return;
    }

    if (role !== "staff") {
      router.replace("/admin-home");
    }
  }, [user, isAllowed, role, loading, router]);

  if (loading) return null;
  if (!user || !isAllowed || role !== "staff") return null;

  return children;
}