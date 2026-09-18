"use client";

import { useEffect, useRef } from "react";

// The hero pins for this many viewport heights while the mark sweeps across.
const HERO_SCROLL_VH = 1.5;

// The mark's bars, at the slant Vector.svg draws them (15.5 deg off vertical).
// `right`/`width` are in vw and match the resting composition in the mocks;
// the whole group sweeps left and grows as the hero scrolls.
const BARS = [
  { right: -8, width: 4 },
  { right: 10, width: 18 },
  { right: 112, width: 30 },
  { right: 148, width: 30 },
  { right: 184, width: 30 },
];

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

      // The mark sweeps left and grows as it goes, as in the mock frames.
      const travel = mark.offsetWidth * 0.85;
      const entrance = intro * window.innerWidth * 1.15;
      mark.style.transform = `translate3d(${entrance - p * travel}px,0,0) scale(${1 + p * 0.6})`;

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
            style={{ transform: "translate3d(115vw,0,0)" }}
            className="absolute inset-y-0 right-0 w-[230vw] origin-[95%_50%] will-change-transform"
          >
            {BARS.map((bar) => (
              <div
                key={bar.right}
                className="absolute -top-1/2 -bottom-1/2 -rotate-[15.5deg] bg-brand"
                style={{ right: `${bar.right}vw`, width: `${bar.width}vw` }}
              />
            ))}
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
