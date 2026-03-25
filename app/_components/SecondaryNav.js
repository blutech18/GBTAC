"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "../_utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function SecondaryNav() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = `${firstName} ${lastName}`;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // user is logged in
        setIsLoggedIn(true);

        // fetch Firestore user info
        const userDoc = doc(db, "allowedUsers", user.email);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
        } else {
          console.log("No user document found!");
        }
      } else {
        // user is not logged in
        setIsLoggedIn(false);
        setFirstName("");
        setLastName("");
      }
    });

    return () => unsubscribe();
  }, []);


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
      <div className="relative w-[180px] sm:w-[220px] md:w-[253px] h-[46px] me-5 lg:me-1">
        <Link href="https://www.sait.ca">
          <Image
            src="/sait_extended_horizontal_full_colour_rgb.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </Link>
      </div>

      <ul className="font-heading flex space-x-4 text-white items-center-safe">
        {!isLoggedIn && (
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
            <li className="items-center gap-5 lg:gap-2">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-[#005EB8] font-heading lg:text-lg text-white rounded-sm hover:bg-[#004080] font-bold transition inline-block text-center"
              >
                Logout
              </button>
            </li>

            <li className="text-gray-800 hover:text-gray-600 transition flex flex-row items-center gap-2">
              <Link
                href="/profile"
                className="shrink-0 hover:opacity-80 transition border border-red-800 bg-white rounded-full text-red-800 px-2 py-2"
              >
                {firstName?.charAt(0)?.toUpperCase()}{" "}
                {lastName?.charAt(0)?.toUpperCase()}
              </Link>
              <Link
                href="/profile"
                className="hidden hover:opacity-80 transition text-xs md:block sm:text-sm lg:text-base font-semibold"
              >
                {user}
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
