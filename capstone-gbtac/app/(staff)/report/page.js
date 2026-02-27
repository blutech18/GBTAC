import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import ReportDropdown from "../../_components/reports/ReportDropdown";
import Calendar from "../../_components/reports/Calendar";
import PDFViewer from "../../_components/reports/PdfViewer";


export default function Page() {
  return (
    <main className="bg-gray-50 min-h-screen">
        <SecondaryNav />
        <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-10  dark:text-black" style={{ fontFamily: "var(--font-titillium)" }}>
          Reports
        </h1>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: Dropdown + Calendar */}
          <div className="col-span-1 p-6 bg-white shadow-md rounded-xl border space-y-6">
            <ReportDropdown />
            
            <Calendar />
        

            {/* Inline error message */}
                {/* {errorMessage && (
                  <p className="mt-2 text-red-600 font-bold">{errorMessage}</p>
                )} */}
        </div>


        {/* RIGHT: PDF Viewer */}
        <div className="col-span-2">
          <PDFViewer/>
          {/* {showViewer && <PDFViewer pdfBlob={pdfBlob} onClear={handleClear} />} */}
         </div>
        </div>
      </div>
        <Footer />
    </main>
  );
}
