import SecondaryNav from "../../_components/SecondaryNav";
import Navbar from "../../_components/Navbar";
import Footer from "../../_components/Footer";
import Image from "next/image";
import Breadcrumbs from "@/app/_components/Breadcrumbs";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FdFdFd] font-sans">
      <SecondaryNav />
      <Navbar displayAbout={false} />
      <div className="bg-gray-100">
        <Breadcrumbs />
      </div>
      <main className="flex-1 bg-gray-100">
        <div className="sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 px-4 pb-8 pt-4">
          <section className="mx-auto bg-white rounded-md shadow-sm px-12 py-16 space-y-16">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                About Us
              </h1>

              <p className="mt-6 text-xl md:text-2xl font-light text-gray-600 ">
                Building the future
              </p>

              <div className="mt-10 space-y-6 text-lg text-gray-700 text-justify">
                <p>
                  Founded in 2008, the Green Building Technology Access Centre
                  (GBTAC) partners with industry to identify and develop
                  environmentally friendly technologies, processes, programs,
                  systems, and services that will fundamentally change how we
                  build, educate, and develop skilled labour.
                </p>

                <p>
                  Our mission is to prove, implement, and commercialize new
                  building materials, systems, and methods that lead to the
                  construction or retrofit of buildings that are
                  higher-efficiency, lower-emission, healthier, and more
                  environmentally friendly. We collaborate to de-risk and
                  deliver holistic high-performance building solutions that
                  address environmental, social, and economic realities, while
                  also developing training and support systems to upskill both
                  the residential and commercial construction industries.
                </p>

                <p>
                  We support a broad range of industry partners, industry
                  organizations, municipalities, governments, academic
                  institutions, and community groups through a suite of services
                  in building science, energy management, environment,
                  education, and training. With a mandate to transform industry,
                  our focus is primarily on SMEs, government, and non-profit
                  industry organizations — where the greatest impacts can be
                  made.
                </p>
              </div>
            </div>

            {/* ===== Services ===== */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 ">Services</h2>

              <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-lg text-gray-700  list-disc list-inside">
                <li>Early-stage business development for commercialization</li>
                <li>
                  Net-Zero energy and Net Zero emissions advisory and analysis
                </li>
                <li>Design and construction consultation</li>
                <li>Site ecology and environment</li>
                <li>Energy systems and energy storage</li>
                <li>Integrated renewable energy</li>
                <li>Envelope fabrication, prototyping and testing</li>
                <li>Performance monitoring and management</li>
                <li>Policy and planning development and advocacy</li>
                <li>
                  Enhanced education, workshop and seminar development and
                  delivery
                </li>
              </ul>
            </div>

            {/* ===== Our Facilities ===== */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Our Facilities
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-gray-50 rounded-md shadow-sm overflow-hidden mt-8">
                  <Image
                    src="/image3.png"
                    alt="Green Building Technology Lab"
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 ">
                      Green Building Technology Lab and Demonstration Centre
                    </h3>
                    <p className="mt-4 text-gray-700  text-justify">
                      Explore our 6,350-square-foot living, breathing example of
                      energy efficiency, building-integrated green technologies
                      and renewable energy solutions.
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-gray-50 rounded-md shadow-sm overflow-hidden mt-8">
                  <Image
                    src="/image4.png"
                    alt="Solar Roller Mobile Lab"
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 ">
                      Solar Roller Mobile Lab
                    </h3>
                    <p className="mt-4 text-gray-700  text-justify">
                      Powered by solar generation, this 14 x 8 foot cargo
                      trailer is used for research, training, education and
                      outreach events.
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-gray-50 rounded-md shadow-sm overflow-hidden mt-8">
                  <Image
                    src="/image5.png"
                    alt="Integrated Solar and Rainwater Harvesting Labs"
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 ">
                      Integrated Solar and Rainwater Harvesting Labs
                    </h3>
                    <p className="mt-4 text-gray-700  text-justify">
                      Used primarily for research, training and demonstration
                      this lab is home to industry-leading solar energy
                      generation and water filtration solutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
