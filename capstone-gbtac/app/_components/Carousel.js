"use client";

import { useState, useEffect } from "react";
import InfoCard from "./InfoCard";
import Image from "next/image";

/**
 * Carousel component
 *
 * Displays items as paginated cards, showing one card on mobile and
 * two side-by-side on md+ screens. Navigation is via prev/next arrow
 * buttons and clickable indicator dots.
 *
 * @param {Array} items - List of items to render inside InfoCard
 * @param {boolean} horizontal - Passed through to InfoCard to control its layout
 *
 * Notes:
 * - Wraps around on both ends
 * - On md+ screens, two cards are shown; index advances by 1 but both slots update
 * - Indicator dots reflect the active index, not the full visible range
 *
 * @returns A paginated card carousel with dot indicators
 *
 * @author Cintya Lara Flores
 */

export default function Carousel({ items = [], horizontal, maxVisible = 2 }) {
  const [index, setIndex] = useState(0);
  const [isLarge, setIsLarge] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );

  const [isMedium, setIsMedium] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsLarge(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsMedium(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const visibleCount = isLarge ? maxVisible : isMedium ? 2 : 1;
  const step = visibleCount;

  // Bail out early — modulo on 0 would produce NaN and break navigation
  if (items.length === 0) return null;

  const next = () => {
    setIndex((prev) => (prev + step) % items.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - step + items.length) % items.length);
  };

  const cardClass = "w-[300px]";

  return (
    <div className="relative w-full">
      <div className="flex justify-center gap-4">
        {items[index] && (
          <div className={cardClass}>
            <InfoCard items={[items[index]]} horizontal={horizontal} />
          </div>
        )}
        {items[index + 1] && (
          <div className={`${cardClass} hidden md:block`}>
            <InfoCard items={[items[index + 1]]} horizontal={horizontal} />
          </div>
        )}
        {maxVisible >= 3 && items[index + 2] && (
          <div className="w-[300px] hidden lg:block">
            <InfoCard items={[items[index + 2]]} horizontal={horizontal} />
          </div>
        )}
      </div>

      {/* Dot indicators — one per item, active dot reflects current index */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(items.length / step) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i * step)}
            className={`w-3 h-3 rounded-full ${
              Math.floor(index / step) === i ? "bg-[#4D0B5C]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

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
