//This component is for the reset password form, which will be used in the reset password page. 
//It will be a simple form with two input fields: new password and confirm new password. 

"use client";
import { useState } from "react";

import ConfirmModal from "./ConfirmModal";

export default function ResetPasswordForm() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <form className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">
      Set a New Password
    </h1>
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="mt-1">
          <input
            id="new-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Min 8 characters"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <div className="mt-1">
          <input
            id="confirm-new-password"
            name="confirm-new-password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Re-enter new password"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset Password
        </button>
        {showConfirmModal && (
        <ConfirmModal 
          title="Confirm Password Reset" 
          message="Are you sure you want to reset your password?" 
          confirmText="Yes, Reset" 
          cancelText="No, Cancel" 
          onConfirm={() => console.log("Password reset confirmed")} 
        />
      )}
      <hr class="my-6 border-gray-300"></hr>
      <div className="text-sm mt-5 justify-end flex">
        <a href="/app/_components/login" className="font-medium text-blue-600 hover:text-blue-500">
          Back to Login
        </a>
      </div>
    </div>
    </form>
  );
}
            

