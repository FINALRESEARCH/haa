"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import ApplicantModal from "./ApplicantModal";
import type { Applicant } from "@/content/types";

/** Enough copies for the track to outrun the widest viewport before it wraps. */
const MIN_PER_SET = 6;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Tracks the preference live, and reads `false` on the server. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * Pads the delivered applicants out to a full row. Six are on the way; until
 * they land the four we have cycle, which is what the row does anyway once it
 * wraps — the repeat just starts sooner.
 */
function fill(applicants: Applicant[]): Applicant[] {
  if (!applicants.length) return [];
  // Whole cycles only. Truncating mid-cycle would show the first faces more
  // often than the last, which is exactly how a short loop gives itself away.
  const cycles = Math.ceil(MIN_PER_SET / applicants.length);
  return Array.from({ length: cycles }, () => applicants).flat();
}

function Tile({
  applicant,
  playing,
  highlighted,
  dimmed,
  onEnter,
  onLeave,
  onOpen,
}: {
  applicant: Applicant;
  /** The row is idle, or this is the one tile the pointer is on. */
  playing: boolean;
  /**
   * The pointer is on *this* tile. Deliberately not `playing`: an idle row
   * plays every tile, and reusing that flag here put the highlight ring on all
   * sixteen of them, flashing the whole row on and off with every hover.
   */
  highlighted: boolean;
  /** Another tile in the row is hovered, so this one steps back. */
  dimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const still = usePrefersReducedMotion();
  // No full interview on Mux yet means nothing to open, so the tile stays inert
  // rather than advertising a click that opens an empty modal.
  const openable = Boolean(applicant.video);

  // A row duplicates its tiles, so most of them sit off the side of the screen
  // at any moment. Playing those is pure decode cost for pixels nobody sees.
  //
  // Watching is separate from playing on purpose. Rebuilding the observer every
  // time the hover moved tore down and re-armed all sixteen of these at once,
  // and an interrupted `play()` on a `preload="none"` video drops the tile back
  // to its poster — which read as the row blinking.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (visible && playing && !still) void video.play().catch(() => {});
    else video.pause();
  }, [visible, playing, still]);

  return (
    <div
      // The pointer handlers sit on the wrapper rather than the button so the
      // row still reacts under an unopenable tile.
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      // `isolate` keeps the overlays in this tile's own stacking context rather
      // than letting them compete with the video's compositing layer, which is
      // what made the border and the caption blink in and out in Safari.
      className={`relative isolate h-full shrink-0 overflow-hidden rounded-[10px] bg-foreground/5 transition-[opacity,transform] duration-300 ease-out [aspect-ratio:3/4] [backface-visibility:hidden] ${
        dimmed ? "scale-[0.97] opacity-70" : "scale-100 opacity-100"
      }`}
    >
      <video
        ref={ref}
        src={applicant.loop}
        poster={applicant.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        // The radius lives here as well as on the tile. WebKit clips a
        // composited video layer to its own bounds, not to the rounded corners
        // of an ancestor, so relying on the parent's `overflow-hidden` alone
        // costs a rounded-rect clip of a moving layer on every frame.
        //
        // The blur sits on the video rather than the tile on purpose: a filter
        // on the tile would blur the border and the caption with it, and would
        // pull both back into the filtered layer the Safari fix just got them
        // out of. The slight scale-up hides the transparent edge a blur leaves
        // behind, which would otherwise show the tile's backing through it.
        className={`h-full w-full rounded-[10px] object-cover transition-[filter,transform] duration-500 ease-out ${
          dimmed ? "scale-[1.03] blur-[3px]" : "scale-100 blur-0"
        }`}
      />

      {openable && (
        <button
          type="button"
          onClick={onOpen}
          // The accessible name carries the pursuit too: on its own, "Play
          // Elle Liemandt" says nothing about what the video is.
          aria-label={`Play ${applicant.name}’s interview${
            applicant.pursuit ? ` — ${applicant.pursuit}` : ""
          }`}
          // `translateZ(0)` promotes the border into its own layer above the
          // video's, instead of being repainted into a layer WebKit is already
          // re-rasterising every frame under the marquee's transform.
          className="absolute inset-0 z-10 cursor-pointer rounded-[10px] transition-[box-shadow] duration-300 ease-out [transform:translateZ(0)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          style={
            highlighted
              ? { boxShadow: "inset 0 0 0 2px var(--color-brand)" }
              : undefined
          }
        />
      )}

      {applicant.name && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/55 to-transparent px-3 pt-8 pb-2.5 transition-opacity duration-300 ease-out [transform:translateZ(0)] ${
            dimmed ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="text-[12px] leading-tight font-medium text-white">
            {applicant.name}
          </p>
          {applicant.pursuit && (
            <p className="mt-0.5 text-[11px] leading-tight text-white/70">
              {applicant.pursuit}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApplicantRow({
  applicants,
  direction = "right",
}: {
  applicants: Applicant[];
  /** Which way the tiles travel, not which way the track translates. */
  direction?: "left" | "right";
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [inRow, setInRow] = useState(false);
  const [open, setOpen] = useState<Applicant | null>(null);
  const still = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setShown(true),
      { threshold: 0.2 },
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const set = fill(applicants);
  // Rendered twice so the -50% wrap lands on an identical frame.
  const tiles = [...set, ...set];
  // Owned by the row, not by whichever tile happens to be under the pointer.
  // There is a 16px gap between tiles — about 7% of the row's width — and
  // pausing per-tile meant every crossing of one resumed the drift for a few
  // frames, flashing the whole row back to its idle state on the way past.
  // Held by the modal too: a video drifting behind a modal is just noise.
  const paused = inRow || open !== null;

  // Three phases, once per page load: parked until the section is scrolled to,
  // then the arrival, then the endless drift. Anyone who has asked for less
  // motion skips the middle one — the intro keyframes are off for them anyway.
  const phase = !shown ? "parked" : arrived || still ? "looping" : "arriving";
  const track =
    phase === "parked"
      ? `marquee-${direction}-parked`
      : phase === "arriving"
        ? `marquee-${direction}-intro`
        : `marquee-${direction}`;

  return (
    <>
      <div
        ref={wrapRef}
        // Only a fade now. The displacement used to live here, and it fought
        // the arrival for the same 900ms — the track's own run-in carries the
        // movement, so this just brings the tiles up out of the page.
        // Deliberately shorter than the run-in: the tiles need to be solid
        // while they are still moving, or the entrance is a fade with some
        // movement hidden inside it rather than a row flying into place.
        className={`w-full overflow-hidden transition-opacity duration-[250ms] ease-out ${
          shown || still ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          onPointerEnter={() => setInRow(true)}
          onPointerLeave={() => {
            setInRow(false);
            setHovered(null);
          }}
          // `will-change` gets the track its compositing layer once, up front.
          // Without it WebKit tears the layer down and rebuilds it whenever the
          // animation is paused and resumed — which is every hover.
          className={`flex w-max gap-4 [will-change:transform] ${track}`}
          // The run-in hands over to the loop on its own `animationend`, which
          // is the only moment the two are guaranteed to agree on where the
          // track is.
          onAnimationEnd={(event) => {
            if (event.currentTarget === event.target) setArrived(true);
          }}
          // Pausing the animation rather than clearing it keeps the track
          // wherever it had drifted to, so the row resumes instead of jumping.
          style={
            {
              height: "clamp(260px, 46vh, 520px)",
              animationPlayState: paused ? "paused" : "running",
              // How far the run-in travels: three cards. Every tile in the
              // track is the same width, so three of them is 3/n of it — which
              // keeps the arrival three cards long whatever the viewport does,
              // and however many applicants the client ends up delivering.
              "--intro-shift": `${((3 / tiles.length) * 100).toFixed(3)}%`,
            } as CSSProperties
          }
        >
          {tiles.map((applicant, i) => (
            <Tile
              key={`${applicant.loop}-${i}`}
              applicant={applicant}
              playing={hovered === null || hovered === i}
              highlighted={hovered === i}
              dimmed={hovered !== null && hovered !== i}
              onEnter={() => setHovered(i)}
              onLeave={() => setHovered((current) => (current === i ? null : current))}
              onOpen={() => setOpen(applicant)}
            />
          ))}
        </div>
      </div>

      {open && <ApplicantModal applicant={open} onClose={() => setOpen(null)} />}
    </>
  );
}
