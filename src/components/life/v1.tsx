"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/** How far through `[a, b]` the overall progress `p` has travelled, 0 → 1. */
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/**
 * The plate rises out of the fold and locks at the vertical centre. The
 * heading follows it up from the bottom of the screen and locks at the same
 * centre line, in `mix-blend-difference` white: near-black over the page, a
 * straight inversion over the photograph. The plate fades out from under it,
 * then the copy rises into the space below.
 *
 * All four beats are cut from one scroll progress value rather than four
 * observers, so they can overlap — the heading is already climbing while the
 * plate is still fading.
 *
 * The plate is an `<Image>` today and may become a `<video>` later; nothing
 * below depends on which, only on the box keeping its aspect ratio.
 */
export default function LifeV1({ id, content }: VariantProps<"life">) {
  const trackRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const plate = plateRef.current;
    const heading = headingRef.current;
    const body = bodyRef.current;
    if (!track || !plate || !heading || !body) return;

    // Reduced motion gets the end state of every beat and no scroll listener.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    const apply = () => {
      frame = 0;
      const vh = window.innerHeight;

      if (still.matches) {
        plate.style.transform = "translate3d(0,0,0)";
        plate.style.opacity = "1";
        heading.style.transform = "translate3d(0,0,0)";
        heading.style.opacity = "1";
        body.style.transform = "translate3d(0,0,0)";
        body.style.opacity = "1";
        return;
      }

      const { top, height } = track.getBoundingClientRect();
      // `height - vh` is the sticky stage's travel: the scroll distance
      // between the stage pinning and unpinning.
      const p = clamp(-top / Math.max(height - vh, 1));

      const plateRise = range(p, 0, 0.2);
      const plateGone = range(p, 0.34, 0.56);
      const headingRise = range(p, 0.28, 0.54);
      const bodyRise = range(p, 0.62, 0.84);

      plate.style.transform = `translate3d(0, ${(1 - plateRise) * 58}vh, 0)`;
      plate.style.opacity = `${range(p, 0, 0.05) * (1 - plateGone)}`;

      heading.style.transform = `translate3d(0, ${(1 - headingRise) * 64}vh, 0)`;
      // Nudged off zero so the line never flickers in at full strength.
      heading.style.opacity = `${range(p, 0.28, 0.34)}`;

      body.style.transform = `translate3d(0, ${(1 - bodyRise) * 24}vh, 0)`;
      body.style.opacity = `${bodyRise}`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    still.addEventListener("change", apply);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      still.removeEventListener("change", apply);
    };
  }, []);

  return (
    <div ref={trackRef} id={id} className="h-[400vh] bg-background">
      {/* `isolate` keeps the difference blend inside this screen: the heading
          inverts the plate and the page ground, not the section above it. */}
      <section className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-background [isolation:isolate]">
        <div
          ref={plateRef}
          className="absolute w-[min(1060px,78vw)] opacity-0 will-change-[transform,opacity]"
        >
          <div className="relative aspect-[3/2] overflow-hidden rounded-[18px] bg-foreground/5">
            <Image
              src={content.image.src}
              alt={content.image.alt}
              fill
              sizes="(max-width: 768px) 78vw, 1060px"
              className="object-cover"
            />
          </div>
        </div>

        <h2
          ref={headingRef}
          className="pointer-events-none absolute w-[min(1100px,88vw)] text-center text-[clamp(2rem,6vw,5.5rem)] font-medium leading-[1] tracking-[-0.04em] text-white opacity-0 mix-blend-difference will-change-[transform,opacity]"
        >
          {content.heading}
        </h2>

        {/* Sits in the half below the locked heading and rises into it. */}
        <div
          ref={bodyRef}
          className="absolute inset-x-0 top-[58%] flex flex-col items-center gap-7 px-6 opacity-0 will-change-[transform,opacity]"
        >
          <div className="w-[min(680px,88vw)] space-y-4 text-center text-[clamp(0.95rem,1.35vw,1.2rem)] leading-[1.45] tracking-[-0.01em]">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <a
            href={content.cta.href}
            className="label inline-flex items-center gap-2 text-brand"
          >
            {content.cta.label} <span aria-hidden>→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
