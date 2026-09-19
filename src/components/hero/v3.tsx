"use client";

import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";
import ArrowUpRight from "../ArrowUpRight";

/**
 * Only reached when the hero has no Mux asset on it. Hotlinked on purpose:
 * the master is 29.5 MB and nothing that heavy earns a place in the repo, and
 * the real footage is meant to come from the Sizzle field in the Studio —
 * `scripts/upload-hero-video.mjs` puts a file there from the command line.
 */
const PLACEHOLDER_SRC =
  "https://d1lamhf6l6yk6d.cloudfront.net/uploads/2026/03/fundraise-landscape.mp4";

export default function HeroV3({ id, content }: VariantProps<"hero">) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Left paused on its first frame rather than stopped dead, so the hero is
    // still a picture instead of a black hole.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Decoding a full-bleed video nobody is looking at is the one cost worth
    // avoiding, so it only runs while the hero is actually on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.01 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    // The same 25vh hand-back v2 needs: the network section that follows pulls
    // itself up by that much to slide over the hero's tail, and a hero that is
    // exactly one screen has nothing to spare.
    <div
      id={id}
      // Dark underneath, so the white copy is never white-on-white in the beat
      // before the video paints.
      className="relative mb-[25vh] h-screen overflow-hidden bg-foreground"
    >
      <video
        ref={videoRef}
        src={content.video?.src ?? PLACEHOLDER_SRC}
        // Mux's thumbnail of the first frame, so the hero is a picture from
        // the moment it paints rather than only once the video decodes.
        poster={content.video?.poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Legibility only. Drop this line if you would rather grade the footage. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/25"
      />

      <div className="relative flex h-full flex-col text-white">
        <section className="flex flex-1 items-start justify-center px-6 pt-[300px] pb-10 sm:items-center sm:pt-40 sm:pb-16">
          <h1 className="hero-headline-in w-[min(1200px,92vw)] text-[clamp(2.25rem,10vw,5.5rem)] leading-[1.06] font-medium tracking-[-0.035em] sm:text-center sm:text-[clamp(2.5rem,4.9vw,5.5rem)] sm:leading-[1.02]">
            {content.headline}
          </h1>
        </section>
        <section
          id="apply"
          className="hero-copy-in flex flex-col items-center gap-10 px-6 pb-16 sm:gap-6 sm:text-center"
        >
          <p className="w-full max-w-[62ch] text-[15px] leading-[1.5] text-white/80 sm:text-[14px] sm:leading-[1.6]">
            {content.body}
          </p>
          <a
            href={content.cta.href}
            className="label label-button inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-3.5 text-white transition-opacity duration-300 ease-in-out hover:opacity-60"
          >
            {content.cta.label}
            <ArrowUpRight />
          </a>
        </section>
      </div>
    </div>
  );
}
