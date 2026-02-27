"use client";

import SecondaryNav from "./SecondaryNav";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function DashboardLayout({ title, children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <SecondaryNav
        displayLogout={true}
        displayProfile={true}
        displayLogin={false}
      />
      <Navbar displayDashboards displayHome={false} displayAbout={false} />
      <main
        className="
        flex-1
        sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32
        py-8
      "
      >
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">{title}</h1>

        {children}
      </main>

      <div className="text-center text-sm text-gray-500 mt-8 px-4">
        This information is displayed for educational purposes only.
      </div>

      <Footer />
    </div>
  );
}
