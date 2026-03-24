import Image from "next/image";
export default function Footer() {
  return (
    <div className="w-full bg-[#6D2077] border-t border-[#6D2077] flex flex-row justify-between items-center gap-5 px-4 py-3 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
      <div className="text-[#F1FAF5] text-xs md:text-lg">
        <p>{new Date().getFullYear()}. Capstone Project for GBTAC, SAIT.</p>
      </div>
      <div className="relative w-[150px] sm:w-[170px] md:w-[200px] lg:w-[250px] h-[50px]">
        <Image
          src="/sait_extended_horizontal_reverse.png"
          alt="Logo"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}
