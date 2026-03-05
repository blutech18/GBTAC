//This component is a form for the admin to edit staff information. It is used in the edit staff page. It contains fields for the staff member's name, email, role, and status.
"use client";

import { useState } from "react";
import Link from "next/link";

export default function EditStaffForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "Active",
  }); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //Send formData to your backend API to update the staff member's information.
    console.log("Form submitted:", formData);
  };

return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 text-[#212529]"
      style={{ fontFamily: "var(--font-titillium)" }}
    >

      {/* Personal Info Section */}
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
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-gray-800">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900"
              required
            />
          </div>

        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-800">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-800">Account Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t mt-8">
        <Link href ="/account-manager">
        <button
          type="button"
          className="px-5 py-3 bg-[#912932] text-white font-semibold rounded hover:bg-[#8B1625] transition"
        >
          Cancel
        </button>
        </Link>
        <button
          type="submit"
          className="px-5 py-3 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}