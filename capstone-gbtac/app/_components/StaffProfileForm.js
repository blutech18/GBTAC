//This component is the main form for staff to view/edit their profile.
//Fetches data dynamically from the backend and saves changes via PUT /auth/staff/{email}.
//Password changes use Firebase Auth reauthentication + updatePassword.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/app/_utils/firebase";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";
import NotificationModal from "./NotificationModal";

export default function StaffProfileForm({ viewerRole = "staff", userEmail = "" }) {
  const isAdmin = viewerRole === "admin";
  const router = useRouter();

  // ─── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "Active",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ─── UI state ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("Profile updated successfully!");
  const [saveError, setSaveError] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ─── Fetch profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);
    fetch(`http://localhost:8000/auth/staff/${encodeURIComponent(userEmail)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setFormData((prev) => ({
          ...prev,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? userEmail,
          status: data.active === true ? "Active" : "Inactive",
        }));
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message);
        setLoading(false);
      });
  }, [userEmail]);

  // ─── Field change ────────────────────────────────────────────────────────────
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
    // Reset password verified state if current password is cleared
    if (name === "currentPassword" && value.trim().length === 0) {
      setCurrentPasswordVerified(false);
    }
    setSaveError(null);
  };

  // ─── Verify current password via Firebase Auth ───────────────────────────────
  const handleVerifyPassword = async () => {
    if (!formData.currentPassword.trim()) return;
    setVerifying(true);
    setErrors((prev) => ({ ...prev, currentPassword: undefined }));
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not signed in");
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      setCurrentPasswordVerified(true);
    } catch {
      setErrors((prev) => ({
        ...prev,
        currentPassword: "Current password is incorrect.",
      }));
      setCurrentPasswordVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required.";
    else if (formData.firstName.trim().length < 2)
      newErrors.firstName = "Must be at least 2 characters.";
    else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName))
      newErrors.firstName = "No numbers or special characters.";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required.";
    else if (formData.lastName.trim().length < 2)
      newErrors.lastName = "Must be at least 2 characters.";
    else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName))
      newErrors.lastName = "No numbers or special characters.";

    if (!isAdmin) {
      if (formData.newPassword) {
        if (!currentPasswordVerified)
          newErrors.currentPassword = "Please verify your current password first.";
        if (formData.newPassword.length < 8)
          newErrors.newPassword = "Must be at least 8 characters.";
        else if (!/[A-Z]/.test(formData.newPassword))
          newErrors.newPassword = "Must include an uppercase letter.";
        else if (!/[0-9]/.test(formData.newPassword))
          newErrors.newPassword = "Must include a number.";
        else if (!/[^a-zA-Z0-9]/.test(formData.newPassword))
          newErrors.newPassword = "Must include a special character.";
        else if (formData.newPassword === formData.currentPassword)
          newErrors.newPassword = "New password can't be the same as current.";
      }
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setShowConfirmModal(true);
  };

  // ─── Save confirmed ───────────────────────────────────────────────────────────
  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    setSaveError(null);
    try {
      // 1. Save profile info to Firestore via backend
      const res = await fetch(
        `http://localhost:8000/auth/staff/${encodeURIComponent(userEmail)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: viewerRole,
            active: formData.status === "Active",
          }),
        }
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail ?? "Failed to save profile");
      }

      // 2. If password change requested (staff only), update Firebase Auth password
      if (!isAdmin && formData.newPassword && currentPasswordVerified) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await updatePassword(currentUser, formData.newPassword);
        }
        // Reset password fields after successful update
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setCurrentPasswordVerified(false);
        setNotificationMsg("Profile and password updated successfully!");
      } else {
        setNotificationMsg("Profile updated successfully!");
      }

      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSave = () => setShowConfirmModal(false);

  const isFormValid =
    formData.firstName.trim().length >= 2 &&
    formData.lastName.trim().length >= 2 &&
    formData.email.trim().length > 0;

  // ─── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex justify-center items-center py-16 text-gray-500"
        style={{ fontFamily: "var(--font-titillium)" }}
      >
        <svg className="animate-spin h-6 w-6 mr-3 text-[#005EB8]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading profile…
      </div>
    );
  }

  if (fetchError) {
    return (
      <div
        className="text-center py-16 text-red-600"
        style={{ fontFamily: "var(--font-titillium)" }}
      >
        Failed to load profile: {fetchError}
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 text-[#212529]"
      style={{ fontFamily: "var(--font-titillium)" }}
    >
      {/* Save error banner */}
      {saveError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm flex items-start gap-2">
          <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {saveError}
        </div>
      )}

      {/* ── Personal / Staff Info ── */}
      <div className="space-y-6">
        <h2 className="text-lg border-b pb-2 font-semibold text-gray-800">
          {isAdmin ? "Staff Information" : "Personal Information"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-800 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="border rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        {isAdmin && (
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">Account Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="appearance-none border rounded-lg p-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Change Password (staff only) ── */}
      {!isAdmin && (
        <div className="space-y-6">
          <h2 className="text-lg border-b pb-2 font-semibold text-gray-800">
            Change Password
          </h2>

          {/* Current password + verify button */}
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">Current Password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  name="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Current Password"
                  disabled={currentPasswordVerified}
                  className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  className="absolute right-3 top-4"
                  onMouseDown={() => setShowPassword((p) => ({ ...p, current: true }))}
                  onMouseUp={() => setShowPassword((p) => ({ ...p, current: false }))}
                  onMouseLeave={() => setShowPassword((p) => ({ ...p, current: false }))}
                  onTouchStart={() => setShowPassword((p) => ({ ...p, current: true }))}
                  onTouchEnd={() => setShowPassword((p) => ({ ...p, current: false }))}
                >
                  <Image
                    src={showPassword.current ? "/icons/eye-close.png" : "/icons/eye-open.png"}
                    alt="toggle password"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              {!currentPasswordVerified ? (
                <button
                  type="button"
                  onClick={handleVerifyPassword}
                  disabled={!formData.currentPassword.trim() || verifying}
                  className="px-4 py-2 bg-[#005EB8] text-white text-sm font-semibold rounded-lg hover:bg-[#004080] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {verifying ? "Verifying…" : "Verify"}
                </button>
              ) : (
                <span className="flex items-center gap-1 text-green-600 text-sm font-semibold whitespace-nowrap">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New password — unlocked after verification */}
          {currentPasswordVerified && (
            <>
              <div className="flex flex-col">
                <label className="font-semibold text-gray-800 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="New Password"
                    className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-4"
                    onMouseDown={() => setShowPassword((p) => ({ ...p, new: true }))}
                    onMouseUp={() => setShowPassword((p) => ({ ...p, new: false }))}
                    onMouseLeave={() => setShowPassword((p) => ({ ...p, new: false }))}
                    onTouchStart={() => setShowPassword((p) => ({ ...p, new: true }))}
                    onTouchEnd={() => setShowPassword((p) => ({ ...p, new: false }))}
                  >
                    <Image
                      src={showPassword.new ? "/icons/eye-close.png" : "/icons/eye-open.png"}
                      alt="toggle password"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-gray-800 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm New Password"
                    className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-4"
                    onMouseDown={() => setShowPassword((p) => ({ ...p, confirm: true }))}
                    onMouseUp={() => setShowPassword((p) => ({ ...p, confirm: false }))}
                    onMouseLeave={() => setShowPassword((p) => ({ ...p, confirm: false }))}
                    onTouchStart={() => setShowPassword((p) => ({ ...p, confirm: true }))}
                    onTouchEnd={() => setShowPassword((p) => ({ ...p, confirm: false }))}
                  >
                    <Image
                      src={showPassword.confirm ? "/icons/eye-close.png" : "/icons/eye-open.png"}
                      alt="toggle password"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t mt-8">
        {showNotification && (
          <NotificationModal
            title="Success"
            message={notificationMsg}
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
        <button
          type="button"
          onClick={() => router.push(isAdmin ? "/account-manager" : "/staff-welcome-page")}
          className="px-5 py-3 bg-[#912932] text-white font-semibold rounded hover:bg-[#8B1625] transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isFormValid || saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
