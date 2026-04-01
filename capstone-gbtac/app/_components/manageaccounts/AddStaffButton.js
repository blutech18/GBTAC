//This component is a button that allows users to add staff members. It is leads to the create staff form page when clicked.
"use client";

import Link from "next/link";

export default function AddStaffButton() {
  return (
    <Link href="/create-staff">
      <button
        className="px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition">
        Add Staff
      </button>
    </Link>
  );
}