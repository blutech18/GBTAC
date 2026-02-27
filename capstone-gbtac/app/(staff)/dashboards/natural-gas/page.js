"use client";

//add whatever X factor is used to convert natural gas units to kWh in the info tooltip
import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import DateRangePicker from "@/app/_components/DatePicker";
import InfoCard from "@/app/_components/InfoCard";
import Footer from "@/app/_components/Footer";
import { FiInfo } from "react-icons/fi";

export default function Page() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <SecondaryNav />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header with tooltip on the right */}
        <div className="flex justify-between items-center mb-10">
          <h1
            className="text-4xl font-bold dark:text-black"
            style={{ fontFamily: "var(--font-titillium)" }}
          >
            Natural Gas Dashboard
          </h1>

          {/*Information Icon with information*/}
          <div className="relative group">
            <FiInfo className="w-10 h-8 text-black cursor-pointer hover:text-gray-700 transition-colors" />

            <div className="absolute right-0 top-8 w-80 p-3 bg-white text-black text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              Values are converted to kWh using a standard conversion factor of X kWh per unit of gas.
            </div>
          </div>
        </div>

        <InfoCard
          items={[
            { label: "Total Energy Consumption", value: "134,350 kWh" },
            { label: "Avg Monthly Natural Gas Usage", value: "820 kWh" },
            { label: "Avg Monthly Electricity Usage", value: "10,375 kWh" },
            { label: "Peak Energy Month", value: "January" },
          ]}
        />

        {/* Chart Section */}
        <div className="mt-10 flex flex-col gap-4 relative">
            <DateRangePicker />

          {/* Line Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-md h-96 flex items-center justify-center text-gray-400 relative">
            Natural Gas and Electricity Consumption LINE Chart Placeholder
          </div>
          {/* Bar Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-md h-96 flex items-center justify-center text-gray-400 relative">
            Natural Gas and Electricity Consumption BAR Chart Placeholder
          </div>
          {/*Disclaimer at the bottom of the charts*/}
          <div className="text-sm text-center text-gray-500 mt-2">
            All information is displayed for educational purposes only.  
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
