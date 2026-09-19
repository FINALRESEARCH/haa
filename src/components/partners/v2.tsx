"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { VariantProps } from "@/variants/types";

/** Between one mark lighting up and the next. Fast enough to read as one gesture. */
const STEP_MS = 60;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Tracks the preference live, and reads `false` on the server. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * All ten logos held still in two rows of five, edge to edge, in normal page
 * flow rather than pinned. The grid draws its own rules: a 1px gap over a
 * tinted backing shows through as hairlines between cells, which keeps the
 * lines correct at every column count without per-cell border juggling.
 *
 * Scrolling the section into view fades each mark in individually, a beat
 * apart, and then everything holds — a flicker of movement without a carousel.
 */
export default function PartnersV2({ id, content }: VariantProps<"partners">) {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrolledTo, setScrolledTo] = useState(false);
  const still = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setScrolledTo(true),
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Anyone who has asked not to see motion gets the grid already in place.
  const shown = scrolledTo || still;

  return (
    <section
      ref={sectionRef}
      id={id}
      className="flex flex-col items-center gap-[10vh] bg-background py-[18vh]"
    >
      <div className="w-[min(1000px,92vw)]">
        <h2 className="px-6 text-center text-[clamp(1.5rem,3.45vw,3.9rem)] leading-[1.05] font-medium tracking-[-0.035em]">
          {content.heading}
        </h2>
        <p className="mx-auto mt-5 max-w-[56ch] px-6 text-center text-[clamp(0.9rem,1.1vw,1.05rem)] leading-[1.5] tracking-[-0.01em] text-foreground/75">
          {content.body}
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-px border-y border-foreground/10 bg-foreground/10 lg:grid-cols-5">
        {content.logos.map(({ src, name, scale }, i) => (
          <div
            key={src}
            className="flex min-h-[clamp(110px,15vh,190px)] items-center justify-center bg-background px-4 sm:px-5"
          >
            <Image
              src={src}
              alt={name}
              width={340}
              height={68}
              // The lockups run from 2.4:1 to 8.9:1, so `scale` carries an
              // equal-area correction (see `src/data/partners.ts`) on top of
              // this base height. `max-w-full` is what keeps the longest marks
              // — Anthropic's especially — from overflowing a narrow cell:
              // the mark loses a little height instead of being clipped.
              style={{
                height: `calc(clamp(22px, 2.5vw, 36px) * ${scale})`,
                transitionDelay: shown && !still ? `${i * STEP_MS}ms` : "0ms",
              }}
              className={`w-auto max-w-full object-contain [filter:brightness(0)] ${
                still ? "" : "transition-opacity duration-300 ease-out"
              } ${shown ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
