"use client";

import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import StaffProfileForm from "../../_components/StaffProfileForm";
import Link from "next/link";

import { useAuth } from "../../_utils/auth-context";

export default function ProfilePage() {
  const { role } = useAuth(); //change to "staff" to see staff edit profile page for now
  const isAdmin = role === "admin";


  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <SecondaryNav displayLogin={false} displayLogout displayProfile={true} />
      <Navbar 
        displayHome={!isAdmin} 
        displayAbout={false} 
        displayAccountMngmt={isAdmin} 
        displayDashboardMngmt={isAdmin} 
      />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {isAdmin && (
            <Link
              href="/account-manager"
              className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-[#005EB8] hover:text-[#004080] transition"
            >
              ← Back to Manage Accounts
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#212529]">
            {isAdmin ? "Edit Staff Account" : "My Profile"}
          </h1>

          <div className="bg-white shadow-md rounded-2xl p-8">
            <StaffProfileForm viewerRole={role} />
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
