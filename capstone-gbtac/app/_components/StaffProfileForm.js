/**
 * StaffProfileForm
 *
 * Shared form for viewing and editing a staff member's profile. Used by both
 * the staff profile page and the admin edit-staff page. Form fields and
 * available actions adjust based on the viewer's role (admin vs staff).
 *
 * @param {string} [viewerRole="staff"] - Role of the current viewer ("staff" or "admin").
 *   Staff users can change their own password and email (with re-authentication).
 *   Admin users can toggle account status but cannot change passwords.
 *
 * @returns The staff profile edit form
 *
 * Notes:
 * - Email changes require current-password verification and trigger a
 *   Firebase verification email to the new address.
 * - Password changes also require current-password verification.
 * - Profile name/status updates are persisted to Firestore via the
 *   /auth/update-profile backend endpoint.
 * - A custom "profileUpdated" window event is dispatched after a successful
 *   save so SecondaryNav can refresh the displayed name.
 *
 * @author Dominique Lee
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ConfirmModal from "./ConfirmModal";
import NotificationModal from "./NotificationModal";
import Image from "next/image";
import { auth, db } from "@/app/_utils/firebase";
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  updatePassword,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function StaffProfileForm({ viewerRole = "staff" }) {
  const isAdmin = viewerRole === "admin";
  const [currentUser, setCurrentUser] = useState(null);
  const [originalEmail, setOriginalEmail] = useState("");

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
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "Active"
  });

  const isEmailChanged = () => {
    return formData.email !== originalEmail;
  };
  
  const isFormValid =
    formData.firstName.trim().length >= 2 &&
    formData.lastName.trim().length >= 2 &&
    formData.email.trim().length &&
    hasChanges &&
    (!isEmailChanged() || currentPasswordVerified);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setOriginalEmail(user.email);
        
        // Fetch user data from Firestore
        try {
          const userRef = doc(db, "allowedUsers", user.email);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const initialData = {
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: user.email || "",
              status: userData.active ? "Active" : "Inactive",
              currentPassword: "",
              newPassword: "",
              confirmPassword: ""
            };
            setFormData(initialData);
            setOriginalData({
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: user.email || "",
              status: userData.active ? "Active" : "Inactive"
            });
          } else {
            // If no Firestore data, just set email
            const initialData = {
              firstName: "",
              lastName: "",
              email: user.email || "",
              status: "Active",
              currentPassword: "",
              newPassword: "",
              confirmPassword: ""
            };
            setFormData(initialData);
            setOriginalData({
              firstName: "",
              lastName: "",
              email: user.email || "",
              status: "Active"
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to just setting email
          const initialData = {
            firstName: "",
            lastName: "",
            email: user.email || "",
            status: "Active",
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          };
          setFormData(initialData);
          setOriginalData({
            firstName: "",
            lastName: "",
            email: user.email || "",
            status: "Active"
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Check if there are changes
  useEffect(() => {
    const changed = 
      formData.firstName !== originalData.firstName ||
      formData.lastName !== originalData.lastName ||
      formData.email !== originalData.email ||
      formData.status !== originalData.status ||
      formData.newPassword.trim().length > 0;
    
    setHasChanges(changed);
  }, [formData, originalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "currentPassword" && value.trim().length === 0) {
        updated.newPassword = "";
        updated.confirmPassword = "";
        setCurrentPasswordVerified(false);
      }
      // Reset password verification if email changes
      if (name === "email" && value !== originalEmail) {
        setCurrentPasswordVerified(false);
      }
      return updated;
    });
  };

  const verifyCurrentPassword = async () => {
    if (!formData.currentPassword) {
      setErrors(prev => ({ 
        ...prev, 
        currentPassword: "Please enter your current password" 
      }));
      return false;
    }

    if (!currentUser) {
      setErrors(prev => ({ 
        ...prev, 
        currentPassword: "User not authenticated" 
      }));
      return false;
    }

    setIsVerifying(true);
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      formData.currentPassword
    );
    
    try {
      await reauthenticateWithCredential(currentUser, credential);
      setCurrentPasswordVerified(true);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.currentPassword;
        return newErrors;
      });
      setIsVerifying(false);
      return true;
    } catch (reauthError) {
      // Handle authentication error silently - no need to log to console
      // The error is expected when password is incorrect
      setErrors(prev => ({ 
        ...prev, 
        currentPassword: "Incorrect password" 
      }));
      setIsVerifying(false);
      return false;
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    
    try {
      const emailChanged = formData.email !== originalEmail;
      const passwordChanged = formData.newPassword && formData.confirmPassword;
      const nameChanged = formData.firstName !== originalData.firstName || 
                          formData.lastName !== originalData.lastName;
      const statusChanged = formData.status !== originalData.status;
      
      // Handle email change (requires verification email)
      if (emailChanged && !isAdmin) {
        if (!currentPasswordVerified) {
          setErrors(prev => ({ 
            ...prev, 
            currentPassword: "Please verify your password first before changing email" 
          }));
          return;
        }

        localStorage.setItem('emailChangeOldEmail', currentUser.email);

        const actionCodeSettings = {
          url: window.location.origin + '/auth-action',
          handleCodeInApp: false,
        };

        try {
          await verifyBeforeUpdateEmail(currentUser, formData.email, actionCodeSettings);
          
          setShowNotification(true);
          setTimeout(() => {
            setShowNotification(false);
            alert("A verification email has been sent to your new email address. Please check your inbox and click the verification link to complete the email change.");
          }, 1000);
          return;
        } catch (emailError) {
          if (emailError.code === 'auth/operation-not-allowed') {
            setErrors(prev => ({ 
              ...prev, 
              email: "Email verification is not enabled. Please contact support." 
            }));
          } else if (emailError.code === 'auth/invalid-email') {
            setErrors(prev => ({ 
              ...prev, 
              email: "Invalid email address" 
            }));
          } else if (emailError.code === 'auth/email-already-in-use') {
            setErrors(prev => ({ 
              ...prev, 
              email: "This email is already in use" 
            }));
          } else {
            setErrors(prev => ({ 
              ...prev, 
              email: `Failed to send verification email: ${emailError.message}` 
            }));
          }
          return;
        }
      }
      
      // Handle password change
      if (passwordChanged && !isAdmin) {
        if (!currentPasswordVerified) {
          setErrors(prev => ({ 
            ...prev, 
            currentPassword: "Please verify your password first" 
          }));
          return;
        }
        
        try {
          await updatePassword(currentUser, formData.newPassword);
          
          // Clear password fields after successful change
          setFormData(prev => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          }));
          setCurrentPasswordVerified(false);
          
          // Update original data if name/status also changed
          if (nameChanged || statusChanged) {
            await updateFirestoreProfile();
          }
          
          setShowNotification(true);
          setTimeout(() => {
            setShowNotification(false);
            alert("Password changed successfully!");
          }, 1000);
          return;
        } catch (passwordError) {
          setErrors(prev => ({ 
            ...prev, 
            newPassword: `Failed to update password: ${passwordError.message}` 
          }));
          return;
        }
      }
      
      // Handle name/status changes (update Firestore)
      if (nameChanged || statusChanged) {
        await updateFirestoreProfile();
        
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
      
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        general: "An error occurred. Please try again." 
      }));
    }
  };

  const updateFirestoreProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: currentUser.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          active: formData.status === "Active"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('Profile updated:', result);
      
      // Update original data to reflect saved changes
      setOriginalData(prev => ({
        ...prev,
        firstName: formData.firstName,
        lastName: formData.lastName,
        status: formData.status
      }));
      
      // Trigger a custom event to notify SecondaryNav to refresh
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      setErrors(prev => ({ 
        ...prev, 
        general: `Failed to update profile: ${error.message}` 
      }));
      return false;
    }
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
  };

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

    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!formData.email.includes("@"))
      newErrors.email = "Enter a valid email.";
    else {
      const emailLower = formData.email.toLowerCase();
      if (
        !emailLower.endsWith("@sait.ca") &&
        !emailLower.endsWith("@edu.sait.ca") &&
        !emailLower.endsWith("@gmail.com")
      )
        newErrors.email = "Must be a SAIT or Gmail email.";
    }

    if (!isAdmin && formData.email !== originalEmail && !currentPasswordVerified) {
      newErrors.currentPassword = "Please verify your password before changing email.";
    }

    if (!isAdmin) {
      if (formData.newPassword && !formData.currentPassword)
        newErrors.currentPassword = "Current password is required.";

      if (formData.newPassword) {
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
      if (
        formData.newPassword &&
        formData.newPassword !== formData.confirmPassword
      )
        newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirmModal(true);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 text-[#212529]"
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
              maxLength={50}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-800">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
              maxLength={50}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
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
            maxLength={100}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
          {!isAdmin && formData.email !== originalEmail && !currentPasswordVerified && (
            <p className="text-orange-600 text-sm mt-1 font-semibold">
              ⚠ You must verify your current password before changing your email.
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800">
              Account Status
            </label>
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
            <label className="font-semibold text-gray-800">
              Current Password
              {formData.email !== originalEmail && (
                <span className="text-red-500"> *</span>
              )}
            </label>
            <div className="relative">
              <input
                name="currentPassword"
                type={showPassword.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password to change password"
                className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                disabled={currentPasswordVerified}
              />

              <button
                type="button"
                className="absolute right-3 top-4"
                onMouseDown={() =>
                  setShowPassword((prev) => ({ ...prev, current: true }))
                }
                onMouseUp={() =>
                  setShowPassword((prev) => ({ ...prev, current: false }))
                }
                onMouseLeave={() =>
                  setShowPassword((prev) => ({ ...prev, current: false }))
                }
                onTouchStart={() =>
                  setShowPassword((prev) => ({ ...prev, current: true }))
                }
                onTouchEnd={() =>
                  setShowPassword((prev) => ({ ...prev, current: false }))
                }
              >
                <Image
                  src={
                    showPassword.current
                      ? "/icons/eye-close.png"
                      : "/icons/eye-open.png"
                  }
                  alt="toggle password"
                  width={20}
                  height={20}
                />
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPassword}
              </p>
            )}
            {!currentPasswordVerified && (
              <button
                type="button"
                onClick={verifyCurrentPassword}
                disabled={isVerifying || !formData.currentPassword}
                className="mt-2 px-4 py-2 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying..." : "Verify Password"}
              </button>
            )}
            {currentPasswordVerified && (
              <p className="text-green-600 text-sm mt-1">
                ✓ Password verified. You can now change your password.
              </p>
            )}
          </div>

          {currentPasswordVerified && (
            <div className="flex flex-col">
              <label className="font-semibold text-gray-800">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="New Password"
                  className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-4"
                  onMouseDown={() =>
                    setShowPassword((prev) => ({ ...prev, new: true }))
                  }
                  onMouseUp={() =>
                    setShowPassword((prev) => ({ ...prev, new: false }))
                  }
                  onMouseLeave={() =>
                    setShowPassword((prev) => ({ ...prev, new: false }))
                  }
                  onTouchStart={() =>
                    setShowPassword((prev) => ({ ...prev, new: true }))
                  }
                  onTouchEnd={() =>
                    setShowPassword((prev) => ({ ...prev, new: false }))
                  }
                >
                  <Image
                    src={
                      showPassword.new
                        ? "/icons/eye-close.png"
                        : "/icons/eye-open.png"
                    }
                    alt="toggle password"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>
          )}

          {currentPasswordVerified && (
            <div className="flex flex-col">
              <label className="font-semibold text-gray-800">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm New Password"
                  className="w-full pr-10 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
                <button
                  type="button"
                  className="absolute right-3 top-4"
                  onMouseDown={() =>
                    setShowPassword((prev) => ({ ...prev, confirm: true }))
                  }
                  onMouseUp={() =>
                    setShowPassword((prev) => ({ ...prev, confirm: false }))
                  }
                  onMouseLeave={() =>
                    setShowPassword((prev) => ({ ...prev, confirm: false }))
                  }
                  onTouchStart={() =>
                    setShowPassword((prev) => ({ ...prev, confirm: true }))
                  }
                  onTouchEnd={() =>
                    setShowPassword((prev) => ({ ...prev, confirm: false }))
                  }
                >
                  <Image
                    src={
                      showPassword.confirm
                        ? "/icons/eye-close.png"
                        : "/icons/eye-open.png"
                    }
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

      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t mt-8">
        {showNotification && (
          <NotificationModal
            title="Success"
            message={
              formData.email !== originalEmail
                ? "Verification email sent! Please check your inbox."
                : "Profile updated successfully!"
            }
            onClose={() => setShowNotification(false)}
          />
        )}
        {showConfirmModal && (
          <ConfirmModal
            title="Save Changes?"
            message={
              formData.email !== originalEmail
                ? "You are changing your email address. A verification email will be sent to your new address. Do you want to continue?"
                : "Are you sure you want to save these changes?"
            }
            confirmText="Yes, Save"
            cancelText="Cancel"
            onConfirm={handleConfirmSave}
            onCancel={handleCancelSave}
          />
        )}
        <Link href={isAdmin ? "/account-manager" : "/staff-welcome-page"}>
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
