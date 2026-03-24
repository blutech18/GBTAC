"use client";

//This component will display a table of accounts with columns for ID, Name, Email, Status, and Action buttons (Edit/Delete).
//It uses the AccountRow component to render each row and accepts a `search` prop to filter the displayed accounts based on the search term.

import { useEffect, useState } from "react";
import AccountRow from "./AccountRow";

export default function AccountsTable({search = ""}) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/auth/staff")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch staff");
        return res.json();
      })
      .then((data) => {
        const mapped = data.map((item, index) => ({
          id: index + 1,
          name: `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || item.email,
          email: item.email,
          role: item.role ?? "staff",
          status: item.active === true ? "Active" : "Inactive",
        }));
        setAccounts(mapped);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(search.toLowerCase()) ||
    account.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 text-gray-500" style={{ fontFamily: "var(--font-titillium)" }}>
        <svg className="animate-spin h-6 w-6 mr-3 text-[#005EB8]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading staff...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-600" style={{ fontFamily: "var(--font-titillium)" }}>
        Failed to load staff: {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 max-h-96">
  <table className="min-w-full divide-y table-fixed divide-gray-200">
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
      {filteredAccounts.map((account) => (
        <AccountRow key={account.id} account={account} />
      ))}
    </tbody>
  </table>
</div>
  );
}