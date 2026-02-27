"use client";
import { useState } from "react";
import Modal from "./Modal";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../_utils/firebase";

export default function LoginForm() {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const isSaitEmail = (email) => {
    const lower = email.toLowerCase();
    return lower.endsWith("@sait.ca") || lower.endsWith("@edu.sait.ca") || lower.endsWith("@gmail.com");
  };

  const checkAllowedUser = async (email) => {
    const emailLower = email.toLowerCase();
    const ref = doc(db, "allowedUsers", emailLower);
    const snap = await getDoc(ref);

    if (!snap.exists()) return { allowed: false, reason: "not_whitelisted" };

    const data = snap.data();
    if (data.active !== true) return { allowed: false, reason: "inactive" };

    return { allowed: true, role: data.role || "user" }; 
  };

  const validate = () => {
    const newErrors = {};

    if (!employeeEmail.trim()) newErrors.employeeEmail = "Email is required";
    else if (!employeeEmail.includes("@"))
      newErrors.employeeEmail = "Enter a valid email";
    else if (!isSaitEmail(employeeEmail.trim()))
      newErrors.employeeEmail = "Use a SAIT email";

    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotSubmit = async () => {
    try {
      if (!forgotEmail.trim()) {
        alert("Please enter your email.");
        return;
      }
      if (!isSaitEmail(forgotEmail.trim())) {
        alert("Please use your SAIT email.");
        return;
      }

      const emailToSend = forgotEmail.trim().toLowerCase();
      await sendPasswordResetEmail(auth, emailToSend);
      alert(`Password reset email sent to ${emailToSend}`);

      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err) {
      alert("Reset failed: " + err.message);
    }
  };

  const handleRequestSubmit = () => {
    if (!employeeEmail.trim()) {
      alert("Please enter your email first.");
      return;
    }

    // Change to real admin email later on
    const adminEmail = "annaisabelle.yabut@edu.sait.ca";

    const subject = "Access Request – Capstone App";
    const body = `Hello,\n\nPlease approve access for:\n${employeeEmail
      .trim()
      .toLowerCase()}\n\nThanks.`;

    window.location.href = `mailto:${adminEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    setShowRequestModal(false);
    setEmployeeEmail("");
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        employeeEmail.trim().toLowerCase(),
        password
      );

      const allowed = await checkAllowedUser(cred.user.email);

      if (!allowed.allowed) {
        alert("You are not authorized to access this app.");
        await signOut(auth);
        setPassword("");
        return;
      }

      router.push("/home");
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 relative">
      {/* Heading */}
      <h2
        className="text-3xl font-bold text-start mb-6 text-gray-900"
        style={{ fontFamily: "var(--font-titillium)" }}
      >
        Login
      </h2>
      <p
        className="mb-6 text-gray-600"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        Enter your Credentials to access your account
      </p>

      <label
        className="font-semibold text-gray-800"
        style={{ fontFamily: "var(--font-titillium)" }}
      >
        SAIT Email
      </label>
      <input
        type="email"
        placeholder="Enter your SAIT email"
        value={employeeEmail}
        onChange={(e) => setEmployeeEmail(e.target.value)}
        className="w-full border px-3 py-2 border-gray-300 rounded-lg my-4 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
      />

      {errors.employeeEmail && (
        <p className="text-red-500 text-sm mb-2">{errors.employeeEmail}</p>
      )}

      <label
        className="font-semibold text-gray-800"
        style={{ fontFamily: "var(--font-titillium)" }}
      >
        Password
      </label>
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-3 py-2 border-gray-300 rounded-lg my-4 focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
      />

      {errors.password && (
        <p className="text-red-500 text-sm mb-2">{errors.password}</p>
      )}

      <div className="flex justify-between mb-6 text-sm">
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => setShowForgotModal(true)}
        >
          Forgot my password
        </button>
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => setShowRequestModal(true)}
        >
          Request access
        </button>
      </div>
      <div className="flex justify-center">
        <button
          className="w-1/2 bg-[#005EB8] text-white py-3 rounded-full text-lg font-bold hover:bg-blue-700 transition flex justify-between items-center ps-15 pe-6"
          style={{ fontFamily: "var(--font-titillium)" }}
          onClick={handleLogin}
        >
          Login
          <span className="ml-2">{">"}</span>
        </button>
      </div>

      {showForgotModal && (
        <Modal
          title="Forgot Password"
          onClose={() => setShowForgotModal(false)}
          email={forgotEmail}
          emailHandlerFunc={(e) => setForgotEmail(e.target.value)}
          handleForgotSubmit={handleForgotSubmit}
        />
      )}

      {showRequestModal && (
        <Modal
          title="Request Access"
          onClose={() => setShowRequestModal(false)}
        >
          <input
            type="email"
            placeholder="Enter your SAIT email"
            value={employeeEmail}
            onChange={(e) => setEmployeeEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-500"
          />
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 mt-2 w-full"
            onClick={handleRequestSubmit}
          >
            Send
          </button>
        </Modal>
      )}
    </div>
  );
}
