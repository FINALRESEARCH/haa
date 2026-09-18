"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const TILES = Array.from(
  { length: 8 },
  (_, i) => `/portraits/portrait-${String(i + 1).padStart(2, "0")}.jpg`,
);

/**
 * "Meet the kind of people we're looking for." The line lands on its own, then
 * the wall of portraits animates in on a timer rather than on scroll.
 */
export default function PeopleWall() {
  const sectionRef = useRef<HTMLElement>(null);
  const [headingIn, setHeadingIn] = useState(false);
  const [tilesIn, setTilesIn] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (entry.isIntersecting) {
          setHeadingIn(true);
          // The line reads on its own for a beat, then the wall arrives.
          timer = setTimeout(() => setTilesIn(true), 1600);
        } else {
          // Scrolling back off takes the wall away again.
          setHeadingIn(false);
          setTilesIn(false);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div id="people" className="h-[180vh]">
      <section
        ref={sectionRef}
        className="sticky top-0 h-screen overflow-hidden bg-background p-3"
      >
        <div className="grid h-full grid-cols-2 grid-rows-4 gap-3 sm:grid-cols-4 sm:grid-rows-2">
          {TILES.map((src, i) => (
            <div
              key={src}
              style={{ transitionDelay: `${(i % 4) * 70}ms` }}
              className={`relative overflow-hidden rounded-[10px] transition-[opacity,transform] duration-700 ease-out ${
                tilesIn
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-6 opacity-0"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <h2
          className={`pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-[clamp(1.75rem,3.9vw,4.25rem)] leading-[1.05] font-medium tracking-[-0.035em] text-white mix-blend-difference transition-opacity duration-500 ${
            headingIn ? "opacity-100" : "opacity-0"
          }`}
        >
          Meet the kind of people we&apos;re looking for.
        </h2>
      </section>
    </div>
  );
}
