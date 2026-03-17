import Script from "next/script";
import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import LoginForm from "../../_components/login/LoginForm";
import Background from "../../_components/login/Background";

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
        <div className="container mx-auto px-4 py-5 flex justify-center relative z-10">
          <LoginForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
