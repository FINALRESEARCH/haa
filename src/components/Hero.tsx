"use client";

import { useEffect, useRef } from "react";

// The hero pins for this many viewport heights while the mark sweeps across.
const HERO_SCROLL_VH = 1.5;

// The HAA mark, straight from RESOURCES/Vector.svg.
const MARK_PATH =
  "M19.0845 26.449H11.0349V0H19.0845V26.449ZM38.1449 26.449H30.0953L22.7519 0H30.8013L38.1449 26.449ZM52.5017 26.449H44.4521L37.1087 0H45.1583L52.5017 26.449ZM7.4751 16.9619H0V9.48684H7.4751V16.9619Z";

// How far the mark sits on screen at rest, as a share of its own width.
const REST = 10;

export default function Hero() {
  const markRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mark = markRef.current;
    const copy = copyRef.current;
    if (!mark || !copy) return;

    // On load the mark sweeps in from off-screen right and settles into its
    // resting position; `intro` runs 1 -> 0 over that one play.
    let intro = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 1;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const distance = window.innerHeight * HERO_SCROLL_VH;
      const p = Math.min(Math.max(window.scrollY / distance, 0), 1);

      // The mark sweeps left off the screen and grows as it goes.
      const travel = mark.offsetWidth * 1.35 + window.innerWidth;
      const entrance = intro * window.innerWidth * 0.5;
      const x = entrance - p * travel;
      mark.style.transform = `translate3d(calc(-${REST}% + ${x}px),-50%,0) scale(${1 + p * 0.35})`;

      // The copy fades out over the first half of the sweep.
      copy.style.opacity = `${Math.max(0, 1 - p / 0.5)}`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();

    // Play that entrance once, then leave the mark to the scroll position.
    const DURATION = 1400;
    let introFrame = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / DURATION, 1);
      // easeOutCubic, running the entrance offset back down to zero
      intro = Math.pow(1 - t, 3);
      apply();
      if (t < 1) introFrame = requestAnimationFrame(step);
    };
    if (intro) introFrame = requestAnimationFrame(step);

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
    <div style={{ height: `${100 + HERO_SCROLL_VH * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            ref={markRef}
            // Starts off-screen right so the first paint matches the entrance.
            style={{ transform: `translate3d(calc(-${REST}% + 100vw),-50%,0)` }}
            className="absolute top-1/2 left-full h-[150vh] w-[295vh] origin-left will-change-transform"
          >
            <svg
              viewBox="0 0 53 27"
              preserveAspectRatio="none"
              className="h-full w-full"
              fill="var(--brand)"
            >
              <path d={MARK_PATH} />
            </svg>
          </div>
        </div>

        <div
          ref={copyRef}
          className="relative flex h-full flex-col will-change-[opacity]"
        >
          <section className="flex flex-1 items-center justify-center px-6 pt-40 pb-16">
            <h1 className="w-[min(1200px,92vw)] text-center text-[clamp(2.5rem,4.9vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.035em]">
              A two-year residential academy for unusually ambitious young
              people.
            </h1>
          </section>
          <section
            id="apply"
            className="flex flex-col items-center gap-6 px-6 pb-16 text-center"
          >
            <p className="max-w-[62ch] text-[14px] leading-[1.6] text-foreground/80">
              For students who would rather spend their time making,
              investigating, experimenting, and pursuing difficult questions
              than preparing for a life that starts later.
            </p>
            <a
              href="#apply"
              className="label rounded-lg border border-[#F2E7E5] bg-[#FFF4F2] px-8 py-3.5 text-brand transition-colors hover:bg-brand hover:text-white"
            >
              Apply to HAA
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
