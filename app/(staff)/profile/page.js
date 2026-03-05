// This is the profile page for staff members to edit their information.
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import ProfileForm from "../../_components/StaffProfileForm";

export default function Page() {
  return (
    <main
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ fontFamily: "var(--font-titillium)" }}
    >
      <SecondaryNav />
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">

          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#212529]">
            My Profile
          </h1>

          {/* Card Wrapper */}
          <div className="bg-white shadow-md rounded-2xl p-8">
            <ProfileForm canChangePassword={true} /> {/* Staff can change their password.*/}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}