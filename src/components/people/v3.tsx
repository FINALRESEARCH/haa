"use client";

import { useEffect, useRef, useState } from "react";
import type { Applicant } from "@/content/types";
import type { VariantProps } from "@/variants/types";

/** Enough copies for the track to outrun the widest viewport before it wraps. */
const MIN_PER_SET = 6;

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

function Tile({ applicant }: { applicant: Applicant }) {
  const ref = useRef<HTMLVideoElement>(null);

  // A row duplicates its tiles, so most of them sit off the side of the screen
  // at any moment. Playing those is pure decode cost for pixels nobody sees.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
    <div className="relative h-full shrink-0 overflow-hidden rounded-[10px] bg-foreground/5 [aspect-ratio:3/4]">
      <video
        ref={ref}
        src={applicant.loop}
        poster={applicant.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className="h-full w-full object-cover"
      />
      {applicant.name && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pt-8 pb-2.5">
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

function Row({
  applicants,
  direction,
  shown,
}: {
  applicants: Applicant[];
  /** Which way the tiles travel, not which way the track translates. */
  direction: "left" | "right";
  shown: boolean;
}) {
  const set = fill(applicants);
  // Rendered twice so the -50% wrap lands on an identical frame.
  const tiles = [...set, ...set];

  return (
    <div
      className={`w-full overflow-hidden transition-[opacity,transform] duration-[900ms] ease-out ${
        shown
          ? "translate-x-0 opacity-100"
          : direction === "right"
            ? "-translate-x-[6%] opacity-0"
            : "translate-x-[6%] opacity-0"
      }`}
    >
      <div
        className={`flex w-max gap-4 ${
          direction === "right" ? "marquee-right" : "marquee-left"
        }`}
        style={{ height: "clamp(260px, 46vh, 520px)" }}
      >
        {tiles.map((applicant, i) => (
          <Tile key={`${applicant.loop}-${i}`} applicant={applicant} />
        ))}
      </div>
    </div>
  );
}

/**
 * The applicants as a single row drifting under the copy. Adapted from the
 * partners marquee — same pinned screen, same drift — but one row rather than
 * two, so each tile is large enough to read a face in rather than a thumbnail.
 */
export default function PeopleMarqueeV3({ id, content }: VariantProps<"people">) {
  const sectionRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div id={id} className="h-[200vh]">
      <section
        ref={sectionRef}
        className="sticky top-0 flex h-screen flex-col items-center justify-center gap-[7vh] overflow-hidden bg-background"
      >
        <div
          className={`px-6 text-center transition-opacity duration-700 ease-out ${
            shown ? "opacity-100 delay-200" : "opacity-0"
          }`}
        >
          <h2 className="text-[clamp(1.5rem,3.45vw,3.9rem)] leading-[1.05] font-medium tracking-[-0.035em]">
            {content.heading}
          </h2>
          <div className="mx-auto mt-4 max-w-[56ch] space-y-2 text-[clamp(0.9rem,1.1vw,1.05rem)] leading-[1.5] tracking-[-0.01em] text-foreground/75">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <Row applicants={content.applicants} direction="right" shown={shown} />
      </section>
    </div>
  );
}
