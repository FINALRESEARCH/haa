"use client";

import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";
import ArrowUpRight from "../ArrowUpRight";

// The hero pins for this many viewport heights while the mark sweeps across.
const HERO_SCROLL_VH = 1.2;

// How far the mark sits on screen at rest, as a share of its own width.
const REST_DESKTOP = 88;
const REST_MOBILE = 58;
const restShare = () => (window.innerWidth < 640 ? REST_MOBILE : REST_DESKTOP);

export default function HeroV1({ id, content }: VariantProps<"hero">) {
  const { markPath } = content;
  const markRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mark = markRef.current;
    const copy = copyRef.current;
    if (!mark || !copy) return;

    // On load the mark slides off the right, then comes back around from the
    // left to its resting position. `introX` is that offset in pixels.
    let introX = 0;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const distance = window.innerHeight * HERO_SCROLL_VH;
      const p = Math.min(Math.max(window.scrollY / distance, 0), 1);

      // The mark sweeps left off the screen and grows as it goes.
      const travel = mark.offsetWidth * 1.35 + window.innerWidth;
      const x = introX - p * travel;
      mark.style.transform = `translate3d(calc(-${restShare()}% + ${x}px),-50%,0) scale(${1 + p * 0.35})`;

      // The copy holds, then fades out as the sweep finishes.
      copy.style.opacity = `${1 - Math.min(Math.max((p - 0.55) / 0.35, 0), 1)}`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();

    // Play that entrance once, then leave the mark to the scroll position.
    const EXIT = 900;
    const RETURN = 1500;
    let introFrame = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      const width = mark.offsetWidth;
      // Clears the right edge, and far enough left to be fully off screen.
      const offRight = (restShare() / 100) * width;
      const offLeft = -(window.innerWidth + width * (1 - restShare() / 100));

      if (elapsed < EXIT) {
        const t = elapsed / EXIT;
        introX =
          offRight * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      } else {
        const t = Math.min((elapsed - EXIT) / RETURN, 1);
        introX = offLeft * Math.pow(1 - t, 3);
      }
      apply();
      if (elapsed < EXIT + RETURN) introFrame = requestAnimationFrame(step);
    };
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      introFrame = requestAnimationFrame(step);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (introFrame) cancelAnimationFrame(introFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div id={id} style={{ height: `${100 + HERO_SCROLL_VH * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            ref={markRef}
            // Starts off-screen right so the first paint matches the entrance.
            style={{ transform: "translate3d(0,-50%,0)" }}
            className="absolute top-1/2 left-full h-[230vw] w-[451vw] origin-left will-change-transform sm:h-[150vh] sm:w-[295vh]"
          >
            <svg
              viewBox="0 0 53 27"
              preserveAspectRatio="none"
              className="h-full w-full"
              fill="var(--brand)"
            >
              <path d={markPath} />
            </svg>
          </div>
        </div>

        <div
          ref={copyRef}
          className="relative flex h-full flex-col will-change-[opacity]"
        >
          <section className="flex flex-1 items-start justify-center px-6 pt-[300px] pb-10 sm:items-center sm:pt-40 sm:pb-16">
            <h1 className="w-[min(1200px,92vw)] text-[clamp(2.25rem,10vw,5.5rem)] leading-[1.06] font-medium tracking-[-0.035em] sm:text-center sm:text-[clamp(2.5rem,4.9vw,5.5rem)] sm:leading-[1.02]">
              {content.headline}
            </h1>
          </section>
          <section
            id="apply"
            className="flex flex-col items-center gap-10 px-6 pb-16 sm:gap-6 sm:text-center"
          >
            <p className="w-full max-w-[62ch] text-[15px] leading-[1.5] text-foreground/80 sm:text-[14px] sm:leading-[1.6]">
              {content.body}
            </p>
            <a
              href={content.cta.href}
              className="label label-button inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-3.5 text-white ring-2 ring-background transition-opacity duration-300 ease-out hover:opacity-60"
            >
              {content.cta.label}
              <ArrowUpRight />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
