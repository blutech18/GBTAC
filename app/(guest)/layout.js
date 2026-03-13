"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../_utils/auth-context";

export default function GuestLayout({ children }) {
  const { user, loading, isAllowed } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const allowGuestPath = pathname === "/about";
    if (user && isAllowed && !allowGuestPath) router.replace("/home");
  }, [user, isAllowed, loading, pathname, router]);

  if (loading) return null;
  return children;
}
