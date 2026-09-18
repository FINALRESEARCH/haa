"use client";

import { useEffect, useRef } from "react";

// The section pins for this many viewport heights while the copy arrives.
const SECTION_SCROLL_VH = 1;

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * The "never been good at waiting" screen. It scrolls up into place behind the
 * curriculum screen, pins, and then animates its copy in a beat at a time.
 */
export default function Admissions() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const heading = headingRef.current;
    const body = bodyRef.current;
    const cta = ctaRef.current;
    if (!wrap || !heading || !body || !cta) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const distance = window.innerHeight * SECTION_SCROLL_VH;
      const p = clamp(-wrap.getBoundingClientRect().top / distance);

      heading.style.opacity = `${clamp(p / 0.18)}`;
      body.style.opacity = `${clamp((p - 0.28) / 0.25)}`;
      cta.style.opacity = `${clamp((p - 0.62) / 0.2)}`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      id="admissions"
      style={{ height: `${100 + SECTION_SCROLL_VH * 100}vh` }}
    >
      <section className="sticky top-0 flex h-screen flex-col items-center justify-center gap-16 overflow-hidden bg-background px-6 pt-[120px] pb-16">
        <h2
          ref={headingRef}
          className="w-[92vw] text-center text-[clamp(1.65rem,3.4vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.035em] opacity-0 will-change-[opacity]"
        >
          For people who have never been good at waiting.
        </h2>

        <div
          ref={bodyRef}
          className="w-[min(760px,88vw)] space-y-7 text-center text-[clamp(1.05rem,1.5vw,1.4rem)] leading-[1.35] tracking-[-0.01em] opacity-0 will-change-[opacity]"
        >
          <p>
            Maybe you were the person building something after school while
            everyone else was studying for the test.
          </p>
          <p>
            Maybe you joined the robotics club, started a company, taught
            yourself to code, obsessed over an obscure subject, made films, ran
            events, built machines, wrote constantly, or found some other thing
            you couldn&apos;t stop thinking about.
          </p>
          <p>
            You are curious. You take initiative. You want your work to matter.
            And you want to spend the next two years around people who have the
            same intensity.
          </p>
        </div>

        <div ref={ctaRef} className="opacity-0 will-change-[opacity]">
          <a
            href="#admissions"
            className="label inline-flex items-center gap-2 text-brand"
          >
            Learn about admissions <span aria-hidden>→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
