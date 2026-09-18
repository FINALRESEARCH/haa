"use client";

import { useEffect, useRef } from "react";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/** The "never been good at waiting" screen, scrolling up over the last one. */
export default function Admissions() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = Array.from(
      sectionRef.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [],
    );
    if (!els.length) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of els) {
        const { top } = el.getBoundingClientRect();
        el.style.opacity = `${clamp((vh * 0.9 - top) / (vh * 0.25))}`;
      }
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
    <section
      ref={sectionRef}
      id="admissions"
      className="relative flex flex-col items-center gap-24 bg-background px-6 pt-[9vh] pb-[18vh]"
    >
      <h2
        data-reveal
        className="w-[92vw] text-center text-[clamp(1.65rem,3.4vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.035em] opacity-0 will-change-[opacity]"
      >
        For people who have never been good at waiting.
      </h2>

      <div
        data-reveal
        className="w-[min(760px,88vw)] space-y-8 text-center text-[clamp(1.05rem,1.5vw,1.4rem)] leading-[1.35] tracking-[-0.01em] opacity-0 will-change-[opacity]"
      >
        <p>
          Maybe you were the person building something after school while
          everyone else was studying for the test.
        </p>
        <p>
          Maybe you joined the robotics club, started a company, taught yourself
          to code, obsessed over an obscure subject, made films, ran events,
          built machines, wrote constantly, or found some other thing you
          couldn&apos;t stop thinking about.
        </p>
        <p>
          You are curious. You take initiative. You want your work to matter.
          And you want to spend the next two years around people who have the
          same intensity.
        </p>
      </div>

      <div data-reveal className="opacity-0 will-change-[opacity]">
        <a
          href="#admissions"
          className="label inline-flex items-center gap-2 text-brand"
        >
          Learn about admissions <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}
