"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { VariantProps } from "@/variants/types";

/**
 * All ten logos held still in two rows of five, edge to edge, in normal page
 * flow rather than pinned. The grid draws its own rules: a 1px gap over a
 * tinted backing shows through as hairlines between cells, which keeps the
 * lines correct at every column count without per-cell border juggling.
 */
export default function PartnersV2({ id, content }: VariantProps<"partners">) {
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
      className="flex flex-col items-center gap-[10vh] bg-background py-[18vh]"
    >
      <div className="w-[min(1000px,92vw)]">
        <h2 className="px-6 text-center text-[clamp(1.5rem,3.45vw,3.9rem)] leading-[1.05] font-medium tracking-[-0.035em]">
          {content.heading}
        </h2>
        <p className="mx-auto mt-5 max-w-[56ch] px-6 text-center text-[clamp(0.9rem,1.1vw,1.05rem)] leading-[1.5] tracking-[-0.01em] text-foreground/75">
          {content.body}
        </p>
      </div>

      <div
        className={`grid w-full grid-cols-2 gap-px border-y border-foreground/10 bg-foreground/10 transition-opacity duration-700 ease-out lg:grid-cols-5 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      >
        {content.logos.map(({ src, scale }) => (
          <div
            key={src}
            className="flex min-h-[clamp(110px,15vh,190px)] items-center justify-center bg-background px-6"
          >
            <Image
              src={src}
              alt=""
              width={140}
              height={68}
              style={{ height: `calc(clamp(24px, 2.6vw, 38px) * ${scale})` }}
              className="w-auto max-w-[170px] object-contain [filter:brightness(0)]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
