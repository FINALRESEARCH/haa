"use client";

import Image from "next/image";
import { type RefObject, useEffect, useRef } from "react";
import type { ProgramContent, ScheduleEvent } from "@/content/types";
import { dateLineFor, isWeekend, type Square, STRIP_MASK, time } from "./schedule";

type Props = {
  content: ProgramContent;
  square: Square;
  events: ScheduleEvent[];
  onClose: () => void;
  backRef: RefObject<HTMLButtonElement | null>;
};

/**
 * One day, as a run of photographs beside its copy.
 *
 * Two columns: the day's date, title and description hold the left third and
 * stay put, while the photographs run off the right edge of the screen. The
 * earlier version put the copy above a full-bleed strip, which made the view
 * nearly three times the height of the year card it replaces — the point of
 * the split is that this one is about the same height, so the section barely
 * changes shape when a day opens.
 *
 * The frames are flat. An earlier pass carried the original build's rotated
 * perspective carousel; without it there is no privileged centre frame, so
 * every photograph keeps its own caption.
 */
export default function DayView({
  content,
  square,
  events,
  onClose,
  backRef,
}: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  // Escape leaves. Arrow keys are the scroller's own job once it has focus.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /**
   * Pointer dragging on top of native scrolling rather than instead of it.
   * The scroller already handles the wheel, the trackpad, touch momentum and
   * the keyboard; this only adds the one thing it has no answer for, which is
   * a mouse user pulling the row sideways.
   *
   * The row scrolls freely rather than snapping. With `scroll-snap-align` on
   * every frame the last one's snap position sits past the scroller's maximum
   * scroll — unreachable — so the browser fell back to an earlier frame and
   * the run stuck short of the end with the final photograph still half off
   * the screen.
   */
  const from = useRef({ x: 0, left: 0 });
  /** A ref, not state: a drag should not re-render the row on every move. */
  const dragging = useRef(false);

  const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = scroller.current;
    if (!el) return;
    from.current = { x: event.clientX, left: el.scrollLeft };
    dragging.current = true;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}
  };

  const onDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!dragging.current || !el) return;
    el.scrollLeft = from.current.left - (event.clientX - from.current.x);
  };

  const onDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    // Guarded: it throws when the pointer is already gone, which is exactly
    // the case on `pointercancel`.
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
      <div className="shrink-0 lg:w-[min(32%,420px)]">
        <button
          ref={backRef}
          type="button"
          onClick={onClose}
          className="label text-brand transition-opacity duration-300 hover:opacity-60"
        >
          ← Back to the year
        </button>
        <p className="label mt-4 text-foreground/45">{dateLineFor(square)}</p>
        <h3 className="mt-2 text-[clamp(1.3rem,2.4vw,2.2rem)] font-medium leading-[1.1] tracking-[-0.03em]">
          {content.dayTitle}
        </h3>
        <p className="mt-3 text-[clamp(0.9rem,1.1vw,1.05rem)] leading-[1.45] text-foreground/70">
          {isWeekend(square) ? content.weekendBody : content.weekdayBody}
        </p>
      </div>

      {/*
       * `margin-right` pulls the run out to the right edge of the viewport
       * from inside a centred container, so the last photographs leave the
       * screen rather than stopping at the container's edge. The mask fades
       * both ends of the run: a short one on the left that lands just clear of
       * the copy, and a long one on the right that carries it off screen.
       */}
      <div
        ref={scroller}
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        style={{
          WebkitMaskImage: STRIP_MASK,
          maskImage: STRIP_MASK,
          scrollbarWidth: "none",
        }}
        className="mr-[calc(50%-50vw)] flex min-w-0 flex-1 gap-4 overflow-x-auto overscroll-x-contain py-1 pr-[16vw] pl-14 [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event) => (
          <figure
            key={`${event.day}-${event.start}`}
            className="w-[clamp(260px,27vw,400px)] shrink-0 select-none"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-panel">
              <Image
                src={event.image.src}
                alt={event.image.alt}
                fill
                sizes="(max-width: 1024px) 70vw, 400px"
                className="object-cover"
                draggable={false}
              />
            </div>
            <figcaption className="mt-3">
              <span className="label text-foreground/45">
                {time(event.start)} — {time(event.end)}
              </span>
              <h4 className="mt-1 text-[1.05rem] font-medium tracking-[-0.02em]">
                {event.title}
              </h4>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
