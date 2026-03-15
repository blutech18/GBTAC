"use client";
import { useState } from "react";
import Modal from "./Modal";
import Image from "next/image";
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
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const isSaitEmail = (email) => {
    const lower = email.toLowerCase();
    return (
      lower.endsWith("@sait.ca") ||
      lower.endsWith("@edu.sait.ca") ||
      lower.endsWith("@gmail.com")
    );
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
      subject,
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
        password,
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
    <div className="w-full max-w-md bg-white/85 rounded-sm shadow-md p-8 relative">
      {/* Heading */}
      <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">
        Login
      </h2>
      <p className="mb-6 text-gray-600">
        Enter your Credentials to access your account
      </p>

      <label className="font-semibold text-gray-800">SAIT Email</label>
      <input
        type="email"
        placeholder="Enter your SAIT email"
        value={employeeEmail}
        onChange={(e) => setEmployeeEmail(e.target.value)}
        className="w-full border px-3 py-2 border-gray-300 rounded-lg my-4 bg-white focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
      />

      {errors.employeeEmail && (
        <p className="text-red-500 text-sm mb-2">{errors.employeeEmail}</p>
      )}
      <label className="font-semibold text-gray-800">Password</label>
      <div className="relative my-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 pr-10 border-gray-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
        />

        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          onMouseDown={() => setShowPassword(true)}
          onMouseUp={() => setShowPassword(false)}
          onMouseLeave={() => setShowPassword(false)}
          onTouchStart={() => setShowPassword(true)}
          onTouchEnd={() => setShowPassword(false)}
        >
          <Image
            src={showPassword ? "/icons/eye-close.png" : "/icons/eye-open.png"}
            alt="toggle password"
            width={20}
            height={20}
          />
        </button>
      </div>
      <button
        type="button"
        className="text-blue-600/75 hover:underline text-sm mb-4"
        onClick={() => setShowForgotModal(true)}
      >
        Forgot my password
      </button>

      {errors.password && (
        <p className="text-red-500 text-sm mb-2">{errors.password}</p>
      )}
      <div className="flex justify-center">
        <button
          className="group w-1/2 bg-[#005EB8] text-white py-3 mb-6 rounded-full text-lg font-bold justify-center hover:bg-blue-700 transition flex gap-4 items-center"
          onClick={handleLogin}
        >
          Login
          <Image
            src="/icons/arrow-right.png"
            alt="chevron"
            width={15}
            height={15}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      </div>

      <div className="flex flex-row text-sm justify-center gap-2">
        <label className="text-gray-600">Do not have an account?</label>
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => setShowRequestModal(true)}
        >
          Request access
        </button>
      </div>

      {showForgotModal && (
        <Modal
          title="Forgot Password"
          onClose={() => setShowForgotModal(false)}
          onSubmit={handleForgotSubmit}
          submitText="Send"
        >
          <input
            type="email"
            placeholder="Enter your SAIT email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-500"
          />
        </Modal>
      )}

      {showRequestModal && (
        <Modal
          title="Request Access"
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleRequestSubmit}
          submitText="Send Request"
        >
          <input
            type="email"
            placeholder="Enter your SAIT email"
            value={employeeEmail}
            onChange={(e) => setEmployeeEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-500"
          />
        </Modal>
      )}
    </div>
  );
}
