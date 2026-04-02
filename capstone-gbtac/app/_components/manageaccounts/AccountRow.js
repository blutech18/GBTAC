/**
 * AccountRow
 *
 * Renders a single row in the staff accounts table. Displays the staff
 * member's index, name, email, active status, and action buttons for
 * editing or deleting the account.
 *
 * @param {object}   account       - Staff account object with name, email, status, role
 * @param {number}   index         - Row index for display numbering
 * @param {Function} onDeleteClick - Callback invoked with the account when delete is confirmed
 *
 * @returns A table row with staff details and action buttons
 *
 * Notes:
 * - Edit navigates to /edit-staff/[email] via a Link component.
 * - Delete shows a ConfirmModal before invoking onDeleteClick.
 *
 * @author Dominique Lee
 */
"use client";

import Link from "next/link";
import ConfirmModal from "../ConfirmModal";
import NotificationModal from "../NotificationModal";
import { useState } from "react";

export default function AccountRow({ account, index, onDeleteClick }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

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

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor:
                account.status === "Active" ? "#8dc075" : "#912932",
            }}
          ></span>
          <span className="text-black font-semi">{account.status}</span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex justify-end items-center gap-3 h-full">
          <Link href={`/edit-staff/${encodeURIComponent(account.email)}`}>
            <button className="bg-[#005EB8] hover:bg-[#004080] text-white font-semibold px-3 py-2 rounded-md transition-colors">
              Edit
            </button>
          </Link>

          <button
            onClick={() => onDeleteClick(account)}
            className="bg-[#912932] hover:bg-[#8B1625] text-white font-semibold px-3 py-2 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
        {showConfirmModal && (
          <ConfirmModal
            title="Confirm Deletion"
            message="Are you sure you want to delete this account?"
            onConfirm={() => {
              setShowConfirmModal(false);
              setShowNotificationModal(true);
            }}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}
        {showNotificationModal && (
          <NotificationModal
            title="Account Deleted"
            message="The account has been successfully deleted."
            onClose={() => setShowNotificationModal(false)}
          />
        )}
      </td>
    </tr>
  );
}