"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * The "never been good at waiting" screen. The photo sits directly on top of
 * the copy and scrolls with it; the copy then arrives a beat at a time.
 */
export default function Admissions() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const body = bodyRef.current;
    const cta = ctaRef.current;
    if (!section || !heading || !body || !cta) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const vh = window.innerHeight;
      // 0 as the copy meets the bottom of the screen, 1 once it has risen.
      const stage = (el: HTMLElement, from: number, over = 0.28) => {
        const { top } = el.getBoundingClientRect();
        const p = clamp((vh - top) / vh);
        el.style.opacity = `${clamp((p - from) / over)}`;
      };
      stage(heading, 0.05);
      stage(body, 0.12);
      stage(cta, 0.18);
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
      className="relative flex flex-col items-center bg-background px-6 pt-20 pb-[18vh]"
    >
      <div className="relative aspect-[1053/536] w-[min(1050px,88vw)] overflow-hidden rounded-xl">
        <Image
          src="/workshop.jpg"
          alt="A student working at a bench of half-built electronics"
          fill
          sizes="(max-width: 1200px) 88vw, 1050px"
          className="object-cover"
        />
      </div>

      <h2
        ref={headingRef}
        className="mt-[9vh] w-[92vw] text-center text-[clamp(1.65rem,3.4vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.035em] opacity-0 will-change-[opacity]"
      >
        For people who have never been good at waiting.
      </h2>

      <div
        ref={bodyRef}
        className="mt-24 w-[min(760px,88vw)] space-y-7 text-center text-[clamp(1.05rem,1.5vw,1.4rem)] leading-[1.35] tracking-[-0.01em] opacity-0 will-change-[opacity]"
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

      <div ref={ctaRef} className="mt-24 opacity-0 will-change-[opacity]">
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
