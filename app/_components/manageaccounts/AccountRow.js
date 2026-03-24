//This component represents a single row within the accounts table.
//Accepts an `account` prop with id, name, email, status, role, etc.
//Optionally you could pass callbacks for edit/delete if needed in future.
import Link from "next/link";

export default function AccountRow({ account }) {
  return (
    <tr>
      <td style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-4 whitespace-nowrap text-black">{account.id}</td>
      <td style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-4 whitespace-nowrap text-black">{account.name}</td>
      <td style={{ fontFamily: "var(--font-titillium)" }} className="px-6 py-4 whitespace-nowrap text-black">{account.email}</td>
      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ color: "text-black", backgroundColor: account.status === "Active" ? "#8dc075" : "#912932" }}
        ></span>
        <span className="text-black font-semi">{account.status}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap place-items-center gap-2">
        <Link href={`/edit-staff/${encodeURIComponent(account.email)}`}>
          <button className="inline-flex items-center gap-1.5 bg-[#005EB8] hover:bg-[#004080] text-white font-semibold px-4 py-2 mr-2.5 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
        </Link>
        <button className="bg-[#912932] hover:bg-[#8B1625] text-white font-semibold px-4 py-2 rounded-md transition-colors">
          Delete
        </button>
      </td>
    </tr>
  );
}
