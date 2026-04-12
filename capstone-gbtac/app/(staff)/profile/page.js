/**
 * ProfilePage
 *
 * Staff-facing profile page that renders the StaffProfileForm in "staff" mode.
 * Allows the logged-in staff member to view and edit their own name, email,
 * and password.
 *
 * @returns The staff profile page
 *
 * @author Temi Bankole
 * @author Dominique Anne Lee
 */

"use client";

import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Breadcrumbs from "../../_components/Breadcrumbs";
import Footer from "../../_components/Footer";
import StaffProfileForm from "../../_components/StaffProfileForm";

/**
 * ProfilePage (Staff Profile)
 *
 * Displays the staff member's profile page with an editable profile form.
 * Renders the secondary navigation with logout and profile options enabled,
 * and the main navbar with limited menu items appropriate for staff users.
 *
 * @param {object} props - Component props
 * @param {string} [props.viewerRole="staff"] - Role of the viewing user; passed to StaffProfileForm for permission context
 *
 * @returns The staff profile page
 */
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

      <Breadcrumbs />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>
          {/* Staff profile form with staff-level permissions */}
          <div className="bg-white shadow-md rounded-2xl p-8">
            <StaffProfileForm viewerRole="staff" />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}