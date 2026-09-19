"use client";

import { type RefObject, useState } from "react";
import type { ProgramContent } from "@/content/types";
import {
  BURST,
  COLUMN_TRACK,
  LEVELS,
  MONTH_NAMES,
  SQUARES,
  type Square,
  squareLabel,
  WEEKDAY_NAMES,
} from "./schedule";

type Props = {
  content: ProgramContent;
  year: Square[];
  /** The week each month opens in, so its label lands over its own squares. */
  monthStarts: number[];
  selected: number;
  /** True once a day has been opened: the grid is on its way out. */
  leaving: boolean;
  still: boolean;
  gridRef: RefObject<HTMLDivElement | null>;
  onOpen: (index: number) => void;
  onSelect: (index: number) => void;
};

/**
 * The year, as a GitHub contribution grid.
 *
 * On the way out the squares do not zoom *inside* the card — they leave it.
 * The panel behind them, and the chrome around them, fade roughly in place
 * while the grid alone scales from whichever square was clicked and crosses
 * the panel's edge on its way off screen. Nothing between the grid and the
 * page clips, which is the whole point: an earlier version wrapped this in
 * `overflow-hidden` to make the zoom read as going *into* the card, and that
 * clip is exactly what had to go.
 */
export default function YearGrid({
  content,
  year,
  monthStarts,
  selected,
  leaving,
  still,
  gridRef,
  onOpen,
  onSelect,
}: Props) {
  /** Where the squares fly from: the clicked square's centre, in grid space. */
  const [origin, setOrigin] = useState("50% 50%");

  const open = (index: number) => {
    const grid = gridRef.current;
    const cell = grid?.children[index] as HTMLElement | undefined;
    if (grid && cell) {
      // Measured rather than read off `offsetLeft`, so a horizontally
      // scrolled grid still flies from the square the pointer actually hit.
      const gridBox = grid.getBoundingClientRect();
      const cellBox = cell.getBoundingClientRect();
      setOrigin(
        `${cellBox.left - gridBox.left + cellBox.width / 2}px ${
          cellBox.top - gridBox.top + cellBox.height / 2
        }px`,
      );
    }
    onOpen(index);
  };

  const onGridKey = (event: React.KeyboardEvent, index: number) => {
    const offset = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1 }[
      event.key
    ];
    if (!offset) return;
    event.preventDefault();
    const next = Math.min(Math.max(index + offset, 0), SQUARES - 1);
    onSelect(next);
    (gridRef.current?.children[next] as HTMLElement | undefined)?.focus();
  };

  /** The panel and everything that is not a square: leaves without moving. */
  const chrome = {
    opacity: leaving ? 0 : 1,
    transitionDuration: still ? "0ms" : undefined,
  };

  return (
    <div className="relative">
      {/*
       * The plate is its own element rather than a background on the card, so
       * it can fade out from under the squares while they are still flying.
       */}
      <div
        aria-hidden
        style={chrome}
        className="absolute inset-0 rounded-[12px] border border-rule bg-panel transition-opacity duration-[380ms] ease-out"
      />

      <div className="relative p-6 sm:p-9">
        <div
          style={chrome}
          className="label flex items-center justify-between text-foreground/40 transition-opacity duration-[380ms] ease-out"
        >
          <span>{content.gridLabel}</span>
        </div>

        {/*
         * Scrolls sideways on a narrow screen, but `overflow-x: auto` clips on
         * both axes — so it is released the moment the squares start to leave,
         * or they would be cropped at the card's edge on the way out.
         */}
        <div
          style={{ overflowX: leaving ? "visible" : "auto" }}
          className="mt-5 pb-1"
        >
          {/*
           * One flex row so the month labels and the squares share a left
           * edge, and one 52-column track so they share a horizontal scale.
           * The old header was twelve equal slices of the card while the grid
           * was 52 fixed-width squares, which is why the squares ran out under
           * "Sep": the two rows were never on the same system.
           */}
          <div className="flex min-w-[620px] gap-2">
            <div className="flex w-[28px] shrink-0 flex-col gap-1.5">
              <span className="h-[12px]" aria-hidden />
              <div
                style={chrome}
                className="grid flex-1 grid-rows-7 items-center gap-[5px] text-[10px] leading-none text-foreground/40 transition-opacity duration-[380ms] ease-out"
              >
                {WEEKDAY_NAMES.map((name, n) => (
                  <span key={name}>
                    {n === 1 || n === 3 || n === 5 ? name.slice(0, 3) : ""}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <div
                style={{ ...chrome, gridTemplateColumns: COLUMN_TRACK }}
                className="grid h-[12px] text-[10px] leading-none text-foreground/40 transition-opacity duration-[380ms] ease-out"
                aria-hidden
              >
                {monthStarts.map((week, month) => (
                  <span
                    key={MONTH_NAMES[month]}
                    style={{ gridColumnStart: week + 1 }}
                    className="whitespace-nowrap"
                  >
                    {MONTH_NAMES[month].slice(0, 3)}
                  </span>
                ))}
              </div>

              <div
                ref={gridRef}
                style={{
                  gridTemplateColumns: COLUMN_TRACK,
                  gridTemplateRows: "repeat(7, minmax(0, 1fr))",
                  transformOrigin: origin,
                  transform:
                    leaving && !still ? `scale(${BURST})` : "scale(1)",
                  opacity: leaving ? 0 : 1,
                  transitionDuration: still ? "0ms" : undefined,
                }}
                className="grid grid-flow-col gap-[5px] transition-[transform,opacity] duration-[620ms] ease-[cubic-bezier(.4,0,.2,1)] will-change-[transform,opacity]"
                aria-label="An illustrative year of daily Academy activity"
              >
                {year.map((day) => (
                  <button
                    key={day.index}
                    type="button"
                    tabIndex={day.index === selected ? 0 : -1}
                    onClick={() => open(day.index)}
                    onKeyDown={(event) => onGridKey(event, day.index)}
                    style={{ background: LEVELS[day.level] }}
                    aria-label={squareLabel(day)}
                    title={`${squareLabel(day)} · View the day`}
                    className="aspect-square w-full rounded-[3px] outline-offset-2 transition-transform duration-150 hover:scale-[1.3] focus-visible:outline-2 focus-visible:outline-foreground"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={chrome}
          className="mt-5 flex items-center justify-between gap-4 text-[11px] text-foreground/45 transition-opacity duration-[380ms] ease-out"
        >
          <span>{content.gridSummary}</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {LEVELS.map((tint) => (
              <i
                key={tint}
                style={{ background: tint }}
                className="size-[11px] rounded-[2px]"
                aria-hidden
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
