"use client";
import Image from "next/image";
import { FaLinkedin, FaGithub, FaWrench } from "react-icons/fa";
import DevCardModal from "./DevCardModal";
import { useState } from "react";

export default function DevCard({
  name,
  role,
  bio,
  image,
  linkedin,
  github,
  contributions,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col">
        {/* PHOTO — overlaps the card below */}
        <div className="flex justify-center z-10">
          <div className="relative w-40 h-50 overflow-hidden ring-2 ring-[#00A3E0]  shadow-md shrink-0">
            <Image
              src={image}
              alt={name}
              fill
              style={{ objectFit: "cover" }}
              className="p-2 "
            />
          </div>
        </div>

        {/* CARD */}
        <div className="relative bg-white/80 backdrop-blur-sm shadow-md overflow-hidden flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300 -mt-12 px-6 pb-6">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]" />
          </div>

          {/* Name & Role */}
          <div className="flex flex-col items-center gap-1 pt-14 pb-4 w-full border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            <span className="text-md font-semibold font-mono text-[#005EB8]/75 uppercase tracking-wide">
              {role}
            </span>
          </div>

          {/* Bio */}
          <p className="text-md text-gray-500 leading-relaxed text-center py-4 mb-5">
            {bio}
          </p>

          {/* Contributions Button */}
          {contributions && contributions.length > 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#005EB8]/20 hover:bg-[#005EB8]/30 transition-colors duration-200 mb-5"
            >
              <FaWrench size={13} className="text-[#005EB8]" />
              <span className="text-xs font-semibold text-[#005EB8] uppercase tracking-wider">
                Project Contributions
              </span>
            </button>
          )}

          {/* Links */}
          <div className="flex gap-3">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#005EB8] transition-colors"
              >
                <FaLinkedin size={35} />
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <FaGithub size={35} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {/* MODAL */}
      <DevCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        name={name}
        role={role}
        image={image}
        contributions={contributions}
      />
    </>
  );
}
