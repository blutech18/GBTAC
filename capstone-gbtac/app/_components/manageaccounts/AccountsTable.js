// components/AccountsTable.js
export default function AccountsTable() {
  // Static data for now
 const accounts = [
    { id: 1, name: "Temi Bankole", email: "temibankole5@gmail.com", role: "staff", status: "Active" },
    { id: 2, name: "Jane Doe", email: "jane@example.com", role: "admin", status: "Inactive" },
    { id: 3, name: "John Smith", email: "john@example.com", role: "staff", status: "Active" },
    { id: 4, name: "Alice Johnson", email: "alice@example.com", role: "staff", status: "Active" },
    { id: 5, name: "Bob Williams", email: "bob@example.com", role: "admin", status: "Inactive" },
    { id: 6, name: "Charlie Brown", email: "charlie@example.com", role: "staff", status: "Active" },
    { id: 7, name: "Diana Prince", email: "diana@example.com", role: "staff", status: "Active" },
    { id: 8, name: "Ethan Hunt", email: "ethan@example.com", role: "admin", status: "Inactive" },
    { id: 9, name: "Fiona Gallagher", email: "fiona@example.com", role: "staff", status: "Active" },
    { id: 10, name: "George Martin", email: "george@example.com", role: "staff", status: "Active" },
    { id: 11, name: "Hannah Lee", email: "hannah@example.com", role: "staff", status: "Inactive" },
    { id: 12, name: "Ian Somerhalder", email: "ian@example.com", role: "admin", status: "Active" },
    { id: 13, name: "Julia Roberts", email: "julia@example.com", role: "staff", status: "Active" },
    { id: 14, name: "Kevin Hart", email: "kevin@example.com", role: "staff", status: "Inactive" },
    { id: 15, name: "Laura Linney", email: "laura@example.com", role: "staff", status: "Active" },
    { id: 16, name: "Michael Jordan", email: "michael@example.com", role: "admin", status: "Active" },
    { id: 17, name: "Nina Dobrev", email: "nina@example.com", role: "staff", status: "Active" },
    { id: 18, name: "Oscar Isaac", email: "oscar@example.com", role: "staff", status: "Inactive" },
    { id: 19, name: "Paula Patton", email: "paula@example.com", role: "staff", status: "Active" },
    { id: 20, name: "Quentin Tarantino", email: "quentin@example.com", role: "admin", status: "Active" },
  ];
  
  return (
    <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 max-h-96">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="sticky top-0 z-10" style={{ backgroundColor: "#F6F7F9" }}>
      <tr>
        <th style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-3 text-left text-lg font-medium text-black">#</th>
        <th style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-3 text-left text-lg font-medium text-black">Name</th>
        <th style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-3 text-left text-lg font-medium text-black">Email</th>
        <th style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-3 text-left text-lg font-medium text-black">Status</th>
        <th style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-3 text-left text-lg font-medium text-black">Action</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
      {accounts.map((account) => (
        <tr key={account.id}>
          <td style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-4 whitespace-nowrap text-black">{account.id}</td>
          <td style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-4 whitespace-nowrap text-black">{account.name}</td>
          <td style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-4 whitespace-nowrap text-black">{account.email}</td>
          <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ color: "text-black", backgroundColor: account.status === "Active" ? "#8dc074" : "#912932" }}
            ></span>
            <span className="text-black">{account.status}</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <button className="bg-[#912932] hover:bg-[#8B1625] text-white  px-3 py-1 mr-2.5 rounded-md transition-colors"
              style={{ fontFamily: "var(--font-titillium)" }}>
              Edit
            </button>
            <button className="bg-[#912932] hover:bg-[#8B1625] text-white  px-3 py-1 rounded-md transition-colors"
              style={{ fontFamily: "var(--font-titillium)" }}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
}