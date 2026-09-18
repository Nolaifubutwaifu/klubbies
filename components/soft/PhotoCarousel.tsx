"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/soft/icons";

export type Slide = {
  /** Optional file under /public. A missing file just leaves the gradient. */
  src?: string;
  title: string;
  caption: string;
  /** Fallback gradient, also the colour behind a photo while it loads. */
  tint: string;
};

const INTERVAL = 5000;

/**
 * Cross-fading banner of club nights. Runs on its own every 5s, pausing only
 * for keyboard focus and for visitors who prefer reduced motion.
 */
export function PhotoCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || reduced.current || slides.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const go = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <div
      className="relative"
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="soft-card relative aspect-[16/10] w-full overflow-hidden !p-0 sm:aspect-[21/9]"
        aria-roledescription="carousel"
        aria-label="Nights that ended up in a club album"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            className="soft-slide"
            data-active={i === index}
            aria-hidden={i !== index}
            style={{
              background: slide.src ? `url(${slide.src}) center/cover no-repeat, ${slide.tint}` : slide.tint,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(25,18,22,0.8)] via-[rgba(25,18,22,0.12)] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 sm:p-8">
              <span className="soft-chip bg-white/90">{slide.caption}</span>
              <span className="soft-display text-[clamp(24px,4vw,40px)] text-white">{slide.title}</span>
            </div>
          </div>
        ))}

        <div className="absolute right-4 top-4 flex gap-2">
          <button type="button" className="soft-btn soft-btn-tonal !min-h-[40px] !w-10 !p-0" onClick={() => go(index - 1)} aria-label="Previous slide">
            <ChevronLeftIcon />
          </button>
          <button type="button" className="soft-btn soft-btn-tonal !min-h-[40px] !w-10 !p-0" onClick={() => go(index + 1)} aria-label="Next slide">
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            className="soft-dot"
            aria-current={i === index}
            aria-label={`Show ${slide.title}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
