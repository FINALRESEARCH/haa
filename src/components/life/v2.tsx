"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * The quiet reading of the same screen: no pinning, no blend mode. A tall
 * portrait plate holds the left column while the heading and copy stack down
 * the right, separated by the hairline rules the partners lattice uses. Each
 * block fades up as it clears the fold, the way the program screen does.
 *
 * This is the variant that survives a short viewport, a slow device, and
 * `prefers-reduced-motion` without special-casing any of them.
 */
export default function LifeV2({ id, content }: VariantProps<"life">) {
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
      className="border-y border-foreground/10 bg-background py-[14vh]"
    >
      <div className="mx-auto grid w-[min(1240px,92vw)] gap-12 md:grid-cols-2 md:gap-0">
        <div
          data-reveal
          className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-foreground/5 opacity-0 will-change-[opacity] md:mr-12"
        >
          <Image
            src={content.image.src}
            alt={content.image.alt}
            fill
            sizes="(max-width: 768px) 92vw, 600px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center md:border-l md:border-foreground/10 md:pl-12">
          <h2
            data-reveal
            className="text-[clamp(1.9rem,3.6vw,3.9rem)] font-medium leading-[1.02] tracking-[-0.04em] opacity-0 will-change-[opacity]"
          >
            {content.heading}
          </h2>

          <div className="mt-10 flex flex-col">
            {content.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                data-reveal
                className="border-t border-foreground/10 py-6 text-[clamp(0.95rem,1.15vw,1.1rem)] leading-[1.5] tracking-[-0.01em] opacity-0 will-change-[opacity]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div
            data-reveal
            className="border-t border-foreground/10 pt-7 opacity-0 will-change-[opacity]"
          >
            <a
              href={content.cta.href}
              className="label inline-flex items-center gap-2 text-brand"
            >
              {content.cta.label} <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
