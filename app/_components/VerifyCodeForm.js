//This component will have inputs for the 6 digit verification code, and a resend button.

"use client";
import { useRef, useState } from "react";


export default function VerifyCodeForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

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
  };

  return (
    <form className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900">
          Check Your Email
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          We sent a verification code to your email address. Please check your inbox and enter the code below.
        </p>
      </div>
      <div>
        <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
          Verification Code
        </label>
      <div className="mt-2 flex items-center gap-3 sm:gap-3" onPaste={handlePaste}>
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
                className="h-12 w-10 sm:h-14 sm:w-12 text-center text-lg font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ))}
          </div>     
        </div>
          <button
            type="submit"
            className="justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Verify Code
          </button>
          <div className="text-sm">
            <button

              type="button"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Resend Code

            </button>
          </div>

        

      </form>
  );
}


