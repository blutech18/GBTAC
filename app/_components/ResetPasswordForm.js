"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import NotificationModal from "./NotificationModal";

export default function ResetPasswordForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({ newPassword: "", confirmNewPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (formData.newPassword.length < 8)
      newErrors.newPassword = "Must be at least 8 characters.";
    else if (!/[A-Z]/.test(formData.newPassword))
      newErrors.newPassword = "Must contain at least one uppercase letter.";
    else if (!/[0-9]/.test(formData.newPassword))
      newErrors.newPassword = "Must contain at least one number.";
    else if (!/[!@#$%^&*]/.test(formData.newPassword))
      newErrors.newPassword = "Must contain at least one special character.";

    if (formData.newPassword !== formData.confirmNewPassword)
      newErrors.confirmNewPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setShowConfirmModal(true);
  };

  const handleConfirmReset = () => {
    setShowConfirmModal(false);
    // TODO: call your reset password API here
    setShowNotificationModal(true);
  };

  const handleCloseNotification = () => {
    setShowNotificationModal(false);
    router.push("/login");
  };

  return (
    <form className="space-y-8 text-[#212529] max-w-xl mx-auto" onSubmit={handleSubmit}>
      <div className="space-y-6">
        <h2 className="text-2xl border-b pb-2 font-semibold text-gray-800">
          Set a New Password
        </h2>

        <div className="flex flex-col">
          <label htmlFor="new-password" className="font-semibold text-gray-800">
            New Password
          </label>
          <div className="mt-2 relative">
            <input
              id="new-password"
              name="newPassword"
              type={showPassword.new ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Min 8 characters"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
            />
            <button
              type="button"
              className="absolute right-3 top-4"
              onMouseDown={() => setShowPassword((prev) => ({ ...prev, new: true }))}
              onMouseUp={() => setShowPassword((prev) => ({ ...prev, new: false }))}
              onMouseLeave={() => setShowPassword((prev) => ({ ...prev, new: false }))}
              onTouchStart={() => setShowPassword((prev) => ({ ...prev, new: true }))}
              onTouchEnd={() => setShowPassword((prev) => ({ ...prev, new: false }))}
            >
              <Image
                src={showPassword.new ? "/icons/eye-close.png" : "/icons/eye-open.png"}
                alt="toggle password"
                width={20}
                height={20}
              />
            </button>
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="confirm-new-password" className="font-semibold text-gray-800">
            Confirm New Password
          </label>
          <div className="mt-2 relative">
            <input
              id="confirm-new-password"
              name="confirmNewPassword"
              type={showPassword.confirm ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Re-enter new password"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
            />
            <button
              type="button"
              className="absolute right-3 top-4"
              onMouseDown={() => setShowPassword((prev) => ({ ...prev, confirm: true }))}
              onMouseUp={() => setShowPassword((prev) => ({ ...prev, confirm: false }))}
              onMouseLeave={() => setShowPassword((prev) => ({ ...prev, confirm: false }))}
              onTouchStart={() => setShowPassword((prev) => ({ ...prev, confirm: true }))}
              onTouchEnd={() => setShowPassword((prev) => ({ ...prev, confirm: false }))}
            >
              <Image
                src={showPassword.confirm ? "/icons/eye-close.png" : "/icons/eye-open.png"}
                alt="toggle password"
                width={20}
                height={20}
              />
            </button>
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          Reset Password
        </button>

        {showConfirmModal && (
          <ConfirmModal
            title="Confirm Password Reset"
            message="Are you sure you want to reset your password?"
            confirmText="Yes, Reset"
            cancelText="No, Cancel"
            onConfirm={handleConfirmReset}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}

        {showNotificationModal && (
          <NotificationModal
            title="Password Reset Successful"
            message="Your password has been reset successfully."
            onClose={handleCloseNotification}
          />
        )}

        <hr className="border-gray-300" />
        <div className="text-sm text-center sm:text-left">
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to Login
          </a>
        </div>
      </div>
    </form>
  );
}