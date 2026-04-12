/**
 * CreateStaffPage
 *
 * Admin page for creating a new staff account. Renders the shared admin
 * navigation and the CreateStaffForm used to capture new staff member details
 * and submit account creation requests.
 *
 * Notes:
 * - Provides a quick navigation link back to the account manager page.
 * - Uses the centralized CreateStaffForm component for validation and submit flow.
 * - This page is layout-focused and delegates account creation logic to the form.
 *
 * @returns The admin create-staff page
 * @author Temi Bankole
 */
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import CreateStaffForm from "../../_components/CreateStaffForm";


export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <SecondaryNav displayLogin={false} displayLogout displayProfile={true}/>
      <Navbar displayAbout={false}/>

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto"
        >
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