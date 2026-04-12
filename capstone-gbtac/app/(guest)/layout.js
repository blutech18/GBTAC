"use client";

import { useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../_utils/auth-context";

export default function GuestLayout({ children }) {
  const { user, loading, isAllowed, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowGuestPath = pathname === "/about-us";

  useLayoutEffect(() => {
    if (loading) return;
    if (!user || !isAllowed || allowGuestPath) return;

    if (role === "admin") {
      router.replace("/account-manager");
      return;
    }

    if (role === "staff") {
      router.replace("/staff-welcome-page");
      return;
    }
  }, [user, loading, isAllowed, role, allowGuestPath, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    );
  }

  if (user && isAllowed && !allowGuestPath) {
    return null;
  }

  return children;
}