import Image from "next/image";
export default function Footer() {
  return (
    <div className="w-full bg-[#6D2077] border-t border-[#6D2077] flex flex-row justify-between items-center py-3 xs:px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
      <div className="text-[#F1FAF5] shrink">
        <p>{new Date().getFullYear()}. Capstone Project for GBTAC, SAIT.</p>
      </div>
      <div className="shrink object-scale-down">
        <Image
          src="/sait_extended_horizontal_reverse.png"
          alt="Logo"
          width={200}
          height={100}
        />
      </div>
    </div>
  );
}
