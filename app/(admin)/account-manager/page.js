"use client";

import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import AccountsTable from "@/app/_components/manageaccounts/AccountsTable";
import SearchInput from "@/app/_components/manageaccounts/SearchInput";
import AddStaffButton from "@/app/_components/manageaccounts/AddStaffButton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:8000";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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

  if (!mounted || loading) return null;

  return (
    <main className="bg-gray-50 min-h-screen">
      <SecondaryNav displayLogin={false} displayLogout={true} displayProfile={true} />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1
          className="text-3xl font-bold mb-10 text-[#212529]"
          style={{ fontFamily: "var(--font-titillium)" }}
        >
          Manage Accounts
        </h1>
        <div className="mb-6 flex items-center justify-between gap-4">
          <SearchInput value={searchTerm} onChange={setSearchTerm} />
          <AddStaffButton />
        </div>
        <AccountsTable search={searchTerm} />
      </div>

      <Footer />
    </main>
  );
}