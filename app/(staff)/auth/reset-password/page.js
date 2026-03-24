"use client";

import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import ResetPasswordForm from "@/app/_components/ResetPasswordForm";


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
          <div className="bg-white shadow-md rounded-2xl p-8">
            <ResetPasswordForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
