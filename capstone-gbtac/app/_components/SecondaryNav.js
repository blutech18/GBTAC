"use client";

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); 
      router.refresh();
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  };

  const employeeName = "John Doe"; // Placeholder for actual employee name
  return (
    <nav className="flex flex-row items-center justify-between w-full bg-white py-3 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
      <div>
        <Link href="https://www.sait.ca">
          <Image
            src="/sait_extended_horizontal_full_colour_rgb.png"
            alt="Logo"
            height={50}
            width={131}
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
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-[#005EB8] text-white rounded-sm hover:bg-[#004080] font-bold transition"
            >
              Logout
            </button>
          </li>
        )}
        {displayProfile && (
          <li className="py-2 text-2xl font-semibold text-gray-800 hover:text-gray-600 transition">
            <Link href="/profile" className="hover:opacity-80 transition">
              {employeeName}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
