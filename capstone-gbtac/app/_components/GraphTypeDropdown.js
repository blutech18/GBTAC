//This component is a dropdown menu for selecting graph types on the dashboard.
//It is used in teh Guest and Admin views.

"use client"

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const GRAPH_TYPES = [
  "Water Level",
  "Energy",
  "Ambient Temperature",
  "Wall Temperature",
  "Natural Gas",
];

export default function GraphTypeDropdown({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="px-4 py-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm inline-flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        Select a Graph Type{" "}
        <Image src="/icons/arrow-down.png" alt="chevron" width={15} height={15} />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white z-10">
          <ul role="menu">
            {GRAPH_TYPES.map((type) => (
              <li key={type}>
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => { onSelect?.(type); setIsOpen(false); }}
                >
                  {type}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}