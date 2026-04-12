"use client";

import Link from "next/link";

/**
 * @author Temi Bankole
 */

/**
 * AddStaffButton
 *
 * Navigation button that routes the user to the create staff form page.
 */
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