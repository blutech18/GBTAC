import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import Image from "next/image";

export default function GuestDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-black font-sans">
      <SecondaryNav displayDashboards={true} />
      <Navbar />

      <main className="flex-1 py-24 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
        <section className="max-w-7xl mx-auto bg-white dark:bg-neutral-900 rounded-md shadow-sm px-12 py-16">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
            GBTAC Graphs
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl font-light text-gray-600 dark:text-gray-300 mb-10 max-w-3xl">
            Explore real-time and historical building performance analytics.
          </p>

          {/* CTA / Navigation placeholder */}
          <div className="mb-16 flex flex-wrap gap-6">
            <button className="px-6 py-3 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition">
              Water Levels
            </button>
            <button className="px-6 py-3 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition">
              Energy Consumption
            </button>
            <button className="px-6 py-3 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition">
              Temperature
            </button>
            <button className="px-6 py-3 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition">
              Natural Gas
            </button>
          </div>

          {/* Sample image placeholder for graphs */}
          <div className="mt-10">
            <Image
              src="/graph-placeholder.jpg" // replace with actual graph images later
              alt="Graph Placeholder"
              width={1200}
              height={700}
              className="rounded-md"
              priority
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
