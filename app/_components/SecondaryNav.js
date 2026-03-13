"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../_utils/firebase";

export default function SecondaryNav({
  displayLogin = true,
  displayLogout = false,
  displayProfile = false,
}) {
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState("Temiloluwa Bankole");

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
      <div
        className="relative w-[180px] sm:w-[220px] md:w-[253px] h-[46px]
      "
      >
        <Link href="https://www.sait.ca">
          <Image
            src="/sait_extended_horizontal_full_colour_rgb.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </Link>
      </div>

      <ul className="flex space-x-8 text-white">
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
          <li>
            <Link
              href="/home"
              onClick={handleLogout}
              className="px-6 py-2 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition inline-block text-center"
            >
              Logout
            </Link>
          </li>
        )}
        {displayProfile && (
          <li className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition flex flex-row items-center gap-2">
            <Link href="/profile" className="hover:opacity-80 transition">
              <Image
                src="/icons/profile.png"
                alt="Profile"
                width={24}
                height={24}
              />
            </Link>
            <Link href="/profile" className="hover:opacity-80 transition">
              {employeeName}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
