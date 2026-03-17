// This is the profile page for staff members to edit their information.
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import CreateStaffForm from "../../_components/CreateStaffForm";
import Link from "next/link";


export default function Page() {
  return (
    <main
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ fontFamily: "var(--font-titillium)" }}
    >
      <SecondaryNav displayLogin={false} displayLogout displayProfile={true}/>
      <Navbar displayAbout={false}/>

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
            Create Staff Account
          </h1>
  
            <CreateStaffForm />
         
        </div>
      </div>

      <Footer />
    </main>
  );
}