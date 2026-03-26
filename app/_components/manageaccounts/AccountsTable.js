//This component will display a table of accounts with columns for ID, Name, Email, Status, and Action buttons (Edit/Delete).
//It uses the AccountRow component to render each row and accepts a `search` prop to filter the displayed accounts based on the search term.
"use client";

import AccountRow from "./AccountRow";
import ConfirmModal from "../ConfirmModal";
import { useEffect, useState } from "react";

export default function AccountsTable({search = ""}) {

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/get-staff`, 
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (res.ok) {
          setAccounts(data.staff || []);
        } else {
          console.error(data.detail);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(search.toLowerCase()) ||
    account.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteClick = (account) => {
    setSelectedAccount(account);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAccount) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/delete-staff`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: selectedAccount.email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Failed to delete staff");
        return;
      }

      setAccounts((prev) =>
        prev.filter((acc) => acc.email !== selectedAccount.email)
      );

      setShowDeleteModal(false);
      setSelectedAccount(null);
      alert("Staff deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedAccount(null);
  };

  
  return (
    <>
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 max-h-96">
        <table className="min-w-full divide-y table-fixed divide-gray-200">
          <thead
            className="sticky top-0 z-10"
            style={{ backgroundColor: "#F6F7F9" }}
          >
            <tr>
              <th className="px-6 py-3 text-left text-lg font-medium text-black">
                #
              </th>
              <th className="px-6 py-3 text-left text-lg font-medium text-black">
                Name
              </th>
              <th className="px-6 py-3 text-left text-lg font-medium text-black">
                Email
              </th>
              <th className="px-6 py-3 text-left text-lg font-medium text-black">
                Status
              </th>
              <th className="px-6 py-3 text-left text-lg font-medium text-black">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
            {filteredAccounts.map((account, index) => (
              <AccountRow
                key={account.email}
                account={account}
                index={index}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && selectedAccount && (
        <ConfirmModal
          title="Delete Staff"
          message={`Are you sure you want to delete ${selectedAccount.email}?`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}