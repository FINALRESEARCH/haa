"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Optical sizing: a couple of the files draw small inside their box.
const LOGOS: { src: string; scale: number }[] = [
  { src: "coinbase", scale: 2.1 },
  { src: "google", scale: 1 },
  { src: "meta", scale: 1 },
  { src: "nvidia", scale: 1 },
  { src: "replit", scale: 1 },
  { src: "stripe", scale: 1 },
  { src: "openai", scale: 1 },
  { src: "anthropic", scale: 1 },
  { src: "palantir", scale: 1 },
  { src: "anduril", scale: 0.85 },
].map(({ src, scale }) => ({ src: `/partners/${src}.svg`, scale }));

function Row({ direction }: { direction: "left" | "right" }) {
  // The list is rendered twice so the loop can wrap seamlessly.
  const marks = [...LOGOS, ...LOGOS];
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max items-center gap-[10vw] ${
          direction === "left" ? "marquee-left" : "marquee-right"
        }`}
      >
        {marks.map(({ src, scale }, i) => (
          <Image
            key={`${src}-${i}`}
            src={src}
            alt=""
            width={140}
            height={68}
            style={{ height: `calc(clamp(26px, 3.2vw, 46px) * ${scale})` }}
            className="w-auto max-w-[190px] object-contain [filter:brightness(0)]"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Partner logos drifting in opposite directions around the headline. The
 * screen is pinned and fades in, rather than being scrolled into view.
 */
export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { threshold: 0.6 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div id="partners" className="h-[180vh]">
      <section
        ref={sectionRef}
        className="sticky top-0 flex h-screen flex-col justify-center gap-[12vh] overflow-hidden bg-background"
      >
        <div
          className={`flex flex-col gap-[12vh] transition-opacity duration-700 ease-out ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        >
          <Row direction="left" />

          <h2 className="px-6 text-center text-[clamp(1.5rem,3.45vw,3.9rem)] leading-[1.05] font-medium tracking-[-0.035em]">
            Connected to the institutions shaping what comes next.
          </h2>

          <Row direction="right" />
        </div>
      </section>
    </div>
  );
}
