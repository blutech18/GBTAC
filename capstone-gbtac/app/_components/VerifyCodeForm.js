"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * VerifyCodeForm
 *
 * Renders a 6-digit verification code entry form with individual inputs per
 * digit, paste support, and a resend button with a 45-second cooldown.
 *
 * Notes:
 * - Each digit is stored as a separate string in a 6-element array; inputs are
 *   navigated via arrow keys and backspace in addition to normal typing
 * - Paste strips non-numeric characters, fills as many digits as were pasted,
 *   and focuses the last filled input
 * - The resend cooldown is driven by a setInterval stored in timerRef; the
 *   interval is cleared on unmount to prevent state updates on an unmounted component
 * - Both the resend API call and the verification API call are not yet implemented
 *   — see the TODOs in handleResend and handleSubmit
 * - On successful verification the user is routed to /auth/reset-password via
 *   the Next.js router
 * @author Temi Bankole
 */
export default function VerifyCodeForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const handleResend = () => {
    // TODO: call resend API here — see GitHub issue for tracking
    setCooldown(45);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCodeChange = (index, value) => {
    // Strip non-numeric characters and take only the last digit to handle
    // cases where the browser inserts the previous value alongside the new one
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextCode = [...code];
    nextCode[index] = digit;
    setCode(nextCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    if (pastedDigits.length === 0) return;

    const nextCode = ["", "", "", "", "", ""];
    pastedDigits.forEach((digit, i) => {
      nextCode[i] = digit;
    });
    setCode(nextCode);

    // Focus the last filled input, or the 6th if all digits were pasted
    const focusIndex = Math.min(pastedDigits.length, 6) - 1;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const fullCode = code.join("");
    // TODO: replace with real API call — see GitHub issue for tracking
    const isValid = false;
    if (isValid) {
      router.push("/auth/reset-password");
    } else {
      setError("Invalid code. Please try again.");
    }
  };

  return (
    <form
      className="space-y-5 text-[#212529] max-w-xl mx-auto"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl border-b pb-2 font-semibold text-gray-800">
            Check Your Email
          </h2>
          <p className="text-sm text-gray-600">
            We sent a verification code to your email. Please check your
            inbox and enter the code below.
          </p>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="verification-code"
            className="font-semibold text-gray-800"
          >
            Verification Code
          </label>

          <div
            className="mt-2 flex flex-wrap sm:justify-start items-center gap-3"
            onPaste={handlePaste}
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                id={index === 0 ? "verification-code" : undefined}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                value={digit}
                required
                aria-label={`Verification code digit ${index + 1}`}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-13 w-12 text-center text-lg font-semibold border rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-blue-500 transition text-gray-900"
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-600">
          To protect your account, do not share this code with anyone.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          className="w-full max-w-87 justify-center flex py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          Verify Code
        </button>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <hr className="my-4 border-gray-300" />
        <div className="text-sm text-center sm:text-left">
          {cooldown > 0 ? (
            <span className="text-gray-400">Resend Code in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    </form>
  );
}