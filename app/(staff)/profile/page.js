"use client";

import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import StaffProfileForm from "../../_components/StaffProfileForm";

export default function ProfilePage() {

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <SecondaryNav displayLogin={false} displayLogout displayProfile={true} />
      <Navbar 
        displayHome={true}
        displayAbout={false} 
        displayAccountMngmt={false} 
        displayDashboardMngmt={false} 
      />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>
          <div className="bg-white shadow-md rounded-2xl p-8">
            <StaffProfileForm viewerRole="staff" />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
