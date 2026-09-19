"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { VariantProps } from "@/variants/types";

/**
 * The original five-across grid, kept for comparison against the tile layout.
 *
 * It used to pin for an extra viewport while the grid grew in, which cost a
 * screen and a half of scrolling to reveal one grid. The growth now runs off
 * the section entering the viewport, so the page never stops moving under the
 * reader — the grid simply arrives at full size and the scroll carries on.
 */
export default function NetworkV1({ id, content }: VariantProps<"network">) {
  const sectionRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Once only: taking the grid away again on the way back up is its own
        // kind of stutter.
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      // Rides up a little into the tail of the hero so the two screens meet.
      className="-mt-[25vh] flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 pt-[150px] pb-10"
    >
      <h2
        className={`w-[min(1100px,92vw)] text-center text-[clamp(1.75rem,3.6vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.035em] transition-opacity duration-700 ease-out ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      >
        {content.heading}
      </h2>

      <div
        className={`grid w-[min(1150px,88vw)] grid-cols-2 gap-2 transition-[opacity,transform] duration-[900ms] ease-out sm:grid-cols-3 lg:grid-cols-5 ${
          shown ? "scale-100 opacity-100" : "scale-[0.85] opacity-0"
        }`}
        style={{ transitionDelay: shown ? "120ms" : "0ms" }}
      >
        {content.portraits.map((person) => (
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
        className={`flex flex-col items-center gap-5 text-center transition-opacity duration-700 ease-out ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: shown ? "320ms" : "0ms" }}
      >
        <p className="max-w-[54ch] text-[clamp(0.95rem,1.15vw,1.125rem)] leading-[1.5]">
          {content.body}
        </p>
        <a
          href={content.cta.href}
          className="label inline-flex items-center gap-2 text-brand transition-opacity duration-300 ease-in-out hover:opacity-60"
        >
          {content.cta.label} <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}
