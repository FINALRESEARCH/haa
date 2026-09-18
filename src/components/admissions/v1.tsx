"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * The "never been good at waiting" screen. The photo sits directly on top of
 * the copy and scrolls with it; the copy then arrives a beat at a time.
 */
export default function AdmissionsV1({ id, content }: VariantProps<"admissions">) {
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
      const stage = (el: HTMLElement, from: number, over = 0.08) => {
        const { top } = el.getBoundingClientRect();
        const p = clamp((vh - top) / vh);
        el.style.opacity = `${clamp((p - from) / over)}`;
      };
      stage(heading, 0.05);
      stage(body, 0.08);
      stage(cta, 0.1, 0.05);

      // The whole screen fades out as it leaves, handing over to the wall.
      const { bottom } = section.getBoundingClientRect();
      section.style.opacity = `${clamp(bottom / (vh * 0.75))}`;
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
      className="relative flex flex-col items-center bg-background px-6 pt-20 pb-[18vh]"
    >
      <div className="relative aspect-[1053/536] w-[min(1050px,88vw)] overflow-hidden rounded-xl">
        <Image
          src={content.image.src}
          alt={content.image.alt}
          fill
          sizes="(max-width: 1200px) 88vw, 1050px"
          className="object-cover"
        />
      </div>

      <div className="mt-[8vh] grid w-[min(1050px,88vw)] items-stretch gap-x-10 gap-y-8 md:grid-cols-[340px_minmax(0,1fr)]">
        <h2
          ref={headingRef}
          className="text-[clamp(2.25rem,4.2vw,4.5rem)] leading-[1.12] font-medium tracking-[-0.035em] opacity-0 will-change-[opacity]"
        >
          {content.heading}
        </h2>

        <div className="flex flex-col">
          <div
            ref={bodyRef}
            className="space-y-7 text-[clamp(1rem,1.2vw,1.25rem)] leading-[1.4] tracking-[-0.01em] opacity-0 will-change-[opacity]"
          >
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <div
            ref={ctaRef}
            className="mt-12 md:mt-auto md:pt-12 opacity-0 will-change-[opacity]"
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
