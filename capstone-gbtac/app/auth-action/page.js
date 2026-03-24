"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from "@/app/_utils/firebase";
import Link from "next/link";

function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    const handleAuthAction = async () => {
      const mode = searchParams.get("mode");
      const oobCode = searchParams.get("oobCode");

      if (!mode || !oobCode) {
        setStatus("error");
        setMessage("Invalid or missing verification link parameters.");
        return;
      }

      try {
        // Check what type of action this is
        const info = await checkActionCode(auth, oobCode);
        setActionType(mode);

        switch (mode) {
          case "verifyEmail":
            // Apply the email verification code
            await applyActionCode(auth, oobCode);
            setStatus("success");
            setMessage("Email verified successfully! You can now log in with your new email address.");
            
            // Update the email in Firestore via backend
            if (info.data.email) {
              try {
                const currentUser = auth.currentUser;
                if (currentUser) {
                  // Update Firestore with the new verified email
                  await fetch(
                    `http://localhost:8000/auth/staff/${encodeURIComponent(info.data.email)}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: info.data.email,
                      }),
                    }
                  );
                }
              } catch (updateError) {
                console.error("Failed to update email in database:", updateError);
                // Don't show error to user since email is verified in Firebase
              }
            }
            break;

          case "verifyAndChangeEmail":
            // Apply the email change verification code
            await applyActionCode(auth, oobCode);
            
            // Update the email in backend database
            if (info.data.email) {
              try {
                const newEmail = info.data.email;
                
                // Try to get the old email from localStorage (we'll store it when changing email)
                const oldEmail = localStorage.getItem('emailChangeOldEmail');
                
                if (oldEmail) {
                  // First, fetch the current user data
                  const getUserResponse = await fetch(
                    `http://localhost:8000/auth/staff/${encodeURIComponent(oldEmail)}`
                  );
                  
                  if (getUserResponse.ok) {
                    const userData = await getUserResponse.json();
                    
                    // Now update with all required fields
                    const updateResponse = await fetch(
                      `http://localhost:8000/auth/staff/${encodeURIComponent(oldEmail)}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          firstName: userData.firstName,
                          lastName: userData.lastName,
                          email: newEmail,
                          role: userData.role,
                          active: userData.active,
                        }),
                      }
                    );
                    
                    if (updateResponse.ok) {
                      // Clear the stored old email
                      localStorage.removeItem('emailChangeOldEmail');
                    } else {
                      console.error("Backend update failed:", await updateResponse.text());
                    }
                  } else {
                    console.error("Could not fetch user data:", await getUserResponse.text());
                  }
                } else {
                  console.error("Could not find old email to update backend");
                }
              } catch (updateError) {
                console.error("Failed to update email in database:", updateError);
              }
            }
            
            setStatus("success");
            setMessage("Email changed successfully! You can now log in with your new email address.");
            break;

          case "resetPassword":
            // Redirect to password reset page with the code
            router.push(`/reset-password?oobCode=${oobCode}`);
            return;

          case "recoverEmail":
            await applyActionCode(auth, oobCode);
            setStatus("success");
            setMessage("Email address has been recovered successfully.");
            break;

          default:
            setStatus("error");
            setMessage(`Unknown action type: ${mode}`);
        }
      } catch (error) {
        console.error("Auth action error:", error);
        setStatus("error");
        
        if (error.code === "auth/invalid-action-code") {
          setMessage("This verification link has expired or has already been used.");
        } else if (error.code === "auth/expired-action-code") {
          setMessage("This verification link has expired. Please request a new one.");
        } else {
          setMessage(`Verification failed: ${error.message}`);
        }
      }
    };

    handleAuthAction();
  }, [searchParams, router]);

  return (
    <main
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      style={{ fontFamily: "var(--font-titillium)" }}
    >
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        {status === "processing" && (
          <>
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-12 w-12 text-[#005EB8]"
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
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Processing...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your request.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <svg
                className="h-16 w-16 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Success!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-[#005EB8] text-white font-semibold rounded-lg hover:bg-[#004080] transition"
              >
                Go to Login
              </Link>
              <Link
                href="/profile"
                className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Go to Profile
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <svg
                className="h-16 w-16 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/profile"
                className="inline-block px-6 py-3 bg-[#005EB8] text-white font-semibold rounded-lg hover:bg-[#004080] transition"
              >
                Back to Profile
              </Link>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
          style={{ fontFamily: "var(--font-titillium)" }}
        >
          <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-12 w-12 text-[#005EB8]"
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
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h1>
            <p className="text-gray-600">Please wait</p>
          </div>
        </main>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}
