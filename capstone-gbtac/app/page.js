import SecondaryNav from "./_components/SecondaryNav";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <SecondaryNav />
      <Navbar displayHome={false} />

      <main className="flex-1 bg-gray-100">
        <div
          className="
      sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32
      py-24
    "
        >
          <section className="max-w-7xl mx-auto bg-white rounded-md shadow-sm px-12 py-16">
            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              Green Building Technology Access Centre
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-xl md:text-2xl font-light text-gray-600 max-w-3xl">
              Interactive building analytics and performance insights
            </p>

            {/* CTA */}
            <div className="mt-10">
              <Link href="/dashboard">
                <button className="px-8 py-3 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition">
                  Go to Guest Dashboard
                </button>
              </Link>
            </div>

            {/* Image */}
            <div className="mt-16">
              <Image
                src="/Image (11).jfif"
                alt="GBTAC building"
                width={1200}
                height={700}
                className="rounded-md"
                priority
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}