"use client";

import { useState } from "react";
import InfoCard from "./InfoCard";
import Image from "next/image";

export default function Carousel({ items = [], horizontal }) {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="relative w-full">
      {/* Cards */}
      <div className="flex justify-center gap-4">
        {/* Card 1 (always visible) */}
        {items[index] && (
          <div className="w-[300px]">
            <InfoCard items={[items[index]]} horizontal={horizontal} />
          </div>
        )}

        {/* Card 2 (hidden on very small screens) */}
        {items[index + 1] && (
          <div className="w-[300px] hidden md:block">
            <InfoCard items={[items[index + 1]]} horizontal={horizontal} />
          </div>
        )}
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-[#4D0B5C]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Prev */}
      <button
        onClick={prev}
        className="absolute top-1/2 left-0 -translate-y-1/2 px-4"
      >
        <Image
          src="/icons/arrow-circle-left.png"
          alt="Previous"
          width={24}
          height={24}
        />
      </button>

      {/* Next */}
      <button
        onClick={next}
        className="absolute top-1/2 right-0 -translate-y-1/2 px-4"
      >
        <Image
          src="/icons/arrow-circle-right.png"
          alt="Next"
          width={24}
          height={24}
        />
      </button>
    </div>
  );
}
