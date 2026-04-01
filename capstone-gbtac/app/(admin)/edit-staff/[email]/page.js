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
 * @author Dominique Lee
 */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SecondaryNav from "@/app/_components/SecondaryNav";
import Navbar from "@/app/_components/Navbar";
import Footer from "@/app/_components/Footer";
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
  const [originalData, setOriginalData] = useState(null);
  const [originalEmail, setOriginalEmail] = useState("");

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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      alert("Staff account updated successfully");
      router.push("/account-manager");
    } catch (error) {
      console.error("Update staff error:", error);
      setError(error.message);
      alert(error.message);
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
          <h1 className="text-3xl font-bold mb-10 text-[#212529]">
            Edit Staff Account
          </h1>

          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <form
              onSubmit={handleSubmit}
              className="space-y-10 text-[#212529]"
              style={{ fontFamily: "var(--font-titillium)" }}
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
                      className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-800">Last Name</label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
                      required
                    />
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
                    required
                  />
                  {formData.email !== originalEmail && (
                    <p className="text-sm text-blue-600 mt-1">⚠️ Changing email will update the users login credentials</p>
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
                  disabled={!hasChanges() || saving}
                  className={`px-5 py-3 text-white font-semibold rounded transition ${
                    hasChanges() && !saving
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
        <Footer />
      </main>
    </div>
  );
}