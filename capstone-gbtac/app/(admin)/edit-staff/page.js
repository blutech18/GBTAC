/**
 * AdminEditProfilePage
 *
 * Admin-facing page that renders the StaffProfileForm in "admin" mode.
 * Allows an admin to edit a staff member's name, email, and account status.
 * Password changes are intentionally blocked for admin viewers.
 *
 * @returns The admin edit-staff page
 *
 * @author Dominique Lee
 */
"use client";

import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import StaffProfileForm from "../../_components/StaffProfileForm";
import Link from "next/link";

export default function AdminEditProfilePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <SecondaryNav displayLogin={false} displayLogout displayProfile={true} />
      <Navbar displayHome={false} displayAbout={false} displayAccountMngmt={true} displayDashboardMngmt={true} />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/account-manager"
            className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-[#005EB8] hover:text-[#004080] transition"
          >
            ← Back to Manage Accounts
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#212529]">
            Edit Staff Account
          </h1>

          <div className="bg-white shadow-md rounded-2xl p-8">
            <StaffProfileForm viewerRole="admin" />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}