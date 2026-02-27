"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_utils/auth-context";

export default function GuestLayout({ children }) {
  const { user, loading, isAllowed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && isAllowed) router.replace("/home");
  }, [user, isAllowed, loading, router]);

  if (loading) return null;
  return children;
}
