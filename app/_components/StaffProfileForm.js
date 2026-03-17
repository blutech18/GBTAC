//This component is the main form for staff to view/edit their profile. 
//It is also the admins view of a staff members profile when accessed from the account manager. 
//Form fields actions adjust based on viewer's role (admin vs staff).
"use client";

import { useState } from "react";
import Link from "next/link";
import ConfirmModal from "./ConfirmModal";
import NotificationModal from "./NotificationModal";
import Image from "next/image";

export default function StaffProfileForm({ viewerRole = "staff" }) {
  const isAdmin = viewerRole === "admin";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "Active",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  //TODO: set currentPasswordVerified to true once Firebase confirms currentPassword is correct
  //Call setCurrentPasswordVerified(true) inside handleSubmit after Firebase reauthentication succeeds
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const isFormValid = formData.firstName.trim().length >= 2 && formData.lastName.trim().length >= 2 && formData.email.trim().length;

  const handleChange = (e) => {
  const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "currentPassword" && value.trim().length === 0) {
        updated.newPassword = "";
        updated.confirmPassword = "";
      }
      return updated;
    });
      if (name === "currentPassword" && value.trim().length === 0) { 
        setCurrentPasswordVerified(false); //reset password verification if current password changes
      }
  };
  const handleConfirmSave = () => {
    setShowConfirmModal(false);
    console.log("Submitted:", formData);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    //TODO: Connect to API
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    else if (formData.firstName.trim().length < 2) newErrors.firstName = "Must be at least 2 characters.";
    else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) newErrors.firstName = "No numbers or special characters.";

    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    else if (formData.lastName.trim().length < 2) newErrors.lastName = "Must be at least 2 characters.";
    else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) newErrors.lastName = "No numbers or special characters.";

    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!formData.email.includes("@")) newErrors.email = "Enter a valid email.";
    else {
      const emailLower = formData.email.toLowerCase();
      if (!emailLower.endsWith("@sait.ca") && !emailLower.endsWith("@edu.sait.ca") && !emailLower.endsWith("@gmail.com"))
        newErrors.email = "Must be a SAIT or Gmail email.";
    }

    if (!isAdmin) {
      if (formData.newPassword && !formData.currentPassword)
        newErrors.currentPassword = "Current password is required.";

      //TODO: Add backend check to verify current password is correct before allowing new password validation
      //If it doesn't match, show error "Current password is incorrect." (This will require an API call, so may need to move this validation to handleConfirmSave instead of here in validate)
      if (formData.newPassword) {
        if (formData.newPassword.length < 8) newErrors.newPassword = "Must be at least 8 characters.";
        else if (!/[A-Z]/.test(formData.newPassword)) newErrors.newPassword = "Must include an uppercase letter.";
        else if (!/[0-9]/.test(formData.newPassword)) newErrors.newPassword = "Must include a number.";
        else if (!/[^a-zA-Z0-9]/.test(formData.newPassword)) newErrors.newPassword = "Must include a special character.";
        else if (formData.newPassword === formData.currentPassword) newErrors.newPassword = "New password can't be the same as current.";
      }
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      //TODO: verify currentPassword against Firebase before showing confirm modal
      //const isVerified = await verifyCurrentPassword(formData.currentPassword);
      //if (!isVerified) {
      //setErrors(prev => ({ ...prev, currentPassword: "Incorrect password, please try again." }));
      //return;
      // }
      setShowConfirmModal(true); 
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 text-[#212529]"
      style={{ fontFamily: "var(--font-titillium)" }}
    >
      <div className="space-y-6">
        <h2 className="text-lg border-b pb-2 font-semibold text-gray-800">
          {isAdmin ? "Staff Information" : "Personal Information"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800">First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-800">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-800">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {isAdmin && (
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800">Account Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="appearance-none border rounded-lg p-3 pr-8 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="space-y-6">
          <h2 className="text-lg border-b pb-2 font-semibold text-gray-800">
            Change Password
          </h2>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-800">Current Password</label>
            <div className="relative">
              <input
                name="currentPassword"
                type={showPassword.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Current Password"
                className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
              />
              
              <button
                type="button"
                className="absolute right-3 top-4 "
                onMouseDown={() => setShowPassword(prev => ({ ...prev, current: true }))}
                onMouseUp={() => setShowPassword(prev => ({ ...prev, current: false }))}
                onMouseLeave={() => setShowPassword(prev => ({ ...prev, current: false }))}
                onTouchStart={() => setShowPassword(prev => ({ ...prev, current: true }))}
                onTouchEnd={() => setShowPassword(prev => ({ ...prev, current: false }))}
              >
                <Image
                  src={showPassword.current ? "/icons/eye-close.png" : "/icons/eye-open.png"}
                  alt="toggle password"
                  width={20}
                  height={20}
                />
              </button>
            </div>
            {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
          </div>

          {currentPasswordVerified && (
            <div className="flex flex-col">
              <label className="font-semibold text-gray-800">New Password</label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="New Password"
                  className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                />
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                <button
                  type="button"
                  className="absolute right-3 top-4"
                  onMouseDown={() => setShowPassword(prev => ({ ...prev, new: true }))}
                  onMouseUp={() => setShowPassword(prev => ({ ...prev, new: false }))}
                  onMouseLeave={() => setShowPassword(prev => ({ ...prev, new: false }))}
                  onTouchStart={() => setShowPassword(prev => ({ ...prev, new: true }))}
                  onTouchEnd={() => setShowPassword(prev => ({ ...prev, new: false }))}
                >
                  <Image
                    src={showPassword.new ? "/icons/eye-close.png" : "/icons/eye-open.png"}
                    alt="toggle password"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
            </div>
          )}

          {currentPasswordVerified && (
            <div className="flex flex-col">
              <label className="font-semibold text-gray-800">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm New Password"
                  className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                <button
                  type="button"
                  className="absolute right-3 top-4"
                  onMouseDown={() => setShowPassword(prev => ({ ...prev, confirm: true }))}
                  onMouseUp={() => setShowPassword(prev => ({ ...prev, confirm: false }))}
                  onMouseLeave={() => setShowPassword(prev => ({ ...prev, confirm: false }))}
                  onTouchStart={() => setShowPassword(prev => ({ ...prev, confirm: true }))}
                  onTouchEnd={() => setShowPassword(prev => ({ ...prev, confirm: false }))}
                >
                  <Image
                    src={showPassword.confirm ? "/icons/eye-close.png" : "/icons/eye-open.png"}
                    alt="toggle password"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t mt-8">
        {showNotification && (
          <NotificationModal
            title="Success"
            message="Profile updated successfully!"
            onClose={() => setShowNotification(false)}
          />
        )}
        {showConfirmModal && (
          <ConfirmModal
            title="Save Changes?"
            message="Are you sure you want to save these changes?"
            confirmText="Yes, Save"
            cancelText="Cancel"
            onConfirm={handleConfirmSave}
            onCancel={handleCancelSave}
          />
        )}
        <Link href={isAdmin ? "/account-manager" : "/home"}>
          <button
            type="button"
            className="px-5 py-3 bg-[#912932] text-white font-semibold rounded hover:bg-[#8B1625] transition"
          >
            Cancel
          </button>
        </Link>
        <button
          type="submit"
          disabled={!isFormValid}
          className="px-5 py-3 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>

    </form>
  );
}