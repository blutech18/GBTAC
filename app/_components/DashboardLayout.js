"use client";

import SecondaryNav from "./SecondaryNav";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function DashboardLayout({
  title,
  titleRight = null,
  children,
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FdFdFd] font-sans">
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
        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold text-gray-800">{title}</h1>
          {titleRight}
        </div>

        {children}
      </main>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 px-4">
        This information is displayed for educational purposes only.
      </div>

      <Footer />
    </div>
  );
}
