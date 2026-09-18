"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { people } from "./people";

// The section pins for this many viewport heights while the grid grows in.
const SECTION_SCROLL_VH = 1;

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

export default function Network() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;
    const copy = copyRef.current;
    if (!wrap || !heading || !grid || !copy) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const vh = window.innerHeight;
      // 0 as the section's top meets the bottom of the screen, 0.5 once it is
      // pinned, 1 a screen later.
      const p = clamp(
        (vh - wrap.getBoundingClientRect().top) /
          (vh * (1 + SECTION_SCROLL_VH)),
      );

      // Everything fades in place: nothing here travels with the scroll.
      heading.style.opacity = `${clamp((p - 0.02) / 0.1)}`;
      // The grid grows from 75% in the middle of the screen...
      const growth = clamp((p - 0.42) / 0.3);
      grid.style.transform = `scale(${0.75 + 0.25 * growth})`;
      grid.style.opacity = `${clamp((p - 0.42) / 0.12)}`;
      // ...and only then does the supporting copy arrive.
      copy.style.opacity = `${clamp((p - 0.62) / 0.08)}`;
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
      id="faculty"
      // Rides up a little into the tail of the hero so the two screens meet.
      className="-mt-[25vh]"
      style={{ height: `${100 + SECTION_SCROLL_VH * 100}vh` }}
    >
      <section className="sticky top-0 flex h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-background px-6 pt-[150px] pb-10">
        <h2
          ref={headingRef}
          className="w-[min(1100px,92vw)] opacity-0 text-center text-[clamp(1.75rem,3.6vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.035em] will-change-[opacity]"
        >
          Learn from people shaping the world.
        </h2>

        <div
          ref={gridRef}
          className="grid w-[min(1150px,88vw)] grid-cols-2 gap-2 opacity-0 will-change-[opacity,transform] sm:grid-cols-3 lg:grid-cols-5"
        >
          {people.map((person) => (
            <div
              key={person.src}
              className="group relative aspect-square overflow-hidden rounded-[10px]"
            >
              <Image
                src={person.src}
                alt={person.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover"
              />
              {person.name && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="label rounded-[5px] bg-[#EAEAEA]/90 px-2.5 py-1.5 text-[10px] tracking-[0.06em] text-foreground">
                    {person.name}, {person.affiliation}
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>

        <div
          ref={copyRef}
          className="flex flex-col items-center gap-5 text-center opacity-0 will-change-[opacity]"
        >
          <p className="max-w-[54ch] text-[clamp(0.95rem,1.15vw,1.125rem)] leading-[1.5]">
            A rotating community of founders, scientists, engineers, investors,
            artists, and operators teach at HAA, speak with students, offer
            mentorship, and open doors to Silicon Valley and the world.
          </p>
          <a
            href="#network"
            className="label inline-flex items-center gap-2 text-brand"
          >
            Explore the network <span aria-hidden>→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
