//This component will have inputs for the 6 digit verification code, and a resend button.
//Contains a handler to cooldown the resend button for 45 seconds after each click.
"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyCodeForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]); //Array of refs for the 6 input fields
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const handleResend = () => {
    //TODO: call your resend API here
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

    const focusIndex = Math.min(pastedDigits.length, 6) - 1;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const fullCode = code.join("");
    console.log("Verification code submitted:", fullCode);
    // TODO: replace with real API call
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
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
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
        <hr className="my-4 border-gray-300"></hr>
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


