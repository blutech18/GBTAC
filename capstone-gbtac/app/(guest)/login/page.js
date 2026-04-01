import Script from "next/script";
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import LoginForm from "../../_components/login/LoginForm";
import Background from "../../_components/login/Background";

/**
 * LoginPage
 *
 * Authentication page that renders the login form centred over a decorative
 * background. Loads the Cloudflare Turnstile script required by LoginForm's
 * CAPTCHA widget.
 *
 * Notes:
 * - The Turnstile script uses strategy="afterInteractive" so it does not
 *   block the initial page render.
 * - displayLogin={false} hides the Login link in SecondaryNav since this is
 *   the login page itself.
 * - Background is positioned absolute; the form container uses relative z-10
 *   to sit above it.
 *
 * @author Cintya Lara Flores
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <SecondaryNav displayLogin={false} />
      <Navbar />
      <main className="grow flex items-center justify-center relative">
        <Background />
        {/* z-10 keeps the form above the absolute-positioned Background */}
        <div className="container mx-auto px-4 py-5 flex justify-center relative z-10">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
