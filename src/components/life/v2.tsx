"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/**
 * The city as ground rather than object: the plate goes full-bleed and pins,
 * drifting slowly under a fixed frame while the heading sits over it in
 * blend-difference white. The copy arrives last on a panel that slides up
 * over the bottom of the photograph and darkens it as it comes.
 *
 * Where the lock-up treats the plate as something that enters and leaves,
 * this one
 * never lets go of it: the screen stays inside the city for its whole run.
 */
export default function LifeV2({ id, content }: VariantProps<"life">) {
  const trackRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const plate = plateRef.current;
    const heading = headingRef.current;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    if (!track || !plate || !heading || !panel || !scrim) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    const apply = () => {
      frame = 0;

      if (still.matches) {
        plate.style.transform = "translate3d(0,0,0) scale(1)";
        heading.style.opacity = "1";
        heading.style.transform = "translate3d(0,0,0)";
        panel.style.transform = "translate3d(0,0,0)";
        scrim.style.opacity = "0.55";
        return;
      }

      const vh = window.innerHeight;
      const { top, height } = track.getBoundingClientRect();
      const p = clamp(-top / Math.max(height - vh, 1));

      // A slow push-in over the whole run, so the still frame never feels dead.
      plate.style.transform = `translate3d(0, ${p * -6}vh, 0) scale(${1.06 + p * 0.06})`;

      const headingIn = range(p, 0.08, 0.34);
      heading.style.opacity = `${headingIn}`;
      heading.style.transform = `translate3d(0, ${(1 - headingIn) * 14}vh, 0)`;

      const panelIn = range(p, 0.45, 0.8);
      panel.style.transform = `translate3d(0, ${(1 - panelIn) * 100}%, 0)`;
      scrim.style.opacity = `${panelIn * 0.55}`;
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
    <div ref={trackRef} id={id} className="h-[320vh] bg-background">
      <section className="sticky top-0 h-screen overflow-hidden bg-foreground [isolation:isolate]">
        <div
          ref={plateRef}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src={content.image.src}
            alt={content.image.alt}
            fill
            priority={false}
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Darkens the photograph only as the copy panel needs the contrast. */}
        <div
          ref={scrimRef}
          aria-hidden
          className="absolute inset-0 bg-black opacity-0 will-change-[opacity]"
        />

        <h2
          ref={headingRef}
          className="pointer-events-none absolute inset-x-0 top-[22vh] mx-auto w-[min(1100px,88vw)] text-center text-[clamp(2rem,6vw,5.5rem)] font-medium leading-[1] tracking-[-0.04em] text-white opacity-0 mix-blend-difference will-change-[transform,opacity]"
        >
          {content.heading}
        </h2>

        <div
          ref={panelRef}
          className="absolute inset-x-0 bottom-0 translate-y-full px-6 pb-[10vh] will-change-transform"
        >
          <div className="mx-auto flex w-[min(760px,90vw)] flex-col items-center gap-7 text-white">
            <div className="space-y-4 text-center text-[clamp(0.95rem,1.35vw,1.2rem)] leading-[1.45] tracking-[-0.01em]">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
            <a
              href={content.cta.href}
              className="label inline-flex items-center gap-2 text-white"
            >
              {content.cta.label} <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
