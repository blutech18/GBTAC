//This component represents a single row within the accounts table.
//Accepts an `account` prop with id, name, email, status, role, etc.
//Optionally you could pass callbacks for edit/delete if needed in future.
"use client";

import Link from "next/link";

export default function AccountRow({ account, index, onDeleteClick }) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-black">
        {index + 1}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-black">
        {account.name || "No name"}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-black">
        {account.email}
      </td>

      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor:
              account.status === "Active" ? "#8dc075" : "#912932",
          }}
        ></span>
        <span className="text-black font-semi">{account.status}</span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap place-items-center gap-2">
        <Link href={`/edit-staff/${encodeURIComponent(account.email)}`}>
          <button className="bg-[#005EB8] hover:bg-[#004080] text-white font-semibold px-4 py-2 mr-2.5 rounded-md transition-colors">
            Edit
          </button>
        </Link>

        <button
          onClick={() => onDeleteClick(account)}
          className="bg-[#912932] hover:bg-[#8B1625] text-white font-semibold px-4 py-2 rounded-md transition-colors"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}