"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from "@/app/_utils/firebase";

function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("");

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
        const info = await checkActionCode(auth, oobCode);

        switch (mode) {
          case "verifyEmail":
            await applyActionCode(auth, oobCode);
            setStatus("success");
            setMessage("Email verified successfully! You can now log in with your new email address.");
            
            if (info.data.email) {
              try {
                const currentUser = auth.currentUser;
                if (currentUser) {
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
              }
            }
            break;

          case "verifyAndChangeEmail":
            await applyActionCode(auth, oobCode);
            
            if (info.data.email) {
              try {
                const newEmail = info.data.email;
                const oldEmail = localStorage.getItem('emailChangeOldEmail');
                
                if (oldEmail) {
                  // Call backend to update Firestore (backend has admin privileges)
                  const updateResponse = await fetch(
                    `http://localhost:8000/auth/update-email`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        oldEmail: oldEmail,
                        newEmail: newEmail
                      }),
                    }
                  );
                  
                  if (updateResponse.ok) {
                    const result = await updateResponse.json();
                    localStorage.removeItem('emailChangeOldEmail');
                    console.log("Firestore email updated successfully:", result);
                  } else {
                    const errorText = await updateResponse.text();
                    console.error("Failed to update email in Firestore:", errorText);
                    setStatus("error");
                    setMessage("Email verification succeeded, but failed to update your profile. Please contact support.");
                    return;
                  }
                } else {
                  console.error("Old email not found in localStorage");
                  setStatus("error");
                  setMessage("Email verification succeeded, but failed to update your profile. Please contact support.");
                  return;
                }
              } catch (updateError) {
                console.error("Failed to update email in Firestore:", updateError);
                setStatus("error");
                setMessage("Email verification succeeded, but failed to update your profile. Please contact support.");
                return;
              }
            }
            
            // Sign out user after Firestore update
            try {
              await auth.signOut();
              console.log("User signed out successfully");
            } catch (signOutError) {
              console.error("Failed to sign out:", signOutError);
            }
            
            setStatus("success");
            setMessage("Email changed successfully! Please log in with your new email address: " + info.data.email);
            break;

          case "resetPassword":
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
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-block px-6 py-3 bg-[#005EB8] text-white font-semibold rounded-lg hover:bg-[#004080] transition cursor-pointer"
            >
              Go to Login
            </button>
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
            <button
              onClick={() => window.location.href = '/login'}
              className="inline-block px-6 py-3 bg-[#005EB8] text-white font-semibold rounded-lg hover:bg-[#004080] transition cursor-pointer"
            >
              Go to Login
            </button>
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
