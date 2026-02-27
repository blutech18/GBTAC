import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import LoginForm from "../../_components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <SecondaryNav displayLogin={false} />
      <Navbar />

      <main className="grow flex items-center justify-center">
        <div className="container mx-auto px-4 py-10 flex justify-center">
          <LoginForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
