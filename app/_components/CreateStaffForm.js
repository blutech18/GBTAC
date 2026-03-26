//This component is for the Admin to create a new staff account. They can input the staff's first name, last name, email, and status (active/inactive).
"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreateStaffForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "Active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/auth/create-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          active: formData.status === "Active",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to create staff account";

        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          let rawMsg = data.detail[0].msg || errorMessage;

          if (rawMsg.toLowerCase().includes("email address")) {
            errorMessage = "Not a valid email address: must contain an @ symbol";
          } else {
            errorMessage = rawMsg;
          }
        } else if (typeof data.detail === "object" && data.detail !== null) {
          errorMessage = data.detail.message || JSON.stringify(data.detail);
        }

        alert(errorMessage);
        return;
      }

      alert("Staff account created successfully");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        status: "Active",
      });
    } catch (error) {
      console.error("Create staff error:", error);
      alert("Something went wrong while creating the staff account.");
    }
  };

  return (
     <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-md">
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
            value={formData.email}
            onChange={handleChange}
            placeholder="johndoe@example.com"
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900 placeholder-gray-500"
            required
          />
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
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t mt-8">
        <Link href="/account-manager">
          <button
            type="reset"
            className="px-5 py-3 bg-[#912932] text-white font-semibold rounded hover:bg-[#8B1625] transition"
          >
            Cancel
          </button>
        </Link>
        <button
          type="submit"
          className="px-5 py-3 bg-[#005EB8] text-white font-semibold rounded hover:bg-[#004080] transition"
        >
          Create Staff
        </button>
      </div>
    </form>
  </div>
  );
}