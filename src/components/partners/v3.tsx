"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { VariantProps } from "@/variants/types";

/**
 * The same ten logos set into a ruled lattice with the headline left-aligned
 * above it, for a flatter, more institutional read than the centred plate.
 * Column counts stay even (2 or 5) so the grid never ends on a part-row.
 */
export default function PartnersV3({ id, content }: VariantProps<"partners">) {
  const sectionRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setShown(true),
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="flex flex-col items-center bg-background px-6 py-[16vh]"
    >
      <div className="w-[min(1150px,90vw)]">
        <span className="label text-foreground/45">{content.eyebrow}</span>
        <h2 className="mt-5 max-w-[20ch] text-[clamp(1.5rem,3.45vw,3.9rem)] leading-[1.05] font-medium tracking-[-0.035em]">
          {content.heading}
        </h2>

        <div
          className={`mt-[9vh] grid grid-cols-2 border-t border-l border-foreground/10 transition-opacity duration-700 ease-out lg:grid-cols-5 ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        >
          {content.logos.map(({ src, scale }) => (
            <div
              key={src}
              className="flex aspect-[3/2] items-center justify-center border-r border-b border-foreground/10 px-6"
            >
              <Image
                src={src}
                alt=""
                width={140}
                height={68}
                style={{ height: `calc(clamp(22px, 2.3vw, 34px) * ${scale})` }}
                className="w-auto max-w-[150px] object-contain [filter:brightness(0)]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
