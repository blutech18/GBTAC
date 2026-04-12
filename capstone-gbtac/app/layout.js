import { Titillium_Web, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "./_utils/auth-context";
import IdleSessionManager from "./_components/IdleSessionManager";

// Titillium Web — primary display/heading font
const titilliumWeb = Titillium_Web({
  variable: "--font-titillium-web",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
});

// DM Sans — body and UI text font
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Green Building Technology Access Centre Analytics",
  description: "Interactive building analytics and performance insights",
};

/**
 * RootLayout
 *
 * Root layout for the entire application. Applies global fonts, wraps all
 * pages in the auth context provider, and mounts the idle session manager
 * which handles automatic logout on inactivity.
 *
 * @param {React.ReactNode} children - Page content rendered at the current route
 *
 * Notes:
 * - Both font CSS variables are applied to the body so all components can
 *   reference var(--font-titillium-web) and var(--font-dm-sans) in CSS.
 * - IdleSessionManager is mounted here so it runs on every page without
 *   needing to be added to individual layouts or pages.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${titilliumWeb.variable} ${dmSans.variable} antialiased`}
      >
        <AuthContextProvider>
          {/* Monitors user activity globally and triggers logout on idle timeout */}
          <IdleSessionManager />
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
