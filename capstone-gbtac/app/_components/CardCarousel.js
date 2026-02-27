"use client";

import { useState, useEffect } from "react";
import InfoCard from "./InfoCard";

export default function CardCarousel({ items }) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  const CARD_WIDTH = 300; // match InfoCard width
  const GAP = 24; // Tailwind mr-6

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const cards = Math.floor(screenWidth / (CARD_WIDTH + GAP));
      setVisibleCards(cards > 0 ? cards : 1);

      // adjust scrollIndex if necessary
      setScrollIndex((prev) =>
        Math.min(prev, Math.max(0, Math.ceil(items.length / cards) - 1)),
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [items.length]);

  // Scroll by “page” of visible cards
  const maxIndex = Math.max(0, Math.ceil(items.length / visibleCards) - 1);

  const handlePrev = () => setScrollIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setScrollIndex((prev) => Math.min(prev + 1, maxIndex));

  return (
    <div className="relative w-full">
      {/* Prev/Next Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 px-3 py-2 bg-gray-200 rounded-full shadow hover:bg-gray-300 disabled:opacity-50"
        disabled={scrollIndex === 0}
      >
        &#8592;
      </button>
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 px-3 py-2 bg-gray-200 rounded-full shadow hover:bg-gray-300 disabled:opacity-50"
        disabled={scrollIndex === maxIndex}
      >
        &#8594;
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300"
          style={{
            transform: `translateX(-${scrollIndex * visibleCards * (CARD_WIDTH + GAP)}px)`,
          }}
        >
          {items.map((item, i) => (
            <div key={i} className="flex-none w-[300px] mr-6">
              <InfoCard items={[item]} horizontal />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
