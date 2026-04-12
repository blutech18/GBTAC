import Image from "next/image";
import { FaWrench, FaTimes } from "react-icons/fa";

/**
 * DevCardModal component
 *
 * Displays a dev team member's project contributions in a modal dialog.
 * Uses a fixed overlay to cover the full page.
 *
 * @param {boolean} isOpen - Controls visibility
 * @param {Function} onClose - Called when the user closes the modal
 * @param {string} name - Developer's name
 * @param {string} role - Developer's role
 * @param {string} image - Developer's profile image path
 * @param {string[]} contributions - List of project contributions
 *
 * @returns A full-page modal with the developer's contributions
 */
export default function DevCardModal({
  isOpen,
  onClose,
  name,
  role,
  image,
  contributions,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#E5AFF5] shrink-0">
              <Image
                src={image}
                alt={name}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-gray-900">{name}</h4>
              <p className="text-xs text-[#005EB8]/75 font-mono uppercase">
                {role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <FaWrench size={13} className="text-[#005EB8]" />
            <span className="text-sm font-semibold text-[#005EB8] uppercase tracking-wider">
              Project Contributions
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {contributions.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600 border border-gray-100 rounded-lg px-4 py-2.5"
              >
                <span className="text-[#005EB8] mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-medium text-white bg-[#005EB8] hover:bg-[#005EB8]/80 transition-colors px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
