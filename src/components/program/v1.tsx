"use client";

import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * The curriculum screen. Unlike the hero and network screens this one is not
 * pinned: it scrolls up over the previous screen, and each block fades in as
 * it rises into view.
 */
export default function ProgramV1({ id, content }: VariantProps<"program">) {
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
        el.style.opacity = `${clamp((vh * 0.92 - top) / (vh * 0.12))}`;
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
      id={id}
      className="relative flex flex-col items-center gap-16 bg-background px-6 pt-[6vh] pb-0"
    >
      <div
        data-reveal
        className="w-[92vw] text-center opacity-0 will-change-[opacity]"
      >
        <h2 className="text-[clamp(1.65rem,3.4vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.035em]">
          {content.heading}
        </h2>
        <p className="mt-3 text-[clamp(0.85rem,1vw,1rem)] font-medium">
          {content.subheading}
        </p>
      </div>

      <div
        data-reveal
        className="w-[min(760px,88vw)] space-y-8 text-center text-[clamp(1.05rem,1.5vw,1.4rem)] leading-[1.35] tracking-[-0.01em] opacity-0 will-change-[opacity]"
      >
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      <div data-reveal className="opacity-0 will-change-[opacity]">
        <a
          href={content.cta.href}
          className="label inline-flex items-center gap-2 text-brand"
        >
          {content.cta.label} <span aria-hidden>→</span>
        </a>
      </div>

    </section>
  );
}
