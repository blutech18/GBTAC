"use client";

// Dynamic edit-staff page — inherits admin auth guard from (admin)/layout.js
import { useParams } from "next/navigation";
import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import EditStaffForm from "@/app/_components/EditStaffForm";
import Link from "next/link";

export default function EditStaffPage() {
  const { id } = useParams();
  const email = decodeURIComponent(id);

  return (
    <main
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ fontFamily: "var(--font-titillium)" }}
    >
      <SecondaryNav displayLogin={false} displayLogout displayProfile={true} />
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/account-manager"
            className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-[#005EB8] hover:text-[#004080] transition"
          >
            ← Back to Manage Accounts
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#212529]">
            Edit Staff Account
          </h1>
          <p className="text-gray-500 mb-8 text-sm">{email}</p>

          <EditStaffForm email={email} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
