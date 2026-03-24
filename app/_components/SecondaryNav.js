"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../_utils/firebase";

export default function SecondaryNav({
  displayLogin = true,
  displayLogout = false,
  displayProfile = false,
}) {
  const router = useRouter();
  const [employeeFirstName, setEmployeeFirstName] = useState("");
  const [employeeLastName, setEmployeeLastName] = useState("");
  const [user, setUser] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser?.email) {
        try {
          const response = await fetch(
            `http://localhost:8000/auth/staff/${encodeURIComponent(currentUser.email)}`
          );
          if (response.ok) {
            const data = await response.json();
            const firstName = data.firstName || "";
            const lastName = data.lastName || "";
            setEmployeeFirstName(firstName);
            setEmployeeLastName(lastName);
            setUser(`${firstName} ${lastName}`);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      } else {
        setEmployeeFirstName("");
        setEmployeeLastName("");
        setUser("");
      }
    });

    return () => unsubscribe();
  }, []);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
      router.refresh();
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  };

  return (
    <nav className="flex flex-row items-center justify-between w-full bg-[#fdfdfd] p-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
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

      <ul className="flex space-x-4 text-white">
        {displayLogin && (
          <li>
            <Link
              href="/login"
              className="px-6 py-2 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition inline-block text-center"
            >
              Login
            </Link>
          </li>
        )}
        {displayLogout && (
          <li className="items-center gap-5 lg:gap-2">
            <Link
              href="/"
              onClick={handleLogout}
              className="px-6 py-2 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition inline-block text-center"
            >
              Logout
            </Link>
          </li>
        )}
        {displayProfile && (
          <li className=" text-gray-800 hover:text-gray-600 transition flex flex-row items-center gap-2">
            <Link
              href="/profile"
              className="shrink-0 hover:opacity-80 transition border border-red-800 bg-white rounded-full text-red-800 px-2 py-2"
            >
              {employeeFirstName.charAt(0).toUpperCase()}{" "}
              {employeeLastName.charAt(0).toUpperCase()}
            </Link>
            <Link
              href="/profile"
              className="hidden hover:opacity-80 transition text-xs md:block sm:text-sm lg:text-base font-semibold"
            >
              {user}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
