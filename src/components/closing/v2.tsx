"use client";

import { useEffect, useRef } from "react";
import Mark from "@/components/Mark";
import type { VariantProps } from "@/variants/types";
import { ApplyButton } from "./v1";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/**
 * The same words with the house mark behind them, drawn far past the width of
 * the screen and drifting up as the page ends. The type sits over it in
 * `mix-blend-difference`, which rhymes with the Life screen one section up:
 * the last thing the page does is the same trick it did over the city.
 *
 * The mark is a flat drawing rather than a photograph, so the inversion reads
 * as a clean two-tone cut instead of a colour shift.
 */
export default function ClosingV2({ id, content }: VariantProps<"closing">) {
  const sectionRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const mark = markRef.current;
    if (!section || !mark) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    const apply = () => {
      frame = 0;

      if (still.matches) {
        mark.style.transform = "translate3d(0,0,0)";
        return;
      }

      const vh = window.innerHeight;
      const { top, height } = section.getBoundingClientRect();
      // 0 when the section's top edge reaches the bottom of the screen, 1 when
      // its bottom edge reaches the top.
      const p = clamp((vh - top) / (vh + height));
      mark.style.transform = `translate3d(0, ${(0.5 - range(p, 0, 1)) * 18}vh, 0)`;
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
    <section
      ref={sectionRef}
      id={id}
      className="relative flex min-h-screen flex-col items-center justify-center gap-14 overflow-hidden bg-background px-6 py-[16vh] text-center [isolation:isolate]"
    >
      <div
        ref={markRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 will-change-transform"
      >
        <Mark
          path={content.markPath}
          className="w-[160vw] max-w-none -translate-x-[30vw] text-foreground/[0.07]"
        />
      </div>

      <h2 className="relative w-[min(1000px,90vw)] text-[clamp(2rem,5.4vw,5rem)] font-medium leading-[1.02] tracking-[-0.04em] text-white mix-blend-difference">
        {content.heading}
      </h2>

      <div className="relative w-[min(700px,88vw)] space-y-5 text-[clamp(0.95rem,1.35vw,1.2rem)] leading-[1.45] tracking-[-0.01em]">
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-9">
        <ApplyButton cta={content.apply} />

        <div className="flex flex-col items-center gap-x-10 gap-y-4 sm:flex-row">
          {content.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="label inline-flex items-center gap-2 text-brand transition-opacity duration-300 ease-in-out hover:opacity-60"
            >
              {link.label} <span aria-hidden>→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
