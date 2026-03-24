"use client";

// EditStaffForm — fetches the staff member's data by email and allows editing.
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditStaffForm({ email }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "staff",
    status: "Active",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch existing staff data on mount
  useEffect(() => {
    if (!email) return;
    fetch(`http://localhost:8000/auth/staff/${encodeURIComponent(email)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Staff member not found");
        return res.json();
      })
      .then((data) => {
        setFormData({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? email,
          role: data.role ?? "staff",
          status: data.active === true ? "Active" : "Inactive",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(
        `http://localhost:8000/auth/staff/${encodeURIComponent(email)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role,
            active: formData.status === "Active",
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail ?? "Failed to save changes");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex justify-center items-center py-16 text-gray-500"
        style={{ fontFamily: "var(--font-titillium)" }}
      >
        <svg
          className="animate-spin h-6 w-6 mr-3 text-[#005EB8]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        Loading staff data…
      </div>
    );
  }

  // ─── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-md">
      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm flex items-start gap-2">
          <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm flex items-start gap-2">
          <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Changes saved successfully.
        </div>
      )}

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
              <label className="font-semibold text-gray-800 mb-1">First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-gray-800 mb-1">Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-gray-800 mb-1">Email</label>
            <input
              name="email"
              value={formData.email}
              readOnly
              className="border rounded-lg p-3 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="font-semibold text-gray-800 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900 bg-white"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-gray-800 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition text-gray-900 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t mt-8">
          <button
            type="button"
            onClick={() => router.push("/account-manager")}
            className="px-5 py-3 bg-[#912932] text-white font-semibold rounded hover:bg-[#8B1625] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition disabled:opacity-60 disabled:cursor-not-allowed"
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
    </div>
  );
}
