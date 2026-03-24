"use client";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../_utils/firebase";
import { doc, getDoc } from "firebase/firestore";

const API_BASE = "http://localhost:8000";

export default function LoginForm() {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginCooldownSeconds, setLoginCooldownSeconds] = useState(0);
  const [resetCooldownSeconds, setResetCooldownSeconds] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (resetCooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setResetCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resetCooldownSeconds]);

  useEffect(() => {
    if (loginCooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setLoginCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loginCooldownSeconds]);

  useEffect(() => {
    window.onTurnstileSuccess = (token) => {
      setCaptchaToken(token);
    };

    window.onTurnstileExpired = () => {
      setCaptchaToken("");
    };

    window.onTurnstileError = () => {
      setCaptchaToken("");
    };

    return () => {
      window.onTurnstileSuccess = undefined;
      window.onTurnstileExpired = undefined;
      window.onTurnstileError = undefined;
    };
  }, []);

  const isSaitEmail = (email) => {
    const lower = email.toLowerCase();
    return (
      lower.endsWith("@sait.ca") ||
      lower.endsWith("@edu.sait.ca") ||
      lower.endsWith("@gmail.com")
    );
  };

  const checkLockout = async (email) => {
    const res = await fetch(`${API_BASE}/auth/check-lockout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error("Failed to check lockout");
    }

    return res.json();
  };

  const recordFailedLogin = async (email) => {
    const res = await fetch(`${API_BASE}/auth/record-failed-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error("Failed to record failed login");
    }

    return res.json();
  };

  const resetLoginAttempts = async (email) => {
    const res = await fetch(`${API_BASE}/auth/reset-login-attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error("Failed to reset login attempts");
    }

    return res.json();
  };

  const checkAllowedUserWithToken = async (idToken) => {
    const res = await fetch(`${API_BASE}/auth/check-allowed-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Allowed user check failed:", res.status, data);
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : JSON.stringify(data?.detail || data || "Failed to check allowed user")
      );
    }

    return data;
  };

  const createSessionLogin = async (idToken) => {
    const res = await fetch(`${API_BASE}/auth/session-login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to create session");
    }

    return data;
  };

  const requestPasswordReset = async (email) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error("Failed to request password reset");
    }

    return res.json();
  };

  const verifyCaptcha = async (token) => {
    const res = await fetch(`${API_BASE}/auth/verify-captcha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captcha_token: token }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "CAPTCHA verification failed");
    }

    return data;
  };

  const resetTurnstile = () => {
    setCaptchaToken("");
    if (typeof window !== "undefined" && window.turnstile) {
      window.turnstile.reset();
    }
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
      const result = await requestPasswordReset(emailToSend);

      if (!result.success) {
        setResetCooldownSeconds(result.remainingSeconds || 0);
        alert(
          `Please wait ${result.remainingSeconds} seconds before requesting another reset email.`,
        );
        return;
      }

      alert(`Password reset email sent to ${emailToSend}`);
      setResetCooldownSeconds(60);
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

    if (!captchaToken) {
      alert("Please complete the security check.");
      return;
    }

    const emailLower = employeeEmail.trim().toLowerCase();

    try {
      const lockoutStatus = await checkLockout(emailLower);

      if (lockoutStatus.locked) {
        setLoginCooldownSeconds(lockoutStatus.remainingSeconds);
        alert(
          `Too many failed login attempts. Please wait ${lockoutStatus.remainingSeconds} seconds before trying again.`,
        );
        return;
      }

      setLoginCooldownSeconds(0);

      try {
        await verifyCaptcha(captchaToken);
      } catch (captchaErr) {
        resetTurnstile();
        alert(
          captchaErr.message ||
            "CAPTCHA verification failed. Please try again.",
        );
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, emailLower, password);

      const idToken = await cred.user.getIdToken(true);
      const allowed = await checkAllowedUserWithToken(idToken);

      if (!allowed.allowed) {
        alert("You are not authorized to access this app.");
        await signOut(auth);
        setPassword("");
        resetTurnstile();
        return;
      }

      const userRef = doc(db, "allowedUsers", emailLower);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        setPassword("");
        resetTurnstile();
        alert("No access profile was found for this account.");
        return;
      }

      const userData = userSnap.data();

      if (userData.active !== true) {
        await signOut(auth);
        setPassword("");
        resetTurnstile();
        alert("This account is not active.");
        return;
      }

      console.log("Before createSessionLogin");
      await createSessionLogin(idToken);
      console.log("After createSessionLogin");
      await resetLoginAttempts(emailLower);

      setErrors({});
      setLoginCooldownSeconds(0);
      resetTurnstile();

      if (userData.role === "admin") {
        router.replace("/account-manager");
      } else if (userData.role === "staff") {
        router.replace("/staff-welcome-page");
      } else {
        await signOut(auth);
        alert("This account does not have a valid role assigned.");
      }
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        resetTurnstile();
        alert(
          "Too many login attempts were detected for this account. Please wait a few minutes before trying again.",
        );
        return;
      }

      const isInvalidLogin =
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential";

      try {
        const result = await recordFailedLogin(emailLower);

        if (result.locked) {
          setLoginCooldownSeconds(result.remainingSeconds);

          const mins = Math.floor(result.remainingSeconds / 60);
          const secs = result.remainingSeconds % 60;
          const timeText =
            mins > 0
              ? `${mins} minute(s) ${secs} second(s)`
              : `${secs} second(s)`;

          resetTurnstile();
          alert(
            `Too many failed login attempts. Account locked for ${timeText}.`,
          );
        } else if (isInvalidLogin) {
          resetTurnstile();
          alert(
            `Invalid email or password. You have ${result.remainingAttempts} attempt(s) left.`,
          );
        } else {
          resetTurnstile();
          console.error("LOGIN ERROR:", err);
          alert("Login failed. Please try again.");
        }
      } catch (backendErr) {
        resetTurnstile();
        console.error("BACKEND LOCKOUT ERROR:", backendErr);
        alert("Login failed. Please try again.");
      }
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

      <div className="flex justify-center mb-4">
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          data-callback="onTurnstileSuccess"
          data-expired-callback="onTurnstileExpired"
          data-error-callback="onTurnstileError"
        />
      </div>

      <div className="flex justify-center">
        <button
          className="group w-1/2 bg-[#005EB8] text-white py-3 mb-6 rounded-full text-lg font-bold justify-center hover:bg-blue-700 transition flex gap-4 items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loginCooldownSeconds > 0}
        >
          {loginCooldownSeconds > 0 ? `Wait ${loginCooldownSeconds}s` : "Login"}
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
          submitText={
            resetCooldownSeconds > 0 ? `Wait ${resetCooldownSeconds}s` : "Send"
          }
          submitDisabled={resetCooldownSeconds > 0}
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
