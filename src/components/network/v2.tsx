"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Portrait } from "@/content/types";
import type { VariantProps } from "@/variants/types";

/**
 * How long the hover clip takes to cross-fade, in and out. The fade out is
 * the whole point of the number: cutting straight back to the still reads as
 * a glitch rather than a transition.
 */
const FADE_MS = 500;

function Tile({ person, index }: { person: Portrait; index: number }) {
  const wrapRef = useRef<HTMLLIElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Each tile grows to full size as it comes into view, on its own, and stays
  // there. Nothing here is tied to scroll position, so no amount of scrolling
  // is ever spent waiting for the animation to finish.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  // The clip is only ever decoded for the tile actually under the pointer, and
  // it is rewound on the way out so the next hover starts where it should.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      void video.play().catch(() => {});
      return;
    }
    const timer = setTimeout(() => {
      video.pause();
      video.currentTime = 0;
    }, FADE_MS);
    return () => clearTimeout(timer);
  }, [playing]);

  const hover = (on: boolean) => () => {
    if (!person.video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPlaying(on);
  };

  return (
    <li
      ref={wrapRef}
      className={`transition-[opacity,transform] duration-[900ms] ease-out ${
        shown ? "scale-100 opacity-100" : "scale-[0.92] opacity-0"
      }`}
      style={{ transitionDelay: shown ? `${(index % 5) * 70}ms` : "0ms" }}
    >
      <div
        onPointerEnter={hover(true)}
        onPointerLeave={hover(false)}
        onFocus={hover(true)}
        onBlur={hover(false)}
        // Square, like the portraits were shot: the grid gets its scale from
        // the container being wider, not from cropping the frame.
        className="relative aspect-square overflow-hidden rounded-[10px] bg-foreground/5"
      >
        <Image
          src={person.src}
          alt={person.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 19vw"
          className="object-cover"
        />
        {person.video && (
          <video
            ref={videoRef}
            src={person.video.src}
            poster={person.video.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            style={{ transitionDuration: `${FADE_MS}ms` }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out ${
              playing ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      {/* Tight to the tile on purpose: the chip reads as the tile's label, not
          as a caption floating under it. The two portraits the client has not
          identified yet still take their place in the grid — they just go
          uncaptioned rather than carrying an empty chip. */}
      {person.name && (
        <div className="label mt-1.5 inline-flex flex-col gap-0.5 rounded-[5px] bg-[#EAEAEA] px-2.5 py-1.5 text-[10px] tracking-[0.06em] text-foreground">
          <span>{person.name}</span>
          {person.affiliation && (
            <span className="opacity-60">{person.affiliation}</span>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * The five-across grid, blown up and captioned. It was legible but small, and
 * the names only existed on hover — which assumed the reader already knew the
 * face. Parents of applicants do not, so the name and the one-line affiliation
 * print under every tile, always.
 *
 * Black and white is the photographer's call, not a styling choice: the source
 * portraits have wildly inconsistent colour and stripping it is what makes the
 * set cohere. The hover clip is the exception, and it arrives in colour.
 */
export default function NetworkV2({ id, content }: VariantProps<"network">) {
  const copyRef = useRef<HTMLDivElement>(null);
  const [copyIn, setCopyIn] = useState(false);

  useEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCopyIn(true);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(copy);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      // Rides up a little into the tail of the hero so the two screens meet.
      className="-mt-[25vh] bg-background px-6 pt-[150px] pb-[14vh]"
    >
      <h2 className="mx-auto w-[min(1100px,92vw)] text-center text-[clamp(1.75rem,3.6vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.035em]">
        {content.heading}
      </h2>

      {/* Near full-bleed on purpose. Five across is width-capped by the
          viewport, so the only room left for "bigger" is the margin. */}
      <ul className="mx-auto mt-[7vh] grid w-[min(1800px,96vw)] grid-cols-2 gap-x-2 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
        {content.portraits.map((person, i) => (
          <Tile key={person.src} person={person} index={i} />
        ))}
      </ul>

      <div
        ref={copyRef}
        className={`mx-auto mt-[12vh] flex flex-col items-center gap-5 text-center transition-opacity duration-700 ease-out ${
          copyIn ? "opacity-100" : "opacity-0"
        }`}
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
