"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/**
 * The applicants read as a set rather than a wall: heading and copy land
 * first, then the grid fills in beneath them in normal page flow. Unlike the
 * pinned wall there is no `mix-blend-difference` heading, which is what makes
 * room for the two lines of body copy the wall has nowhere to put.
 *
 * The tiles are stills today; the deck calls for video, and swapping the
 * `<Image>` below for a muted autoplaying `<video>` is the only change that
 * would need — the grid and the reveal are indifferent to which it is.
 */
export default function PeopleStackedV2({ id, content }: VariantProps<"people">) {
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
      className="flex flex-col items-center gap-[9vh] bg-background px-6 py-[16vh]"
    >
      <div
        data-reveal
        className="w-[min(860px,92vw)] text-center opacity-0 will-change-[opacity]"
      >
        <h2 className="text-[clamp(1.75rem,3.9vw,4.25rem)] font-medium leading-[1.05] tracking-[-0.035em]">
          {content.heading}
        </h2>
        <div className="mx-auto mt-7 max-w-[62ch] space-y-4 text-[clamp(0.95rem,1.2vw,1.1rem)] leading-[1.5] tracking-[-0.01em] text-foreground/80">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div
        data-reveal
        className="grid w-[min(1240px,94vw)] grid-cols-2 gap-3 opacity-0 will-change-[opacity] sm:grid-cols-4"
      >
        {content.tiles.map((tile) => (
          <div
            key={tile.src}
            className="relative aspect-[3/4] overflow-hidden rounded-[10px] bg-foreground/5"
          >
            <Image
              src={tile.src}
              alt={tile.name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
