"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../_utils/auth-context";

export default function GuestLayout({ children }) {
  const { user, loading, isAllowed, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const allowGuestPath = pathname === "/about-us";

    if (!user || !isAllowed || allowGuestPath) return;

    if (role === "admin") {
      router.replace("/account-manager");
      return;
    }

    if (role === "staff") {
      router.replace("/staff-welcome-page");
      return;
    }
  }, [user, loading, isAllowed, role, pathname, router]);

  if (loading) return null;

  return children;
}