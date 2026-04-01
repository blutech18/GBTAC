"use client";
import { useEffect, useState, useRef } from "react";
import Modal from "./Modal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../_utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../_utils/auth-context";

/**
 * LoginForm
 *
 * Email/password login form for the Capstone App. Handles credential
 * validation, Cloudflare Turnstile CAPTCHA verification, backend lockout
 * enforcement, and role-based redirect after a successful sign-in. Also
 * exposes a multi-step forgot-password flow (email → code → new password)
 * and an access-request mailto shortcut for unapproved users.
 *
 * Notes:
 * - Accepts only @sait.ca, @edu.sait.ca, and @gmail.com addresses.
 * - Login and password-reset code sends are both rate-limited by the backend;
 *   cooldown countdowns are driven locally once the remaining seconds are
 *   returned from the API.
 * - Turnstile callbacks are registered as window globals because the widget
 *   invokes them by name via its data-callback attributes.
 *
 * @author Cintya Lara Flores
 * @author Anna Isabelle Yabut
 */

export default function LoginForm() {
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [employeeEmail, setEmployeeEmail] = useState("");
  // Kept separate from employeeEmail so the forgot flow does not overwrite the login field
  const [forgotEmail, setForgotEmail] = useState("");
  const [password, setPassword] = useState("");
  // "email" → "code" → "password" — controls which step of the forgot-password modal is shown
  const [step, setStep] = useState("email");
  const [resetCodeArray, setResetCodeArray] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginCooldownSeconds, setLoginCooldownSeconds] = useState(0);
  const [resetCooldownSeconds, setResetCooldownSeconds] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");

  const router = useRouter();
  const { refreshSession } = useAuth();

  // One ref per digit box — used to move focus forward/backward as the user types
  const inputRefs = useRef([]);

  // Counts down resetCooldownSeconds once the backend signals a rate-limit on code sends
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

  // Counts down loginCooldownSeconds once the backend signals a lockout
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

  // Turnstile calls these globals by name via data-callback attributes on the widget div
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

  /**
   * isSaitEmail
   *
   * Returns true if the email belongs to an accepted domain
   * (@sait.ca, @edu.sait.ca, or @gmail.com).
   *
   * @param {string} email - The email address to check
   * @returns {boolean} Whether the domain is on the allowlist
   */
  const isSaitEmail = (email) => {
    const lower = email.toLowerCase();
    return (
      lower.endsWith("@sait.ca") ||
      lower.endsWith("@edu.sait.ca") ||
      lower.endsWith("@gmail.com")
    );
  };

  /**
   * checkLockout
   *
   * Asks the backend whether the account is currently locked due to too many
   * failed login attempts. Called before Firebase sign-in to avoid burning a
   * Firebase request on a known-locked account.
   *
   * @param {string} email - Lowercase email address to check
   * @returns {{ locked: boolean, remainingSeconds: number }} Lockout status
   *
   * Notes:
   * - Throws if the fetch itself fails; callers should catch and surface the error.
   */
  const checkLockout = async (email) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/check-lockout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    if (!res.ok) {
      throw new Error("Failed to check lockout");
    }

    return res.json();
  };

  /**
   * recordFailedLogin
   *
   * Increments the failed-attempt counter for the given account on the backend.
   * Returns the remaining attempts before lockout, and lockout details once
   * the threshold is exceeded.
   *
   * @param {string} email - Lowercase email address
   * @returns {{ locked: boolean, remainingSeconds: number, remainingAttempts: number }}
   *
   * Notes:
   * - Throws if the fetch itself fails.
   */
  const recordFailedLogin = async (email) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/record-failed-login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    if (!res.ok) {
      throw new Error("Failed to record failed login");
    }

    return res.json();
  };

  /**
   * resetLoginAttempts
   *
   * Clears the failed-attempt counter for the given account after a successful
   * login. Called immediately after the session cookie is created.
   *
   * @param {string} email - Lowercase email address
   * @returns {{ success: boolean }} Backend confirmation
   *
   * Notes:
   * - Throws if the fetch itself fails.
   */
  const resetLoginAttempts = async (email) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-login-attempts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    if (!res.ok) {
      throw new Error("Failed to reset login attempts");
    }

    return res.json();
  };

  /**
   * checkAllowedUserWithToken
   *
   * Verifies that the signed-in user's Firebase ID token corresponds to an
   * account on the backend allowlist. Must be called after Firebase sign-in
   * and before creating a session cookie.
   *
   * @param {string} idToken - Fresh Firebase ID token from the signed-in user
   * @returns {{ allowed: boolean }} Whether the account is on the allowlist
   *
   * Notes:
   * - Throws with the backend's detail message if the check fails or the
   *   account is not recognised.
   */
  const checkAllowedUserWithToken = async (idToken) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/check-allowed-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      },
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Allowed user check failed:", res.status, data);
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : JSON.stringify(
              data?.detail || data || "Failed to check allowed user",
            ),
      );
    }

    return data;
  };

  /**
   * createSessionLogin
   *
   * Exchanges a Firebase ID token for a server-side session cookie. Uses
   * credentials: "include" so the browser stores the HttpOnly cookie returned
   * by the backend.
   *
   * @param {string} idToken - Fresh Firebase ID token from the signed-in user
   * @returns {{ success: boolean }} Session creation confirmation
   *
   * Notes:
   * - Throws if session creation fails; callers should sign out of Firebase
   *   before surfacing the error to avoid a partially authenticated state.
   */
  const createSessionLogin = async (idToken) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/session-login`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to create session");
    }

    return data;
  };

  /**
   * requestPasswordReset
   *
   * Sends a 6-digit reset code to the given email address. The backend
   * enforces a rate limit; when the limit is active the response includes
   * remainingSeconds instead of a success flag.
   *
   * @param {string} email - Lowercase email address to send the code to
   * @returns {{ success: boolean, remainingSeconds?: number }}
   *
   * Notes:
   * - Throws if the fetch itself fails.
   * - Callers must check result.success before advancing the flow; a falsy
   *   success means the rate limit is active, not that the email was rejected.
   */
  const requestPasswordReset = async (email) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/request-password-reset`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : JSON.stringify(
              data?.detail || data || "Failed to request password reset",
            ),
      );
    }

    return data;
  };

  /**
   * verifyCaptcha
   *
   * Sends the Cloudflare Turnstile token to the backend for server-side
   * verification. Login is blocked if this step fails.
   *
   * @param {string} token - Turnstile token from the widget success callback
   * @returns {{ success: boolean }} Verification result
   *
   * Notes:
   * - Throws if verification fails; callers should reset the Turnstile widget
   *   so the user must solve it again before the next attempt.
   */
  const verifyCaptcha = async (token) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-captcha`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captcha_token: token }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "CAPTCHA verification failed");
    }

    return data;
  };

  // Resets the Turnstile widget and clears the stored token so the user must solve the challenge again before their next login attempt
  const resetTurnstile = () => {
    setCaptchaToken("");
    if (typeof window !== "undefined" && window.turnstile) {
      window.turnstile.reset();
    }
  };

  // Validates the main login form; sets errors state and returns false if any field fails
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

  /**
   * verifyResetCode
   *
   * Validates the 6-digit code the user entered against the one the backend
   * sent to their email. On success the forgot-password flow advances to the
   * password-entry step.
   *
   * @param {string} email - The email the code was sent to
   * @param {string} code  - The 6-digit code entered by the user
   * @returns {{ message: string }} Backend confirmation message
   *
   * Notes:
   * - Throws if the code is invalid or expired.
   */
  const verifyResetCode = async (email, code) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      },
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : JSON.stringify(data?.detail || data || "Invalid code"),
      );
    }

    return data;
  };

  /**
   * confirmPasswordReset
   *
   * Completes the forgot-password flow by submitting the verified code and
   * the user's new password to the backend.
   *
   * @param {string} email       - The email the reset was initiated for
   * @param {string} code        - The 6-digit code that was already verified
   * @param {string} newPassword - The new password chosen by the user
   * @returns {{ success: boolean }} Backend confirmation
   *
   * Notes:
   * - Throws if the reset fails (e.g. code expired between verify and confirm,
   *   or the new password does not meet complexity requirements).
   */
  const confirmPasswordReset = async (email, code, newPassword) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/confirm-password-reset`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      },
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : JSON.stringify(data?.detail || data || "Reset failed"),
      );
    }

    return data;
  };

  // Sends the reset code (or resends it) and advances to the code-entry step on success; if the backend signals a rate limit, starts the cooldown timer with the seconds returned
  const handleForgotSubmit = async () => {
    try {
      if (!forgotEmail.trim()) {
        alert("Please enter your email.");
        return;
      }

      const emailToSend = forgotEmail.trim().toLowerCase();

      const result = await requestPasswordReset(emailToSend);

      if (!result.success) {
        setResetCooldownSeconds(result.remainingSeconds || 0);
        alert(`Please wait ${result.remainingSeconds}s`);
        return;
      }

      alert("Verification code sent!");
      setStep("code");
    } catch (err) {
      alert("Reset failed: " + err.message);
    }
  };

  // Opens the user's mail client with a pre-filled access-request email addressed to the admin
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

  // Full login sequence: validate → lockout check → CAPTCHA → Firebase sign-in → allowlist check → Firestore profile check → session creation → role-based redirect
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
      await refreshSession();
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
      // auth/too-many-requests is Firebase's own rate-limit, distinct from the backend lockout
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

  // Joins the digit array and submits it for verification; advances to the password step on success
  const handleVerifyCode = async () => {
    try {
      const code = resetCodeArray.join("");

      if (code.length !== 6) {
        alert("Please enter the full 6-digit code.");
        return;
      }

      const result = await verifyResetCode(forgotEmail, code);
      alert(result.message || "Code verified!");
      setStep("password");
    } catch (err) {
      alert(
        typeof err?.message === "string"
          ? err.message
          : "Failed to verify code",
      );
    }
  };

  // Confirms the new password matches, then submits the reset; resets all modal state on success
  const handleResetPassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const code = resetCodeArray.join("");

      if (code.length !== 6) {
        alert("Please enter the full 6-digit code.");
        return;
      }

      await confirmPasswordReset(forgotEmail, code, newPassword);

      alert("Password reset successful!");

      // reset everything
      setShowForgotModal(false);
      setStep("email");
      setForgotEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setResetCodeArray(["", "", "", "", "", ""]);
    } catch (err) {
      alert(err.message);
    }
  };

  // Updates the digit at `index` and moves focus to the next box when a digit is entered
  const handleCodeChange = (value, index) => {
    // Reject anything that is not a single digit or an empty string (from deletion)
    if (!/^\d?$/.test(value)) return;

    const newCode = [...resetCodeArray];
    newCode[index] = value;
    setResetCodeArray(newCode);

    // move forward
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Retreats focus to the previous box on Backspace when the current box is already empty
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!resetCodeArray[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white/85 rounded-sm shadow-md p-8 relative">
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
        maxLength={320}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 my-4 bg-white focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 bg-white focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
        />

        {/* Hold to reveal, release to hide — both mouse and touch events for cross-device support */}
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

      {/* Turnstile widget — callbacks are wired via the window globals registered in useEffect */}
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

      <div className="flex text-sm justify-center gap-2">
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
          title={
            step === "email"
              ? "Forgot Password"
              : step === "code"
                ? "Verify Code"
                : "Reset Password"
          }
          onClose={() => {
            setShowForgotModal(false);
            setStep("email");
            setForgotEmail("");
            setNewPassword("");
            setConfirmPassword("");
            setResetCooldownSeconds(0);
            setResetCodeArray(["", "", "", "", "", ""]);
          }}
          onSubmit={
            step === "email"
              ? handleForgotSubmit
              : step === "code"
                ? handleVerifyCode
                : handleResetPassword
          }
          submitText={
            step === "email"
              ? resetCooldownSeconds > 0
                ? `Wait ${resetCooldownSeconds}s`
                : "Send Code"
              : step === "code"
                ? "Verify Code"
                : "Reset Password"
          }
          submitDisabled={
            (step === "email" &&
              (!forgotEmail.trim() || resetCooldownSeconds > 0)) ||
            (step === "code" && resetCodeArray.join("").length !== 6) ||
            (step === "password" &&
              (!newPassword.trim() || !confirmPassword.trim()))
          }
        >
          {step === "email" && (
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your SAIT email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                maxLength={320}
                className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-500"
              />

              <p className="text-sm text-gray-500">
                We’ll send a 6-digit verification code to your email.
              </p>
            </div>
          )}

          {step === "code" && (
            <div className="flex flex-col gap-3">
              {/* One input per digit; inputRefs drives auto-advance and backspace-retreat */}
              <div className="flex justify-center gap-2">
                {resetCodeArray.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-10 h-12 text-center text-lg border rounded focus:outline-none focus:border-blue-500"
                  />
                ))}
              </div>

              <p className="text-sm text-gray-500 text-center">
                Enter the code sent to <strong>{forgotEmail}</strong>
              </p>

              {/* Disabled during the server-enforced cooldown period */}
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline text-center disabled:text-gray-400"
                onClick={handleForgotSubmit}
                disabled={resetCooldownSeconds > 0}
              >
                {resetCooldownSeconds > 0
                  ? `Resend in ${resetCooldownSeconds}s`
                  : "Resend Code"}
              </button>
            </div>
          )}

          {step === "password" && (
            <div className="flex flex-col gap-2">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-500"
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-500"
              />

              <p className="text-xs text-gray-500">
                Password must be at least 8 characters and include an uppercase
                letter, number, and special character.
              </p>
            </div>
          )}
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
            maxLength={320}
            className="w-full border px-3 py-2 rounded text-gray-900 placeholder-gray-500"
          />
        </Modal>
      )}
    </div>
  );
}
