"use client";

import { useEffect, useRef } from "react";
import type { VariantProps } from "@/variants/types";
import ArrowUpRight from "../ArrowUpRight";

/**
 * The mark as its four separate drawings. v1 hands `content.markPath` to a
 * single `<path>`; splitting it by hand is what lets each stroke swell on its
 * own, and it is the one cost of this variant — a markPath edit in the Studio
 * moves the nav and v1, but not this.
 */
const VIEW_W = 53;
const SHAPES = [
  { x: 0, w: 7.4751, d: "M7.4751 16.9619H0V9.48684H7.4751V16.9619Z" },
  { x: 11.0349, w: 8.0496, d: "M19.0845 26.449H11.0349V0H19.0845V26.449Z" },
  {
    x: 22.7519,
    w: 15.393,
    d: "M38.1449 26.449H30.0953L22.7519 0H30.8013L38.1449 26.449Z",
  },
  {
    x: 37.1087,
    w: 15.393,
    d: "M52.5017 26.449H44.4521L37.1087 0H45.1583L52.5017 26.449Z",
  },
];

// --- the entrance --------------------------------------------------------
/** How far left of its resting place the mark starts, in px. */
const INTRO_TRAVEL = 320;
const INTRO_MS = 1100;
/** Matches the `.hero-mark-in` fade in globals.css. */
const INTRO_EASE = [0.16, 1, 0.3, 1] as const;

// --- the ambient loop ----------------------------------------------------
const CYCLE_MS = 7000;
/** Slow off the mark, fast through the middle, easing into the handover. */
const CYCLE_EASE = [0.45, 0, 0.55, 1] as const;
/** Empty background between marks, as a share of the mark's own width. */
const GAP_SHARE = 0.35;
/**
 * Whole numbers only. The loop is seamless because the strokes are back to
 * their starting widths when the strip has travelled exactly one period; a
 * fractional count leaves them mid-swell and the handover jumps.
 */
const RIPPLES_PER_CYCLE = 2;
/** How far each stroke's width swells either side of its drawn size. */
const WIDTH_RIPPLE = 0.12;
/** Enough copies to cover the widest viewport with one spare off each edge. */
const TILES = 4;

/** A CSS cubic-bezier as a plain function, solved for x by bisection. */
function bezier([x1, y1, x2, y2]: readonly [number, number, number, number]) {
  const axis = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 20; i++) {
      t = (lo + hi) / 2;
      if (axis(x1, x2, t) < x) lo = t;
      else hi = t;
    }
    return axis(y1, y2, t);
  };
}

const easeIntro = bezier(INTRO_EASE);
const easeCycle = bezier(CYCLE_EASE);

