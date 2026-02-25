// This is the profile page for staff members to edit their information.
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import CreateStaffForm from "../../_components/CreateStaffForm";


export default function Page() {
  return (
    <main
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ fontFamily: "var(--font-titillium)" }}
    >
      <Navbar />
      <SecondaryNav />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">

          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-black">
            Create Staff Account
          </h1>
  
            <CreateStaffForm />
         
        </div>
      </div>

      <Footer />
    </main>
  );
}