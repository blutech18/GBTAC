"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../_utils/firebase";

export default function AdminHomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Home</h1>
      <p>Test navigation to admin pages:</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
        <button onClick={() => router.push("/account-manager")}>
          Go to Account Manager
        </button>

        <button onClick={() => router.push("/create-staff")}>
          Go to Create Staff
        </button>

        <button onClick={() => router.push("/dashboard-manager")}>
          Go to Dashboard Manager
        </button>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "30px",
          padding: "10px 20px",
          backgroundColor: "#005EB8",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}