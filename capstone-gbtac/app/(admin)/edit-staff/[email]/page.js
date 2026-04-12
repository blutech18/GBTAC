/**
 * EditStaffPage
 *
 * Admin page for editing a specific staff member's account, identified by the
 * email URL parameter. Fetches the staff record from the backend on mount and
 * presents an inline form for updating name, email, and active status.
 *
 * Notes:
 * - The email param is URL-decoded from the dynamic [email] route segment.
 * - Email changes update both Firebase Auth and Firestore via the
 *   /auth/admin/update-staff endpoint.
 * - Admins cannot change staff passwords; a notice is shown in the form.
 * - The Save button is disabled until at least one field differs from the
 *   original fetched data.
 *
 * @returns The admin edit-staff-by-email page
 *
 * @author Temi Bankole
 * @author Dominique Anne Lee
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
import NotificationModal from "@/app/_components/NotificationModal";
import Link from "next/link";

export default function EditStaffPage() {
  const params = useParams();
  const router = useRouter();
  const email = decodeURIComponent(params.email);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);
  const [originalEmail, setOriginalEmail] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const getValidationErrors = (data) => {
    const newErrors = {};

    if (!data.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (data.firstName.trim().length < 2) {
      newErrors.firstName = "Must be at least 2 characters.";
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.firstName)) {
      newErrors.firstName = "No numbers or special characters.";
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    } else if (data.lastName.trim().length < 2) {
      newErrors.lastName = "Must be at least 2 characters.";
    } else if (!/^[a-zA-Z\s'-]+$/.test(data.lastName)) {
      newErrors.lastName = "No numbers or special characters.";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!data.email.includes("@")) {
      newErrors.email = "Enter a valid email.";
    } else {
      const emailLower = data.email.toLowerCase();
      if (
        !emailLower.endsWith("@sait.ca") &&
        !emailLower.endsWith("@edu.sait.ca") &&
        !emailLower.endsWith("@gmail.com")
      ) {
        newErrors.email = "Must be a SAIT or Gmail email.";
      }
    }

    return newErrors;
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/auth/staff-by-email?email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.detail || `Failed to fetch staff data (${response.status})`;
          console.error("Fetch error:", response.status, errorData);
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success && data.staff) {
          const staffData = {
            firstName: data.staff.firstName || "",
            lastName: data.staff.lastName || "",
            email: data.staff.email,
            status: data.staff.active ? "Active" : "Inactive",
          };
          setFormData(staffData);
          setOriginalData(staffData);
          setOriginalEmail(data.staff.email);
        }
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchStaffData();
    }
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setFieldErrors(getValidationErrors(updated));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = getValidationErrors(formData);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/auth/admin/update-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          originalEmail: originalEmail,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          active: formData.status === "Active",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to update staff account";

        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          errorMessage = data.detail[0].msg || errorMessage;
        } else if (typeof data.detail === "object" && data.detail !== null) {
          errorMessage = data.detail.message || JSON.stringify(data.detail);
        }

        throw new Error(errorMessage);
      }

      setShowSuccessNotification(true);
    } catch (error) {
      console.error("Update staff error:", error);
      setError(error.message);
      setNotificationMessage(error.message);
      setShowErrorNotification(true);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.firstName !== originalData.firstName ||
      formData.lastName !== originalData.lastName ||
      formData.email !== originalData.email ||
      formData.status !== originalData.status
    );
  };

  const hasValidationErrors = Object.keys(getValidationErrors(formData)).length > 0;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FdFdFd] font-sans">
        <SecondaryNav displayLogin={false} displayLogout={true} displayProfile={true} />
        <Navbar displayAbout={false} displayHome={false} displayDashboardMngmt={true} displayAccountMngmt={true} />
        <main className="bg-gray-50 flex-1 w-full flex flex-col items-center justify-center">
          <p className="text-gray-600">Loading staff data...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !formData.email) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FdFdFd] font-sans">
        <SecondaryNav displayLogin={false} displayLogout={true} displayProfile={true} />
        <Navbar displayAbout={false} displayHome={false} displayDashboardMngmt={true} displayAccountMngmt={true} />
        <main className="bg-gray-50 flex-1 w-full flex flex-col items-center justify-center">
          <p className="text-red-600">Error: {error}</p>
          <Link href="/account-manager" className="mt-4">
            <button className="px-5 py-3 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition">
              Back to Account Manager
            </button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FdFdFd] font-sans">
      <SecondaryNav displayLogin={false} displayLogout={true} displayProfile={true} />
      <Navbar displayAbout={false} displayHome={false} displayDashboardMngmt={true} displayAccountMngmt={true} />
      
      <main className="bg-gray-50 flex-1 w-full flex flex-col">
        <div className="w-full sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 py-8 flex-1">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-[#212529]">
              Edit Staff Account
            </h1>

            <div className="bg-white p-8 rounded-xl shadow-md">

            <form
              onSubmit={handleSubmit}
              className="space-y-10 text-[#212529]"
            >
              <div className="space-y-6">
                <h2 className="text-lg border-b pb-2 font-semibold text-gray-800">
                  Staff Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-800">First Name</label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      maxLength={50}
                      className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                      required
                    />
                    {fieldErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.firstName}</p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-800">Last Name</label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      maxLength={50}
                      className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                      required
                    />
                    {fieldErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold text-gray-800">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="staff@example.com"
                    className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                    maxLength={254}
                    required
                  />
                  {formData.email !== originalEmail && (
                    <p className="text-sm text-blue-600 mt-1">⚠️ Changing email will update the users login credentials</p>
                  )}
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold text-gray-800">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> As an admin, you cannot change user passwords. 
                    Password changes must be done by the user themselves.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t mt-8">
                <Link href="/account-manager">
                  <button
                    type="button"
                    className="px-5 py-3 bg-[#912932] text-white font-semibold rounded hover:bg-[#8B1625] transition"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={!hasChanges() || saving || hasValidationErrors}
                  className={`px-5 py-3 text-white font-semibold rounded transition ${
                    hasChanges() && !saving && !hasValidationErrors
                      ? "bg-[#005EB8] hover:bg-[#004080]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
        <Footer />
      </main>
      {showSuccessNotification && (
        <NotificationModal
          title="Success"
          message="Staff account updated successfully"
          onClose={() => {
            setShowSuccessNotification(false);
            router.push("/account-manager");
          }}
        />
      )}
      {showErrorNotification && (
        <NotificationModal
          title="Error"
          message={notificationMessage || "Failed to update staff account."}
          variant="error"
          onClose={() => setShowErrorNotification(false)}
        />
      )}
    </div>
  );
}