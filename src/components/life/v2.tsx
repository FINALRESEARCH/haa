"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * The city arrives as a drawing and then becomes a photograph.
 *
 * An aerial of the Financial District is traced to line work (see
 * `scripts/trace-sf-lines.mjs`). On entry the drawing lays itself down from the
 * horizon forward; through the middle of the run colour blooms out from the
 * downtown core until the whole frame is photographic; the outlines then fade
 * and leave the plate alone.
 *
 * The two layers are the same frame at the same aspect, both `object-cover` in
 * the same box, so they register exactly however the viewport is shaped. They
 * are a matched pair rather than content: the line work is derived from this
 * specific photograph and cannot be swapped independently of it, which is why
 * neither comes from `content.image`.
 */
const PLATE = {
  photo: "/life/sf-aerial.jpg",
  lines: "/life/sf-lines.webp",
  alt: "Aerial view of the San Francisco Financial District, with the Bay Bridge and the Marin hills beyond",
  /** Where colour blooms from — the tower cluster, in frame coordinates. */
  origin: { x: 62, y: 34 },
};

export default function LifeV2({ id, content }: VariantProps<"life">) {
  const trackRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const plate = plateRef.current;
    const lines = linesRef.current;
    const photo = photoRef.current;
    const heading = headingRef.current;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    if (!track || !plate || !lines || !photo || !heading || !panel || !scrim)
      return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    const apply = () => {
      frame = 0;

      if (still.matches) {
        // No draw, no bloom: land on the finished photograph.
        plate.style.transform = "translate3d(0,0,0) scale(1)";
        lines.style.opacity = "0";
        photo.style.setProperty("--bloom", "150%");
        photo.style.opacity = "1";
        heading.style.opacity = "1";
        heading.style.transform = "translate3d(0,0,0)";
        panel.style.transform = "translate3d(0,0,0)";
        scrim.style.opacity = "1";
        return;
      }

      const vh = window.innerHeight;
      const { top, height } = track.getBoundingClientRect();
      const p = clamp(-top / Math.max(height - vh, 1));

      // A slow push-in across the whole run, so the frame never sits dead
      // between phases.
      //
      // The drift and the scale are coupled: scaling by s only buys (s - 1) / 2
      // of overflow past each edge, so once the upward drift exceeds that the
      // plate lifts off the bottom of the section and the scrim paints the
      // uncovered strip against the page. Keep half the scale overflow ahead
      // of the drift at every p, not just at the end of the run.
      plate.style.transform = `translate3d(0, ${p * -2.5}vh, 0) scale(${1.05 + p * 0.07})`;

      // The drawing lays down from the horizon forward. The wipe edge is soft
      // and runs well past the bottom so the near field never snaps in.
      const draw = ease(range(p, 0.04, 0.42));
      lines.style.setProperty("--draw", `${-12 + draw * 126}%`);
      lines.style.opacity = `${range(p, 0.02, 0.12)}`;

      // Colour blooms out of the tower cluster and overtakes the drawing.
      const bloom = ease(range(p, 0.38, 0.76));
      photo.style.opacity = `${range(p, 0.38, 0.46)}`;
      photo.style.setProperty("--bloom", `${bloom * 145}%`);

      // The ink leaves close behind the bloom rather than after it. At this
      // line weight a long overlap reads as a black cutout laid over the
      // photograph instead of a drawing giving way to one.
      lines.style.opacity = `${(1 - range(p, 0.44, 0.7)) * range(p, 0.02, 0.12)}`;

      const headingIn = range(p, 0.1, 0.36);
      heading.style.opacity = `${headingIn}`;
      heading.style.transform = `translate3d(0, ${(1 - headingIn) * 14}vh, 0)`;

      const panelIn = range(p, 0.78, 0.96);
      panel.style.transform = `translate3d(0, ${(1 - panelIn) * 100}%, 0)`;
      // Full strength: the gradient above carries its own falloff, so scaling
      // it down here would only thin the part doing the work.
      scrim.style.opacity = `${panelIn}`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    still.addEventListener("change", apply);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      still.removeEventListener("change", apply);
    };
  }, []);

  return (
    <div ref={trackRef} id={id} className="h-[380vh] bg-background">
      <section className="sticky top-0 h-screen overflow-hidden bg-background [isolation:isolate]">
        <div ref={plateRef} className="absolute inset-0 will-change-transform">
          {/* The photograph, revealed through a mask that opens from the core. */}
          <div
            ref={photoRef}
            className="absolute inset-0 opacity-0 will-change-[opacity]"
            style={{
              ["--bloom" as string]: "0%",
              maskImage: `radial-gradient(circle at ${PLATE.origin.x}% ${PLATE.origin.y}%, #000 calc(var(--bloom) * 0.62), transparent var(--bloom))`,
              WebkitMaskImage: `radial-gradient(circle at ${PLATE.origin.x}% ${PLATE.origin.y}%, #000 calc(var(--bloom) * 0.62), transparent var(--bloom))`,
            }}
          >
            <Image
              src={PLATE.photo}
              alt={PLATE.alt}
              fill
              preload={false}
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/*
           * The trace, drawn on from the horizon. The outer element carries
           * the wipe; the inner one is a flat sheet of ink masked by the trace
           * itself, which ships as an alpha mask for exactly this purpose —
           * Safari's `-webkit-mask-*` always reads alpha and has no
           * `mask-mode`, so a luminance mask renders there as a solid sheet.
           *
           * Two nested masks rather than `mix-blend-multiply` over the plate:
           * the blend renders nothing inside the composited layer the push-in
           * transform creates, and this way the ink is a colour we can change.
           */}
          <div
            ref={linesRef}
            aria-hidden
            className="absolute inset-0 opacity-0 will-change-[opacity]"
            style={{
              ["--draw" as string]: "-12%",
              maskImage:
                "linear-gradient(to bottom, #000 calc(var(--draw) - 16%), transparent var(--draw))",
              WebkitMaskImage:
                "linear-gradient(to bottom, #000 calc(var(--draw) - 16%), transparent var(--draw))",
            }}
          >
            <div
              className="absolute inset-0 bg-foreground"
              style={{
                maskImage: `url(${PLATE.lines})`,
                WebkitMaskImage: `url(${PLATE.lines})`,
                maskSize: "cover",
                WebkitMaskSize: "cover",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
              }}
            />
          </div>
        </div>

        {/*
         * Darkens the photograph only as the copy panel needs the contrast,
         * and only where it needs it. A flat wash over the whole plate buys
         * legibility at the bottom by dulling the sky and the skyline too,
         * which is most of what the section is for; the gradient is spent by
         * the time it reaches the heading.
         */}
        <div
          ref={scrimRef}
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.8)_28%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.2)_60%,rgba(0,0,0,0)_74%)] opacity-0 will-change-[opacity]"
        />

        <h2
          ref={headingRef}
          className="pointer-events-none absolute inset-x-0 top-[22vh] mx-auto w-[min(1100px,88vw)] text-center text-[clamp(2rem,6vw,5.5rem)] font-medium leading-[1] tracking-[-0.04em] text-white opacity-0 mix-blend-difference will-change-[transform,opacity]"
        >
          {content.heading}
        </h2>

        {/*
         * The resting position is set inline rather than with `translate-y-full`.
         * Tailwind v4 compiles that utility to the independent `translate`
         * property, which composes with `transform` instead of being replaced
         * by it, so the panel stays a full height below the fold however the
         * scroll handler drives it.
         */}
        <div
          ref={panelRef}
          style={{ transform: "translate3d(0, 100%, 0)" }}
          className="absolute inset-x-0 bottom-0 px-6 pb-[10vh] will-change-transform"
        >
          <div className="mx-auto flex w-[min(760px,90vw)] flex-col items-center gap-7 text-white">
            <div className="space-y-4 text-center text-[clamp(0.95rem,1.35vw,1.2rem)] leading-[1.45] tracking-[-0.01em]">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
            <a
              href={content.cta.href}
              className="label inline-flex items-center gap-2 text-white transition-opacity duration-300 ease-in-out hover:opacity-60"
            >
              {content.cta.label} <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