export default function HeroV2({ id, content }: VariantProps<"hero">) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const field = fieldRef.current;
    const tiles = tilesRef.current;
    if (!field || tiles.length < TILES) return;

    // Pure CSS sizing, so this only moves on resize.
    let tileWidth = tiles[0].offsetWidth;
    const measure = () => {
      tileWidth = tiles[0].offsetWidth;
    };

    const draw = (elapsed: number, intro: boolean) => {
      const phase = (elapsed % CYCLE_MS) / CYCLE_MS;

      // Each stroke swells on its own offset, so the swell reads as a ripple
      // running left to right through the mark rather than a uniform pulse.
      const scales = SHAPES.map(
        (_, i) =>
          1 +
          WIDTH_RIPPLE *
            Math.sin(
              2 * Math.PI * (RIPPLES_PER_CYCLE * phase - i / SHAPES.length),
            ),
      );
      scales.forEach((s, i) => field.style.setProperty(`--s${i}`, s.toFixed(4)));

      // The period rides the ripple: the mark's right edge is the last stroke's
      // swollen edge, so the gap between copies breathes along with the widths.
      const last = SHAPES[SHAPES.length - 1];
      const extent = last.x + last.w * scales[scales.length - 1];
      const period = ((extent / VIEW_W) * tileWidth) * (1 + GAP_SHARE);

      const offset =
        intro && elapsed < INTRO_MS
          ? -INTRO_TRAVEL * (1 - easeIntro(elapsed / INTRO_MS))
          : 0;
      const travelled = easeCycle(phase);

      for (let i = 0; i < TILES; i++) {
        const x = (i - 1 - travelled) * period + offset;
        tiles[i].style.transform = `translate3d(${x.toFixed(2)}px,-50%,0)`;
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(0, false);
      window.addEventListener("resize", () => {
        measure();
        draw(0, false);
      });
      return;
    }

    let raf = 0;
    let last = 0;
    // Accumulated rather than read off the clock, so a backgrounded tab picks
    // the loop up where it left it instead of snapping forward.
    let elapsed = 0;
    const frame = (now: number) => {
      if (!last) last = now;
      elapsed += Math.min(now - last, 64);
      last = now;
      draw(elapsed, true);
      raf = requestAnimationFrame(frame);
    };
    const play = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const pause = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    draw(0, true);
    play();

    // Nothing to look at once the hero has scrolled off, so stop burning frames.
    const seen = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0 },
    );
    seen.observe(field);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => {
      pause();
      seen.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    // The network section that follows pulls itself up by 25vh so it slides
    // over the tail of the hero. v1 is 220vh tall and has the slack to spare;
    // this one is exactly a screen, so it has to hand that 25vh back or the
    // overlap eats the copy and crops the mark at 75vh.
    <div
      id={id}
      className="relative mb-[25vh] h-screen overflow-hidden bg-background"
    >
      <div
        ref={fieldRef}
        aria-hidden
        className="hero-mark-in pointer-events-none absolute inset-0 overflow-hidden"
      >
        {Array.from({ length: TILES }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) tilesRef.current[i] = el;
            }}
            style={{ transform: "translate3d(0,-50%,0)" }}
            className="absolute top-1/2 left-0 h-[230vw] w-[451vw] will-change-transform sm:h-[150vh] sm:w-[295vh]"
          >
            <svg
              viewBox="0 0 53 27"
              preserveAspectRatio="none"
              className="h-full w-full"
              fill="var(--brand)"
            >
              {SHAPES.map((shape, j) => (
                <path
                  key={j}
                  d={shape.d}
                  // Scaled about the stroke's own left edge. The origin has to
                  // be pinned to the viewBox corner: SVG defaults it to the
                  // middle, which would slide every stroke as it swells.
                  style={{
                    transformOrigin: "0 0",
                    transform: `translate(${shape.x}px) scaleX(var(--s${j},1)) translate(${-shape.x}px)`,
                  }}
                />
              ))}
            </svg>
          </div>
        ))}
      </div>

      <div className="relative flex h-full flex-col">
        <section className="flex flex-1 items-start justify-center px-6 pt-[300px] pb-10 sm:items-center sm:pt-40 sm:pb-16">
          <h1 className="hero-headline-in w-[min(1200px,92vw)] text-[clamp(2.25rem,10vw,5.5rem)] leading-[1.06] font-medium tracking-[-0.035em] sm:text-center sm:text-[clamp(2.5rem,4.9vw,5.5rem)] sm:leading-[1.02]">
            {content.headline}
          </h1>
        </section>
        <section
          id="apply"
          className="hero-copy-in flex flex-col items-center gap-10 px-6 pb-16 sm:gap-6 sm:text-center"
        >
          <p className="w-full max-w-[62ch] text-[15px] leading-[1.5] text-foreground/80 sm:text-[14px] sm:leading-[1.6]">
            {content.body}
          </p>
          <a
            href={content.cta.href}
            className="label label-button inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-3.5 text-white ring-2 ring-background transition-opacity duration-300 ease-out hover:opacity-60"
          >
            {content.cta.label}
            <ArrowUpRight />
          </a>
        </section>
      </div>
    </div>
  );
}
