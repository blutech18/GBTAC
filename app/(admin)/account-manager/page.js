"use client";

import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import AccountsTable from "@/app/_components/manageaccounts/AccountsTable";
import SearchInput from "@/app/_components/manageaccounts/SearchInput";
import AddStaffButton from "@/app/_components/manageaccounts/AddStaffButton";
import { useState } from "react";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <main className="bg-gray-50 min-h-screen">
        <SecondaryNav displayLogin={false} displayLogout displayProfile={true} />
        <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-10 text-[#212529]" style={{ fontFamily: "var(--font-titillium)" }}>
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