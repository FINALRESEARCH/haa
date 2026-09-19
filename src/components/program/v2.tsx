"use client";

import { useEffect, useRef, useState } from "react";
import type { VariantProps } from "@/variants/types";
import DayView from "./DayView";
import {
  buildYear,
  clamp,
  eventsFor,
  MONTH_NAMES,
  OPENING_SQUARE,
} from "./schedule";
import YearGrid from "./YearGrid";

/**
 * The year, and then one day inside it — both in the page.
 *
 * The stage always reserves the height the day view will need, and the year
 * grid floats in the middle of it. Opening a day therefore changes nothing
 * about the page's height or the position of anything below: the photographs
 * simply arrive on the same centre line the grid was sitting on. The earlier
 * version sized the stage to whichever pane was showing, so opening a day grew
 * the section from 338px to 941px and pushed the photographs down the screen.
 *
 * Ported from the Cloudflare build (`site/script.js`) with its two scroll
 * couplings removed: there the section was pinned for roughly five viewport
 * heights and scroll progress drove both the zoom and the carousel. Here the
 * exit runs on its own timer and the carousel is driven by index, so the
 * section is a normal screen in flow and nothing is scroll-jacked.
 */

export default function ProgramV2({ id, content }: VariantProps<"program">) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  // Left unmemoized on purpose: the React Compiler is on for this project and
  // rejects hand-written memoization, so it caches this call itself.
  const year = buildYear();

  const [selected, setSelected] = useState(OPENING_SQUARE);
  const [open, setOpen] = useState(false);
  const [still, setStill] = useState(false);

  /** The week each month opens in, so its label lands over its own squares. */
  const monthStarts = MONTH_NAMES.map(
    (_, month) => year.find((day) => day.month === month)?.week ?? 0,
  );

  const square = year[selected];
  const events = eventsFor(content, square);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // The per-block fade-in the section above uses, kept so this screen arrives
  // the same way the rest of the page does.
  useEffect(() => {
    const els = Array.from(
      sectionRef.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [],
    );
    if (!els.length) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of els) {
        const { top } = el.getBoundingClientRect();
        el.style.opacity = `${clamp((vh * 0.92 - top) / (vh * 0.12))}`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /**
   * Focus follows the pane. Both moves have to wait for the commit that clears
   * `inert` on the pane being entered — focusing an inert subtree is a no-op,
   * which silently dropped focus to the body on the way back out.
   */
  const opened = useRef(false);
  useEffect(() => {
    if (open) {
      opened.current = true;
      // `preventScroll`: focusing scrolls the element into view by
      // default, which would move the page out from under a layout whose
      // whole point is that opening a day shifts nothing.
      backRef.current?.focus({ preventScroll: true });
      return;
    }
    // Skip the first run, or the page would steal focus into the grid on load.
    if (!opened.current) return;
    (gridRef.current?.children[selected] as HTMLElement | undefined)?.focus({
      preventScroll: true,
    });
  }, [open, selected]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative flex flex-col items-center gap-12 overflow-x-clip bg-background px-6 pt-[6vh] pb-[10vh]"
    >
      <div
        data-reveal
        className="w-[92vw] text-center opacity-0 will-change-[opacity]"
      >
        <h2 className="text-[clamp(1.65rem,3.4vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.035em]">
          {content.heading}
        </h2>
        <p className="mt-3 text-[clamp(0.85rem,1vw,1rem)] font-medium">
          {content.subheading}
        </p>
      </div>

      {/*
       * Both panes share one grid cell, so the stage is exactly as tall as the
       * taller of them and both sit on its centre line — no measuring, and no
       * way for a pane to outgrow the box and overlap the heading above, which
       * is what happened while the height came from a `ResizeObserver` that
       * could lag a reflow.
       *
       * `grid-cols-1` is load-bearing. An implicit column is `auto`, whose max
       * is `max-content`, and `max-content` is not clamped to the container —
       * so the column sized itself to the day's photographs laid end to end
       * and dragged the year card out to match, blowing the squares up and
       * pushing December off the page. A `minmax(0, 1fr)` column cannot.
       *
       * Nothing here clips: the squares have to be able to leave the card on
       * their way out, and the photographs run off the right of the screen.
       */}
      <div
        data-reveal
        className="grid grid-cols-1 w-[min(1560px,94vw)] opacity-0 will-change-[opacity]"
      >
        <div
          inert={open}
          style={{ pointerEvents: open ? "none" : undefined }}
          className="col-start-1 row-start-1 min-w-0 self-center"
        >
          <YearGrid
            content={content}
            year={year}
            monthStarts={monthStarts}
            selected={selected}
            leaving={open}
            still={still}
            gridRef={gridRef}
            onOpen={(index) => {
              setSelected(index);
              setOpen(true);
            }}
            onSelect={setSelected}
          />
        </div>

        <div
          inert={!open}
          aria-live="polite"
          style={{
            opacity: open ? 1 : 0,
            transform: open || still ? "none" : "translateY(24px)",
            transitionDuration: still ? "0ms" : undefined,
            // Lets the squares get clear of the card before the day arrives.
            transitionDelay: open && !still ? "160ms" : "0ms",
          }}
          className="col-start-1 row-start-1 min-w-0 self-center transition-[transform,opacity] duration-[460ms] ease-[cubic-bezier(.2,.7,.2,1)] will-change-[transform,opacity]"
        >
          <DayView
            key={square.index}
            content={content}
            square={square}
            events={events}
            onClose={() => setOpen(false)}
            backRef={backRef}
          />
        </div>
      </div>

      <div data-reveal className="opacity-0 will-change-[opacity]">
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
