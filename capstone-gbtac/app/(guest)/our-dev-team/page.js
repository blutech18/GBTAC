import Navbar from "@/app/_components/Navbar";
import SecondaryNav from "@/app/_components/SecondaryNav";
import Footer from "@/app/_components/Footer";
import Breadcrumbs from "@/app/_components/Breadcrumbs";
import Image from "next/image";
import DevCard from "@/app/_components/dev-page/DevCard";
import devs from "../../_data/devs.json";

export default function DevelopersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <SecondaryNav displayDashboards={true} />
      <Navbar />
      {/* Hero banner with welcome message */}
      <div className="relative h-64">
        <Image
          src="/dev-background.png"
          alt="Background Accent"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-80"
          priority
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-row items-center sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 z-0">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black! text-white px-4 lg:px-0">
            BEHIND THE CODE
          </h1>
        </div>
      </div>
      <div>
        <Breadcrumbs />
      </div>
      <main className="relative flex-1 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 px-4 py-2 mb-6">
        <div className="mx-auto bg-white/80 rounded-md shadow-sm px-12 py-10">
          <div className="mb-5">
            <h2 className="text-3xl font-heading tracking-tight text-gray-900">
              Meet Our GBTAC Analytics Dev Team
            </h2>
          </div>
          <div className="text-xl text-gray-700 mb-5">
            <p>Passionate Developers Building Tools That Make a Difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devs.map((member) => (
              <DevCard key={member.name} {...member} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
