import SecondaryNav from "./SecondaryNav";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

/**
 * DashboardLayout component
 *
 * Shared full-page layout for all dashboard pages. Composes the secondary nav,
 * primary nav, breadcrumbs, a titled main content area, a disclaimer, and footer.
 *
 * @param {string} title - Page title displayed as an h1 at the top of main content
 * @param {React.ReactNode} [titleRight=null] - Optional content rendered to the right of the title
 *                                              (e.g. action buttons, export controls)
 * @param {React.ReactNode} children - Page-specific content rendered inside main
 *
 * Notes:
 * - SecondaryNav manages its own auth state via Firebase — no auth props needed here
 * - Navbar hides Home and About since dashboard pages have their own navigation context
 * - The disclaimer is rendered outside main intentionally, above the footer
 *
 * @returns A full-page dashboard layout with nav, content area, and footer
 *
 * @author Cintya Lara Flores
 */

export default function DashboardLayout({
  title,
  titleRight = null,
  children,
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FdFdFd] font-sans">
      <SecondaryNav />
      <Navbar
        displayDashboards
        displayHome={false}
        displayAbout={false}
        displayReports={true}
      />
      <Breadcrumbs />
      <main
        className="
        flex-1
        sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32
        px-4 pt-2 pb-8
      "
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className="text-3xl lg:text-5xl font-semibold text-gray-800">
            {title}
          </h1>
          {titleRight}
        </div>

        {children}
      </main>

      <div className="text-center text-lg text-gray-500 mt-8 px-4">
        This information is displayed for educational purposes only.
      </div>

      <Footer />
    </div>
  );
}
