import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import AccountsTable from "@/app/_components/manageaccounts/AccountsTable";
import SearchInput from "@/app/_components/manageaccounts/SearchInput";
import AddStaffButton from "@/app/_components/manageaccounts/AddStaffButton";



export default function Page() {
  return (
    <main className="bg-gray-50 min-h-screen">
        <SecondaryNav />
        <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-10  dark:text-black" style={{ fontFamily: "var(--font-titillium)" }}>
          Manage Accounts
        </h1>
        <div className="mb-6 flex items-center justify-between gap-4">
          <SearchInput />
          <AddStaffButton />
          </div>
        
        <AccountsTable />

      </div>
        <Footer />
    </main>

  );
}
