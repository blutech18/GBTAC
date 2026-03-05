//This page allows admin users to edit staff accounts. It is accessed by clicking the "Edit" button on the manage accounts page. It contains a form that allows admin users to edit the staff member's information, including their name, email, role, and status.
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import EditStaffForm from "../../_components/EditStaffForm";
import Link from "next/link";

export default function Page() {
  return (
    <main
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ fontFamily: "var(--font-titillium)" }}
    >
      <SecondaryNav />
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto"
        >
          {/* Back button to go back to the manage accounts page */}
          <Link
            href="/account-manager" 
            className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-[#005EB8] hover:text-[#004080] transition"
          >
            ← Back to Manage Accounts
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#212529]">
            Edit Staff Account
          </h1>
            <EditStaffForm />
        </div>
      </div>

      <Footer />
    </main>
  );
}