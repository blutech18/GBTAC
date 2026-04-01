"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "../_utils/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * SecondaryNav component
 *
 * Top navigation bar displaying the SAIT logo and user session controls.
 * Shows a Login button when unauthenticated, and a Logout button with
 * a profile avatar/name link when authenticated.
 *
 * Auth state is derived from Firebase onAuthStateChanged. User display
 * name is fetched from Firestore under the `allowedUsers` collection.
 *
 * Notes:
 * - Login is rendered as a styled <Link>; Logout as a <button> (intentional)
 * - Avatar displays first and last initials; full name shown on md+ screens
 *
 * @returns A responsive top navigation bar
 *
 * @author Frontend Developer: [Cintya Lara Flores]
 * @author Dominique Lee
 */

export default function SecondaryNav() {
  // Router for navigation after logout
  const router = useRouter();
  // Local state for user info and auth status
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const displayName = [firstName, lastName].filter(Boolean).join(" ");

  // Initial auth check on component mount; listens for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // If user is logged in
        setIsLoggedIn(true);
        // Fetch display name from Firestore allowedUsers collection
        const userDoc = doc(db, "allowedUsers", user.email);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
        } else {
          // User is authenticated but has no Firestore record — log for debugging
          console.warn("No Firestore document found for user:", user.email);
        }
      } else {
        // If user is not logged in
        setIsLoggedIn(false);
        setFirstName("");
        setLastName("");
      }
    });

    // Listen for profile updates
    const handleProfileUpdate = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, "allowedUsers", user.email);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
        }
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // Handles logout by invalidating server session and signing out of Firebase
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      await signOut(auth);
      router.push("/");
      router.refresh();
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  };

  return (
    <nav className="flex flex-row items-center-safe justify-between w-full bg-[#fdfdfd] p-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
      <div className="relative w-[60px] sm:w-[75px] md:w-[80px] h-[45px] ms-0 lg:me-1">
        <Link href="https://www.sait.ca">
          <Image
            src="/collegiate_logo_red2.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </Link>
      </div>
      {/* User session controls — Login button when not authenticated, Logout + profile link when authenticated */}
      <ul className="font-heading flex space-x-4 text-white items-center-safe">
        {!isLoggedIn && (
          // Login button styled as a primary call-to-action with blue background and hover effect
          <li>
            <Link
              href="/login"
              className="px-6 py-2 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition inline-block text-center"
            >
              Login
            </Link>
          </li>
        )}

        {isLoggedIn && (
          <>
            <li>
              {/* Logout button styled as a primary call-to-action with blue background and hover effect */}
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-[#005EB8] lg:text-lg text-white rounded-sm hover:bg-[#004080] font-bold transition inline-block text-center"
              >
                Logout
              </button>
            </li>
            {/* Avatar and name, both link to profile page */}
            <li className="text-gray-800 hover:text-gray-600 transition flex flex-row items-center gap-2">
              {/* Initials avatar */}
              <Link
                href="/profile"
                className="w-8 h-8 flex items-center justify-center shrink-0 hover:opacity-80 transition border border-red-800 bg-white rounded-full text-red-800 text-sm font-bold"
              >
                {firstName.charAt(0).toUpperCase()}
                {lastName.charAt(0).toUpperCase()}
              </Link>
              {/* Full name, hidden on small screens */}
              <Link
                href="/profile"
                className="hidden hover:opacity-80 transition text-xs md:block sm:text-sm lg:text-base font-semibold"
              >
                {displayName}
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
