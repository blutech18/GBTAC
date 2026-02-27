import Image from "next/image";
export default function Footer() {
  return (
    <div className="w-full bg-[#6D2077] border-t border-[#6D2077] flex flex-row items-center justify-between py-3 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
      <div>
        {" "}
        <Image
          src="/sait_extended_horizontal_reverse.png"
          alt="Logo"
          width={200}
          height={100}
        />
      </div>

      <p className="text-right text-[#F1FAF5] ">
        {new Date().getFullYear()}. Capstone Project for GBTAC, SAIT.
      </p>
    </div>
  );
}
