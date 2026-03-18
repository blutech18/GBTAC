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

    if (role === "admin") {
      router.replace("/account-manager");
      return;
    }
  }, [user, loading, isAllowed, role, router]);

  if (loading) return null;
  if (!user || !isAllowed) return null;
  if (role !== "staff") return null;

  return children;
}