//This component will display a table of accounts with columns for ID, Name, Email, Status, and Action buttons (Edit/Delete).
//It uses the AccountRow component to render each row and accepts a `search` prop to filter the displayed accounts based on the search term.

import AccountRow from "./AccountRow";
export default function AccountsTable({search = ""}) {
  //Static data for now
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

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(search.toLowerCase()) ||
    account.email.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 max-h-96">
  <table className="min-w-full divide-y table-fixed divide-gray-200">
    <thead className="sticky top-0 z-10" style={{ backgroundColor: "#F6F7F9" }}>
      <tr>
        <th className="px-6 py-3 text-left text-lg font-medium text-black">#</th>
        <th className="px-6 py-3 text-left text-lg font-medium text-black">Name</th>
        <th className="px-6 py-3 text-left text-lg font-medium text-black">Email</th>
        <th className="px-6 py-3 text-left text-lg font-medium text-black">Status</th>
        <th className="px-6 py-3 text-left text-lg font-medium text-black">Action</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
      {filteredAccounts.map((account) => (
        <AccountRow key={account.id} account={account} />
      ))}
    </tbody>
  </table>
</div>
  );
}