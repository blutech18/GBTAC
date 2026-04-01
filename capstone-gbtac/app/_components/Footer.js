"use client";
import Image from "next/image";
/**
 * Footer component
 *
 * Displays a full-width footer with a dynamic year and the SAIT logo.
 *
 * Notes:
 * - Marked as client component to avoid hydration mismatch from new Date()
 * - Uses semantic <footer> element for accessibility and SEO
 *
 * @returns A responsive footer bar
 *
 * @author Cintya Lara Flores
 */
export default function Footer() {
  return (
    <footer className="w-full bg-[#6D2077] border-t flex justify-between items-center gap-5 px-4 py-3 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
      <div className="text-[#F1FAF5] text-xs md:text-lg">
        <p>{new Date().getFullYear()}. Capstone Project for GBTAC, SAIT.</p>
      </div>
      <div className="relative w-[60px] sm:w-[65px] md:w-[70px] lg:w-[75px] h-[42px]">
        <Image
          src="/collegiate_logo_white2.png"
          alt="Logo"
          fill
          className="object-contain"
        />
      </div>
    </footer>
  );
}
