import type { ProgramContent, ScheduleEvent } from "@/content/types";

/**
 * Everything the year grid and the day view agree on, kept in one place so the
 * two layouts that compose them — `v2` in the page, `v3` as an overlay — cannot
 * drift apart.
 */

export const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/** A Sunday, so the grid's first column starts on one. 52 columns of 7. */
export const YEAR_START = Date.UTC(2026, 0, 4);
export const SQUARES = 364;
export const WEEKS = SQUARES / 7;
/** Shared by the month labels and the squares, so the two rows agree. */
export const COLUMN_TRACK = `repeat(${WEEKS}, minmax(0, 1fr))`;
/** Opens on a day mid-year, as the original did — a Wednesday in April. */
export const OPENING_SQUARE = 113;

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * The ramp the squares are painted with. Level 0 is the page's own grey; the
 * rest climb through the brand colour. The original build used GitHub's green,
 * which reads as the motif more literally — swap this array if the reference to
 * GitHub turns out to matter more than sitting inside the site's palette.
 */
export const LEVELS = [
  "color-mix(in srgb, var(--foreground) 7%, transparent)",
  "color-mix(in srgb, var(--brand) 24%, transparent)",
  "color-mix(in srgb, var(--brand) 46%, transparent)",
  "color-mix(in srgb, var(--brand) 70%, transparent)",
  "var(--brand)",
];

/**
 * How far the squares fly on their way out. Applied to the grid alone rather
 * than to the whole card, which is what lets them cross the panel's edge
 * instead of being magnified inside it.
 */
export const BURST = 6;

/**
 * The strip's falloff. A mask on the scroller rather than opacity per card, so
 * the photographs dissolve into the edges of the run instead of each fading
 * uniformly in place. The left edge fades over a short distance — it stops
 * just clear of the copy beside it — while the right runs off the screen.
 */
export const STRIP_MASK =
  "linear-gradient(to right, transparent 0px, #000 56px, #000 84%, transparent 100%)";

/** Roughly what the time and the title add under each photograph. */
export const CAPTION_HEIGHT = 66;

/** Decimal hours to a clock face: 16.5 becomes "4:30 PM". */
export const time = (n: number) => {
  const hour = Math.floor(n);
  return `${hour % 12 || 12}:${n % 1 ? "30" : "00"} ${hour >= 12 ? "PM" : "AM"}`;
};

export type Square = {
  index: number;
  /** 0 = Sunday … 6 = Saturday, matching `Date#getUTCDay`. */
  weekday: number;
  week: number;
  month: number;
  date: number;
  level: number;
};

/**
 * The illustrative year. Weekends are mostly empty with the occasional light
 * square; weekdays take a hashed level between 1 and 4 so the grid varies the
 * way a real one does. It is decorative, and the label above it says so.
 */
export const buildYear = (): Square[] =>
  Array.from({ length: SQUARES }, (_, i) => {
    const date = new Date(YEAR_START + i * 86_400_000);
    const weekday = date.getUTCDay();
    const week = Math.floor(i / 7);
    const weekend = weekday === 0 || weekday === 6;
    return {
      index: i,
      weekday,
      week,
      month: date.getUTCMonth(),
      date: date.getUTCDate(),
      level: weekend
        ? (week * 3 + weekday) % 5 === 0
          ? 1
          : 0
        : 1 + ((Math.imul(i + 7, 2_654_435_761) >>> 8) % 4),
    };
  });

export const isWeekend = (square: Square) =>
  square.weekday === 0 || square.weekday === 6;

/** The day's blocks in clock order, or the single open-day card. */
export function eventsFor(
  content: ProgramContent,
  square: Square,
): ScheduleEvent[] {
  if (isWeekend(square)) return [content.openDay];
  return content.schedule
    .filter((event) => event.day === square.weekday - 1)
    .sort((a, b) => a.start - b.start);
}

export const dateLineFor = (square: Square) =>
  `${WEEKDAY_NAMES[square.weekday]}, ${MONTH_NAMES[square.month]} ${
    square.date
  } / Example week ${square.week + 1}`;

export const squareLabel = (square: Square) =>
  `${WEEKDAY_NAMES[square.weekday]}, ${MONTH_NAMES[square.month]} ${square.date}`;
