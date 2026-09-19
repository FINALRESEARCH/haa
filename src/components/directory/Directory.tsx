"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ArrowUpRight from "@/components/ArrowUpRight";
import type {
  DirectoryColumn,
  DirectoryEntry,
  DirectoryEyebrow,
  DirectoryFilterGroup,
  DirectoryVariant,
} from "./types";

/**
 * The thumbnail column, and where the column after it therefore begins. Both
 * stay put while the rest of the table scrolls sideways, so the second one
 * has to be offset by exactly the width of the first — hence one constant
 * rather than two numbers that can drift apart.
 */
const THUMB = 64;

/** The filter menus' width, needed in JS because they are positioned there. */
const MENU_WIDTH = 220;

/** One shared empty list, so an unfiltered group is a stable prop. */
const EMPTY: string[] = [];

/** How long the pinned picture takes to cross-fade to the next row's. */
const FADE_MS = 220;

/**
 * Slack, in pixels, on "has this row reached the line". Scroll positions are
 * fractional and a smooth scroll lands on one, so a row asked to be exactly
 * on the line arrives a third of a pixel above it.
 */
const SLACK = 1;

type Props = {
  /** The small line over the heading: "The HAA Network". */
  eyebrow?: string;
  heading: string;
  intro: string[];
  columns: DirectoryColumn[];
  entries: DirectoryEntry[];
  filters: DirectoryFilterGroup[];
  /** Plural noun for the count: "people", "courses". */
  unit: string;
  /** Printed when both filters together match nothing. */
  emptyLabel: string;
};

export default function Directory({
  eyebrow,
  heading,
  intro,
  columns,
  entries,
  filters,
  unit,
  emptyLabel,
}: Props) {
  // Tags picked per group, an empty list meaning "all of them". Two
  // independent filters rather than one combined list: the brief filters by
  // relationship *and* by field, and the pair narrows. Within a group the
  // tags widen — "Mentors or Investors" is a question worth asking, where
  // "Mentors and Investors" would mostly return nobody.
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  // Which of the two filter arrangements is on show. Local to the session on
  // purpose: it is a thing to look at next to the other one and decide
  // between, not a preference anybody is meant to keep.
  const [variant, setVariant] = useState<DirectoryVariant>("headers");
  // Columns switched off, by id. Any of them, in any combination, including
  // the first — so the row's own identity has to be conditional too.
  const [off, setOff] = useState<Record<string, boolean>>({});
  const [eyebrowStyle, setEyebrowStyle] = useState<DirectoryEyebrow>("label");
  const [active, setActive] = useState(0);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const list = useRef<HTMLDivElement | null>(null);
  const head = useRef<HTMLDivElement | null>(null);
  // The header's grid, which has to be slid sideways by hand now that it is
  // not inside the thing that scrolls sideways.
  const track = useRef<HTMLDivElement | null>(null);

  /**
   * How far down the box a row has to sit to be the one on show: under the
   * table's own sticky header, which is what would otherwise be covering it.
   *
   * Measured rather than declared. The header's height is a line of text plus
   * its padding, so it moves with the type scale, and it is zero below `lg`
   * where the header isn't rendered at all. A hard-coded guess a few pixels
   * out is exactly the drift that reads as a row snapping to the wrong place.
   */
  const lineRef = useRef(0);
  // The same number, in a form the rows can render with: each one reserves it
  // as scroll margin so that snapping brings it to rest under the header
  // rather than under the top of the box, which is behind the header.
  const [gutter, setGutter] = useState(0);
  /**
   * Whether the list is at rest. Nothing is marked mid-scroll: the mark means
   * "this is the row in the picture", and during a scroll that is not true of
   * any row — the list is between answers. So it drops away as soon as the
   * list moves and comes back on the row it lands on, which is also what
   * keeps the picture from flicking through fifty faces on one flick of the
   * wheel, since `active` is only ever recomputed once the scrolling stops.
   */
  const [settled, setSettled] = useState(true);
  /**
   * Whether the list is allowed to scroll inside itself yet.
   *
   * It isn't until the whole box is on screen. Otherwise a wheel over a table
   * that is still half below the fold starts scrolling rows that cannot be
   * seen, and the page never comes down to meet it — the reader ends up part
   * way into a list they are only part way looking at. Until then the box
   * simply doesn't scroll, so the wheel does what it would have done anyway
   * and moves the page.
   */
  const [reachable, setReachable] = useState(false);

  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const watcher = new IntersectionObserver(
      ([entry]) => setReachable(entry.intersectionRatio >= 0.99),
      // Not `1`: a box whose height lands on a fraction of a pixel never
      // reports as fully visible, and the table would never wake up.
      { threshold: [0, 0.99] },
    );
    watcher.observe(root);
    return () => watcher.disconnect();
  }, []);

  const shown = useMemo(
    () =>
      entries.filter((entry) =>
        filters.every((group) => {
          const picked = selected[group.id];
          if (!picked?.length) return true;
          return entry.tags.some(
            (tag) => tag.group === group.id && picked.includes(tag.value),
          );
        }),
      ),
    [entries, filters, selected],
  );

  /**
   * The cycling: whichever row has reached the line is the row on show.
   *
   * Read straight off the scroll position rather than watched with an
   * IntersectionObserver. An observer only reports the rows that are inside
   * its band at the moment it runs, and it runs on frame boundaries — so a
   * flick of the wheel sends rows clean through the band between two ticks,
   * nothing reports, and the mark stays behind on a row that has long since
   * scrolled away. Scroll position cannot skip: whatever the list did between
   * frames, the answer afterwards is still just arithmetic.
   *
   * `offsetTop` is measured against the box, which is why the box is
   * positioned, and it is cached because reading it per row per frame is 200
   * forced layouts a frame.
   */
  const tops = useRef<number[]>([]);

  useEffect(() => {
    const root = list.current;
    if (!root) return;

    // Filtering can shorten the list; without this the refs array keeps the
    // rows that were just unmounted and the offsets of a list that is gone.
    rowRefs.current.length = shown.length;

    let timer = 0;
    // The table scrolls sideways too, and a sideways scroll changes nothing
    // about which row is at the top. Without this it would drop the mark and
    // put it straight back on the same row, which reads as a blink.
    let last = root.scrollTop;
    /**
     * Whether the browser will tell us when a scroll has finished. Where it
     * won't, a timer stands in.
     */
    const native = "onscrollend" in window;

    const measure = () => {
      lineRef.current = head.current?.offsetHeight ?? 0;
      tops.current = rowRefs.current.map((row) => row?.offsetTop ?? 0);
      setGutter((was) => (was === lineRef.current ? was : lineRef.current));
    };

    /** Which row has reached the line — arithmetic, so it cannot skip one. */
    const settle = () => {
      const reached = root.scrollTop + lineRef.current + SLACK;
      let next = 0;
      for (let index = 0; index < tops.current.length; index += 1) {
        if (tops.current[index] > reached) break;
        next = index;
      }
      setActive(next);
      setSettled(true);
      last = root.scrollTop;
    };

    /** Keeps the header's columns over the columns they name. */
    const slide = () => {
      const grid = track.current;
      if (!grid) return;
      grid.style.transform = `translateX(${-root.scrollLeft}px)`;
      // The two that stay put: slid back by exactly what the grid was slid by,
      // which is what `position: sticky` was doing for them before.
      for (const pin of grid.querySelectorAll<HTMLElement>("[data-pin]")) {
        pin.style.transform = `translateX(${root.scrollLeft}px)`;
      }
    };

    const onScroll = () => {
      slide();
      if (root.scrollTop === last) return;
      last = root.scrollTop;
      setSettled(false);
      if (native) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 80);
    };

    const onResize = () => {
      measure();
      settle();
    };

    measure();
    settle();
    slide();
    root.addEventListener("scroll", onScroll, { passive: true });
    // `scrollend` fires after the snap has finished, which a timer can only
    // guess at — it would otherwise be as likely to fire mid-glide and put
    // the mark on a row the list is about to slide past.
    if (native) root.addEventListener("scrollend", settle);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      root.removeEventListener("scroll", onScroll);
      if (native) root.removeEventListener("scrollend", settle);
      window.removeEventListener("resize", onResize);
    };
  }, [shown]);

  /**
   * At the top of the list, keep scrolling up and the page goes with you.
   *
   * `overscroll-behavior: auto` is meant to do this on its own, but browsers
   * latch a gesture to whichever scroller it started on: once the wheel is
   * driving the list, reaching the top of it stops everything dead until you
   * lift off and start again. Here the wheel is simply handed to the page
   * instead, so carrying on upwards carries on upwards.
   */
  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY >= 0 || root.scrollTop > 0) return;
      event.preventDefault();
      window.scrollBy({ top: event.deltaY, behavior: "auto" });
    };
    // Not passive: handing the gesture over means taking it away first.
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, []);

  /**
   * Clicking a row brings it up to the top of the table, which is the same
   * thing as putting it in the picture. The link in the row still wins: a
   * click on the name is a click on the name.
   */
  const raise = useCallback((index: number) => {
    setActive(index);
    const row = rowRefs.current[index];
    const root = list.current;
    if (!row || !root) return;
    // The same arithmetic the scroll handler reads back, so the row it lands
    // on is the row that then claims the mark.
    const top = row.offsetTop - lineRef.current;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    root.scrollTo({ top, behavior: still.matches ? "auto" : "smooth" });
  }, []);

  /** Toggles one tag in a group; `null` empties the group. */
  const choose = useCallback((group: string, value: string | null) => {
    setSelected((current) => {
      if (value === null) return { ...current, [group]: [] };
      const picked = current[group] ?? [];
      return {
        ...current,
        [group]: picked.includes(value)
          ? picked.filter((tag) => tag !== value)
          : [...picked, value],
      };
    });
    // The list under the reader just changed out from under them; starting
    // the picture anywhere but the top would be a guess, and a box left
    // scrolled halfway down a list it no longer holds is worse.
    setActive(0);
    list.current?.scrollTo({ top: 0 });
  }, []);

  const clear = useCallback(() => {
    setSelected({});
    setActive(0);
    list.current?.scrollTo({ top: 0 });
  }, []);

  const filtering = Object.values(selected).some((picked) => picked.length);
  // Only the picture either side of the active one is mounted: enough for the
  // cross-fade, and a directory of a hundred faces still loads two images.
  const mounted = new Set([active - 1, active, active + 1]);
  const featured = shown[active];
  /**
   * The columns still switched on, and the two derived lists everything else
   * is built from: the first column is the row's title and the one that stays
   * put when the table is scrolled sideways, so it is handled apart from the
   * rest — and when it is switched off there is simply no title cell, and the
   * thumbnail is the only thing that stays put.
   */
  const visible = columns.filter((column) => !off[column.id]);
  const titleId = columns[0]?.id;
  const titled = visible.some((column) => column.id === titleId);
  const data = visible.filter((column) => column.id !== titleId);

  // The thumbnail column, then whatever is left of what the page asked for.
  // No grid gap: the frozen columns are pinned at exact offsets, and a gap
  // would put half of one between them where nothing paints.
  const template = [
    `${THUMB}px`,
    ...visible.map((column) => column.width),
  ].join(" ");
  /** What a cell that stays put has to paint over the columns beneath it. */
  const frozen = (index: number) =>
    index === active && settled ? "bg-row" : "bg-background";

  /**
   * The filter controls, as a bar. Rendered in one of two places depending on
   * the width and the arrangement, so it is built once here rather than kept
   * in step in two copies.
   */
  const count = (
    <>
      {shown.length} {unit}
      {filtering && (
        <button
          type="button"
          onClick={clear}
          className="ml-3 text-brand opacity-100 transition-opacity duration-200 hover:opacity-60"
        >
          Clear
        </button>
      )}
    </>
  );

  const tags =
    variant === "pills"
      ? filters.flatMap((group) =>
          group.options
            .filter((option) =>
              (selected[group.id] ?? EMPTY).includes(option.value),
            )
            .map((option) => (
              <button
                key={`${group.id}:${option.value}`}
                type="button"
                onClick={() => choose(group.id, option.value)}
                aria-label={`Remove ${option.label}`}
                // A transparent border, so a tag is exactly as tall as the
                // control above it — the trigger's border is a pixel top and
                // bottom, and without this the two rows sit at 32 and 30.
                className="label flex items-center gap-1.5 rounded-full border border-transparent bg-brand px-3 py-1.5 text-background transition-opacity duration-200 hover:opacity-80"
              >
                {option.label}
                <Cross />
              </button>
            )),
        )
      : [];

  /**
   * The filter controls. Rendered in one of two places depending on the width
   * and the arrangement, so it is built once here rather than kept in step in
   * two copies.
   *
   * Two rows, not one: the controls are a fixed, short list and belong on a
   * line of their own, while what has been picked with them can run to any
   * length. Mixed into one row the controls moved every time a tag was added
   * or dropped, so the thing you were about to click was never where you left
   * it. Underneath, they stay put and the tags grow downwards.
   */
  const pills = (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((group) => (
          <FilterMenu
            key={group.id}
            group={group}
            selected={selected[group.id] ?? EMPTY}
            onChoose={choose}
            clearable={variant !== "pills"}
          />
        ))}
      </div>
      {/* What is picked, spelled out. The header arrangement can show a choice
          on the column it belongs to; a bar has nowhere to put it but here. */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">{tags}</div>
      )}
    </div>
  );

  return (
    <main
      id="top"
      className="relative flex min-h-screen flex-col px-6 pt-[150px] sm:px-10 sm:pt-[20vh]"
    >
      <header className="mx-auto max-w-[62ch] text-center">
        {eyebrow && (
          <p
            className={
              eyebrowStyle === "heading"
                ? // The display face, sized between the body and the title:
                  // read as a quieter first line of the heading rather than as
                  // a tag filed above it.
                  "mb-3 text-[clamp(1.05rem,1.7vw,1.5rem)] leading-[1.2] font-medium tracking-[-0.025em] opacity-35"
                : "label mb-5 text-[11px] opacity-40"
            }
          >
            {eyebrow}
          </p>
        )}
        <h1 className="mx-auto max-w-[22ch] text-[clamp(2rem,4.4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.035em]">
          {heading}
        </h1>
        {intro.map((paragraph) => (
          <p
            key={paragraph}
            className="mx-auto mt-5 max-w-[54ch] text-[clamp(0.95rem,1.15vw,1.125rem)] leading-[1.5] opacity-70"
          >
            {paragraph}
          </p>
        ))}
      </header>

      <div className="mt-20 flex flex-wrap items-center gap-x-4 gap-y-3 sm:mt-28">
        {/* Below `lg` a row is a stack with no column headings to hang the
            filters off, so they get a row of their own up here whichever
            arrangement is on show. On desktop the `pills` arrangement has its
            own copy of this, sitting directly over the table. */}
        <div className="flex min-w-0 flex-1 lg:hidden">{pills}</div>
        {/* The count goes wherever the controls went: in the `pills`
            arrangement it belongs to the bar over the table, not to a line
            left behind up here on its own. */}
        <p
          className={`label opacity-40 ${variant === "pills" ? "lg:hidden" : ""}`}
          aria-live="polite"
        >
          {count}
        </p>
      </div>

      {/* The card sets the height and the table takes it: `items-stretch`
          hands the right-hand column the row's height, and the box inside it
          is positioned, so 216 rows of table have no say in how tall that
          row is. Which is the point — the two read as one object, and the
          list scrolls inside it rather than running the page down the page. */}
      {/* The table runs to the right edge of the screen rather than stopping
          at the page's gutter. It is a scrolling surface, and a strip of page
          margin to the right of it just reads as a column that got cut off —
          where running off the edge reads as a table that carries on. The
          negative margin is exactly the gutter `main` sets above.

          The height is the viewport's, less the nav and a margin at the foot.
          It has to fit: the table's header is sticky to the table's own box,
          so if the page can scroll that box off the top of the screen it
          takes the header with it, and the rows underneath are left running
          off the top of the page with nothing covering them. Anything that
          always fits can never do that. */}
      <div className="mt-8 flex flex-col gap-8 pb-16 lg:-mr-10 lg:h-[calc(100vh-170px)] lg:flex-row lg:items-stretch lg:gap-12">
        {/* The picture. First in the DOM so phones get it above the table, and
            beside it on desktop.

            Two blocks that read as one card. The card is what sets the row's
            height, and the table beside it takes that height — so the card
            has to be the same height whichever row is marked, or the table
            would resize every time a longer title came up. The picture's
            height follows from its width alone, so it is already stable; the
            caption is given a fixed one, sized to the longest thing it can be
            asked to hold, and the picture takes whatever height is left. */}
        <div className="lg:flex lg:h-full lg:w-[38%] lg:flex-col">
          <div
            className={`rounded-t-[18px] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-6 lg:min-h-0 lg:flex-1 ${
              featured ? "pb-0 sm:pb-0" : "rounded-b-[18px]"
            }`}
          >
            <div className="relative h-[36vh] w-full overflow-hidden rounded-[10px] bg-foreground/5 lg:h-full">
              {shown.map((entry, index) =>
                mounted.has(index) ? (
                  <div
                    key={entry.id}
                    style={{ transitionDuration: `${FADE_MS}ms` }}
                    className={`absolute inset-0 transition-opacity ease-out ${
                      index === active ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {entry.image ? (
                      <Image
                        src={entry.image.src}
                        alt={entry.image.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 38vw"
                        priority={index === 0}
                        className="object-cover"
                      />
                    ) : (
                      <Monogram
                        title={entry.title}
                        className="text-[clamp(2rem,6vw,3.5rem)]"
                      />
                    )}
                  </div>
                ) : null,
              )}
            </div>
          </div>

          {featured && (
            // The whole row, not a caption: the table gives each value a
            // column's width and no more, and this is where they get to be
            // read in full. Labelled, because out of the table the values
            // have lost the headers that said what they were.
            //
            // Label over value rather than beside it: the card is a third of
            // the screen and these values are long — a title and organization
            // is most of a sentence — so a label column would leave them
            // wrapping in whatever was left.
            <div className="rounded-b-[18px] bg-white px-4 pt-4 pb-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:px-6 sm:pb-6 lg:h-[216px] lg:shrink-0 lg:overflow-y-auto">
              <div className="flex flex-col gap-3">
                <Title entry={featured} />
                <dl className="flex flex-col gap-2">
                  {data.map((column) => (
                    <div key={column.id}>
                      <dt className="label text-[10px] opacity-30">
                        {column.label}
                      </dt>
                      <dd className="label mt-0.5 text-[10px] leading-[1.5] opacity-60">
                        {featured.cells[column.id] || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* The table scrolls in its own box: the picture sits beside it, and
            a page that scrolled instead would carry that picture off. */}
        <div className="relative lg:flex lg:w-[62%] lg:flex-col">
          {/* Over the table it filters, not off in the page margin beside the
              picture. Desktop only: the narrow layout already has this row
              above everything. */}
          {variant === "pills" && (
            // The table itself runs off the right edge of the screen, and the
            // bar sits over the table — so it needs the page's gutter putting
            // back, or the count ends up against the glass.
            //
            // Two children, not one wrapping row: the controls wrap among
            // themselves as tags are added, and the count stays on the first
            // line beside them. As a sibling in the same wrapping row it was
            // carried down with them, which put the table's total halfway
            // down its own filters.
            <div className="mb-4 hidden shrink-0 items-start gap-4 lg:flex lg:pr-10">
              {pills}
              <p
                className="label shrink-0 py-1.5 opacity-40"
                aria-live="polite"
              >
                {count}
              </p>
            </div>
          )}

          <div className="relative lg:min-h-0 lg:flex-1">
            <div
              ref={list}
              // `overscroll-auto`, not `contain`: at the top of the list the
              // scroll is allowed to chain back out to the page, so carrying on
              // upwards takes you to the intro copy above instead of stopping
              // dead on a list that has nowhere left to go.
              //
              // The padding is the header's height, kept clear so the first row
              // starts below it rather than behind it.
              style={{ paddingTop: gutter }}
              className={`relative h-[62vh] snap-y snap-mandatory overscroll-auto lg:absolute lg:inset-0 lg:h-auto ${
                reachable
                  ? "overflow-y-auto lg:overflow-auto"
                  : "overflow-hidden"
              }`}
            >
              {shown.length === 0 ? (
                <div className="border-b border-foreground/10 py-16 lg:w-max lg:min-w-full">
                  <p className="text-[clamp(1rem,1.4vw,1.25rem)] opacity-60">
                    {emptyLabel}
                  </p>
                  <button
                    type="button"
                    onClick={clear}
                    className="label mt-4 text-brand transition-opacity duration-200 hover:opacity-60"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                // As wide as the table, not as wide as the box. A row's rule is
                // the row's own bottom border, so a row only as wide as the
                // visible area draws a rule that stops short of the columns to
                // the right of it — and stops in a different place depending on
                // how far the table happens to be scrolled.
                <ul className="lg:w-max lg:min-w-full">
                  {shown.map((entry, index) => (
                    <li
                      key={entry.id}
                      data-index={index}
                      ref={(node) => {
                        rowRefs.current[index] = node;
                      }}
                      style={{ scrollMarginTop: gutter }}
                      onClick={(event) => {
                        // The title is a link out; raising the row would fight it.
                        if ((event.target as HTMLElement).closest("a")) return;
                        raise(index);
                      }}
                      // The row at the top is the row in the picture, so it is
                      // marked as plainly as the picture is: a tint, a brand rule
                      // down its leading edge, and its text brought up out of the
                      // greyed-back register the rest of the table sits in. The
                      // rule hangs off the frozen thumbnail cell rather than off
                      // the row, so that scrolling sideways cannot carry it off.
                      //
                      // Nothing responds to hover. The mark means "this is the one
                      // showing", and a second row lighting up under the pointer
                      // would be claiming the same thing and lying about it.
                      className={`snap-start cursor-pointer border-b border-foreground/10 transition-colors duration-150 lg:w-max lg:min-w-full ${
                        index === active && settled ? "bg-row" : ""
                      }`}
                    >
                      {/* Desktop: the table proper. Wider than its box on
                        purpose — the columns carry whole titles and whole
                        lists of tags, and a directory that abbreviates the
                        things it is there to be read for is no directory. The
                        box scrolls sideways to reach them, with the name and
                        its thumbnail staying put so a row scrolled right still
                        says whose row it is.

                        Values wrap rather than running on, which is what keeps
                        the columns narrow enough to be worth scrolling to:
                        every track is a fixed width, so the text finds its own
                        line breaks inside one instead of widening it.

                        `items-stretch`, because the two cells that stay put
                        have to paint the whole height of the row — a cell only
                        as tall as its own text leaves a band above and below it
                        for the scrolling columns to show through. */}
                      <div
                        className="hidden w-max min-w-full items-stretch py-4 lg:grid"
                        style={{ gridTemplateColumns: template }}
                      >
                        <span
                          className={`relative flex h-full items-center pl-2 transition-colors duration-150 before:absolute before:top-0 before:left-0 before:h-full before:w-[2px] before:bg-brand before:transition-opacity before:duration-150 ${frozen(
                            index,
                          )} ${
                            index === active && settled
                              ? "before:opacity-100"
                              : "before:opacity-0"
                          } sticky left-0 z-10`}
                        >
                          <Thumb entry={entry} />
                        </span>
                        {titled && (
                          <span
                            className={`sticky z-10 flex h-full items-center pr-6 transition-colors duration-150 ${frozen(
                              index,
                            )}`}
                            style={{ left: THUMB }}
                          >
                            <Title entry={entry} />
                          </span>
                        )}
                        {data.map((column) => (
                          <span
                            key={column.id}
                            className={`label flex items-center pr-6 text-[11px] leading-[1.5] transition-opacity duration-150 last:pr-10 ${
                              index === active && settled
                                ? "opacity-90"
                                : "opacity-50"
                            }`}
                          >
                            {entry.cells[column.id] || "—"}
                          </span>
                        ))}
                      </div>

                      {/* Phones and tablets: the same row as a stack. */}
                      <div className="flex items-start gap-4 px-2 py-4 lg:hidden">
                        <Thumb entry={entry} />
                        <div className="min-w-0 flex-1">
                          <Title entry={entry} />
                          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                            {data.map((column) =>
                              entry.cells[column.id] ? (
                                <span
                                  key={column.id}
                                  className={`label text-[10px] transition-opacity duration-150 ${
                                    index === active && settled
                                      ? "opacity-90"
                                      : "opacity-50"
                                  }`}
                                >
                                  {entry.cells[column.id]}
                                </span>
                              ) : null,
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {shown.length > 0 && (
                // Without this the last rows can never reach the line:
                // there is nothing below them to scroll, so the mark would
                // stop short of the end of the list.
                <div aria-hidden className="h-[62vh] lg:h-full" />
              )}
            </div>

            {/* The header row is the table's only chrome, so it only prints
              where there is actually a table: below `lg` a row is a stack.

              It is a sibling of the scrolling box, not a child of it. As a
              sticky child it was repositioned every frame by the same
              compositor that was moving the rows, and any frame where those
              two disagreed showed a sliver of a row above it. Out here it
              does not move at all: the rows scroll underneath, inside a box
              whose top edge is behind this, and there is no longer a
              mechanism by which one could appear over it.
                
              The cost is that it has to be told about sideways scrolling,
              since it is no longer in the thing that scrolls — `track` is
              slid by the scroll handler, and the two columns that stay put
              are slid back by the same amount. */}
            <div
              ref={head}
              // Clipped sideways but not downwards. The grid inside is wider
              // than the bar and slides left and right, so it has to be cut off
              // at the bar's edges — but `overflow-hidden` would cut the filter
              // menus off at the bottom edge too, and a menu that cannot leave
              // the bar it hangs from is no menu.
              //
              // `clip` rather than `hidden` because it can be set on one axis
              // while the other stays visible, and rather than `clip-path`
              // because that only clips the painting: the grid's width stayed in
              // the page's scrollable area and gave the whole document a
              // horizontal scrollbar.
              className="absolute inset-x-0 top-0 z-20 hidden border-b border-foreground/10 bg-panel pt-[22px] pb-4 [overflow-x:clip] [overflow-y:visible] lg:block"
            >
              <div
                ref={track}
                className="grid w-max min-w-full"
                style={{ gridTemplateColumns: template }}
              >
                {/* The thumbnail column's header, unlabelled: a column of faces
                  does not need to be told it is pictures. It still has to be
                  here, and still has to stay put and paint a background, or
                  the columns scrolling sideways would pass through the gap
                  where it should have been. */}
                <span
                  aria-hidden
                  data-pin
                  className="relative z-10 flex items-center bg-panel pl-2"
                />
                {visible.map((column) => {
                  const group = filters.find((entry) => entry.id === column.id);
                  const pinned = column.id === titleId;
                  return (
                    <div
                      key={column.id}
                      {...(pinned ? { "data-pin": "" } : {})}
                      className={
                        pinned
                          ? "relative z-10 flex h-full items-center bg-panel pr-6"
                          : "flex items-center pr-6 last:pr-10"
                      }
                    >
                      {group && variant === "headers" ? (
                        <FilterMenu
                          group={group}
                          selected={selected[group.id] ?? EMPTY}
                          onChoose={choose}
                          header
                        />
                      ) : (
                        <span className="label text-[11px] opacity-40">
                          {column.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <VariantToggle
        variant={variant}
        onVariant={setVariant}
        eyebrowStyle={eyebrowStyle}
        onEyebrow={setEyebrowStyle}
        hasEyebrow={Boolean(eyebrow)}
        columns={columns}
        off={off}
        onColumn={(id) =>
          setOff((current) => ({ ...current, [id]: !current[id] }))
        }
      />
    </main>
  );
}

function Thumb({ entry }: { entry: DirectoryEntry }) {
  return (
    <span className="relative block h-12 w-10 shrink-0 overflow-hidden rounded-[3px] bg-foreground/5">
      {entry.image ? (
        <Image
          src={entry.image.thumb}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
        />
      ) : (
        <Monogram title={entry.title} className="text-[10px]" />
      )}
    </span>
  );
}

/** "Sam Altman" -> "SA", "Anduril" -> "A". */
function initials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const ends = words.length === 1 ? [words[0]] : [words[0], words.at(-1)!];
  return ends
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/**
 * What a row shows in place of a photograph. Initials rather than a plain
 * grey block: most of this directory is unphotographed, and a column of
 * identical blanks reads as a page that failed to load, where a column of
 * differing monograms reads as a deliberate placeholder. Hidden from screen
 * readers — the name is already right beside it.
 */
function Monogram({ title, className }: { title: string; className: string }) {
  return (
    <span
      aria-hidden
      className={`label absolute inset-0 flex items-center justify-center bg-foreground/5 text-foreground/30 ${className}`}
    >
      {initials(title)}
    </span>
  );
}

/** A linked title gets the arrow; one without a profile is just set in type. */
function Title({ entry }: { entry: DirectoryEntry }) {
  const size = "text-[15px] leading-[1.3]";

  if (!entry.href) {
    return <span className={`block truncate ${size}`}>{entry.title}</span>;
  }

  const external = /^https?:\/\//.test(entry.href);
  return (
    <a
      href={entry.href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`inline-flex min-w-0 items-baseline gap-1.5 transition-opacity duration-200 hover:opacity-60 ${size}`}
    >
      <span className="truncate">{entry.title}</span>
      <ArrowUpRight className="shrink-0 opacity-40" />
    </a>
  );
}

/**
 * The same corner control the homepage carries, for the same reason: several
 * arrangements of the same page, to be looked at side by side and chosen
 * between. Nothing here persists — a reload is back to the defaults.
 */
function VariantToggle({
  variant,
  onVariant,
  eyebrowStyle,
  onEyebrow,
  hasEyebrow,
  columns,
  off,
  onColumn,
}: {
  variant: DirectoryVariant;
  onVariant: (next: DirectoryVariant) => void;
  eyebrowStyle: DirectoryEyebrow;
  onEyebrow: (next: DirectoryEyebrow) => void;
  hasEyebrow: boolean;
  columns: DirectoryColumn[];
  off: Record<string, boolean>;
  onColumn: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const arrangements: { id: DirectoryVariant; label: string }[] = [
    { id: "headers", label: "Headers" },
    { id: "pills", label: "Pills" },
  ];
  const eyebrows: { id: DirectoryEyebrow; label: string }[] = [
    { id: "label", label: "Label" },
    { id: "heading", label: "Heading" },
  ];
  const hidden = columns.filter((column) => off[column.id]).length;

  return (
    <div className="fixed right-4 bottom-4 z-50 font-mono text-[11px] text-white">
      {open && (
        <div className="mb-2 w-[268px] rounded-xl bg-neutral-900/95 p-3 shadow-xl backdrop-blur-sm">
          <p className="pb-2 tracking-[0.08em] text-white/40 uppercase">
            Filters
          </p>
          <div className="flex gap-1">
            {arrangements.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={variant === option.id}
                onClick={() => onVariant(option.id)}
                className={`flex-1 rounded-md py-1.5 tracking-[0.08em] uppercase transition-colors ${
                  variant === option.id
                    ? "bg-white text-neutral-900"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {hasEyebrow && (
            <>
              <p className="pt-3 pb-2 tracking-[0.08em] text-white/40 uppercase">
                Eyebrow
              </p>
              <div className="flex gap-1">
                {eyebrows.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={eyebrowStyle === option.id}
                    onClick={() => onEyebrow(option.id)}
                    className={`flex-1 rounded-md py-1.5 tracking-[0.08em] uppercase transition-colors ${
                      eyebrowStyle === option.id
                        ? "bg-white text-neutral-900"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="pt-3 pb-2 tracking-[0.08em] text-white/40 uppercase">
            Columns
          </p>
          <div className="flex flex-col gap-1">
            {columns.map((column) => {
              const on = !off[column.id];
              return (
                <button
                  key={column.id}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => onColumn(column.id)}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/10"
                >
                  <span className={on ? "text-white/80" : "text-white/35"}>
                    {column.label}
                  </span>
                  <span
                    className={`h-3.5 w-6 shrink-0 rounded-full transition-colors ${
                      on ? "bg-white" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`block h-3.5 w-3.5 rounded-full bg-neutral-900 transition-transform ${
                        on ? "translate-x-[10px]" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        className="ml-auto flex h-9 items-center gap-2 rounded-full bg-neutral-900/95 px-4 tracking-[0.08em] uppercase shadow-xl transition-colors hover:bg-neutral-800"
      >
        Layout
        {hidden > 0 && (
          <span className="rounded-full bg-white px-1.5 text-neutral-900">
            {hidden}
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * A column header that is also that column's filter. The header row is the
 * only chrome the table has, so the control sits on the column it narrows
 * rather than in a row of its own — and twenty fields fit in a menu where
 * they would have wrapped for three lines as buttons.
 *
 * `header` is the desktop dress: a header label that happens to open. Without
 * it the same menu renders as a pill, which is what the phone layout needs.
 */
function FilterMenu({
  group,
  selected,
  onChoose,
  header = false,
  clearable = true,
}: {
  group: DirectoryFilterGroup;
  selected: string[];
  onChoose: (group: string, value: string | null) => void;
  header?: boolean;
  /** False where something else already offers a way to drop a tag. */
  clearable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const menu = useRef<HTMLDivElement | null>(null);
  /**
   * Where the menu goes, in screen coordinates.
   *
   * It is rendered into `document.body` rather than next to its button, and
   * positioned by hand. The button lives inside the table's header bar, which
   * is clipped sideways so its sliding grid doesn't escape, and which sits
   * among a stack of scrolling, transformed, layered things — every one of
   * which is a way for a menu to end up cut off or painted under. Out at the
   * top of the document there is nothing left to be cut off by.
   *
   * It also takes the roomier side of the button rather than always dropping:
   * the bar can be most of the way down the screen before the page has been
   * scrolled, where a menu that drops shows two rows and puts the rest under
   * the fold.
   */
  const [fit, setFit] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    max: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const button = root.current?.firstElementChild;
      if (!button) return;
      const box = button.getBoundingClientRect();
      const margin = 16;
      const below = window.innerHeight - box.bottom - margin;
      const above = box.top - margin;
      const up = above > below;
      setFit({
        // Never off the right edge, however far right the column sits.
        left: Math.max(
          margin,
          Math.min(box.left, window.innerWidth - MENU_WIDTH - margin),
        ),
        ...(up
          ? { bottom: window.innerHeight - box.top + 8 }
          : { top: box.bottom + 8 }),
        max: Math.max(140, Math.round(up ? above : below)),
      });
    };
    measure();
    // Fixed to the screen, so anything that moves the button moves the menu:
    // the page scrolling, the table scrolling sideways, the window resizing.
    // `capture` catches the table's own scroll, which does not bubble.
    window.addEventListener("scroll", measure, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, { capture: true });
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  // A menu left open behind a click elsewhere — another column's, the table
  // itself — reads as a popover that has got stuck.
  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => {
      const target = event.target as Node;
      // The menu is not inside `root` any more, so it has to be asked too.
      if (root.current?.contains(target) || menu.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const picked = group.options.filter((option) =>
    selected.includes(option.value),
  );
  // One tag can say its own name; otherwise the control names the column it
  // narrows, which is what it is for. Never "Everyone" or "All fields" — that
  // is the state of the filter, not the name of it, and a row of controls
  // that all say "all" tells you nothing about what they do. The menu still
  // opens with it, as the way back out.
  const label = picked.length === 1 ? picked[0].label : group.label;

  return (
    <div ref={root} className="relative flex min-w-0 items-center gap-1">
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        aria-expanded={open}
        aria-haspopup="listbox"
        // The header reads as a header until something is picked, at which
        // point it has to say so — it is the only place the choice is shown.
        className={
          header
            ? `label flex min-w-0 items-center gap-1.5 text-[11px] transition-colors duration-200 hover:text-foreground ${
                picked.length ? "text-brand" : "text-foreground/40"
              }`
            : `label flex min-w-0 items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors duration-200 ${
                picked.length
                  ? "border-brand bg-brand text-background"
                  : "border-foreground/15 opacity-60 hover:opacity-100"
              }`
        }
      >
        <span className="truncate">{label}</span>
        <span
          className={
            header && !picked.length ? "text-foreground/70" : undefined
          }
        >
          <Chevron open={open} />
        </span>
      </button>

      {/* A sibling, not nested: a button inside a button is not a button. */}
      {clearable && picked.length > 0 && (
        <button
          type="button"
          onClick={() => onChoose(group.id, null)}
          aria-label={`Clear ${group.label}`}
          className={`shrink-0 leading-none transition-opacity duration-200 hover:opacity-100 ${
            header ? "text-brand opacity-70" : "text-background opacity-80"
          }`}
        >
          <Cross />
        </button>
      )}

      {open &&
        fit &&
        createPortal(
          <div
            ref={menu}
            role="listbox"
            aria-multiselectable
            aria-label={group.label}
            style={{
              position: "fixed",
              left: fit.left,
              top: fit.top,
              bottom: fit.bottom,
              maxHeight: fit.max,
              width: MENU_WIDTH,
            }}
            className="z-50 overflow-y-auto rounded-[10px] border border-foreground/10 bg-background py-1 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
          >
            <MenuItem
              label={group.allLabel}
              active={picked.length === 0}
              // Not a tag of its own: picking it is emptying the group.
              onClick={() => onChoose(group.id, null)}
            />
            {group.options.map((option) => (
              <MenuItem
                key={option.value}
                label={option.label}
                active={selected.includes(option.value)}
                // The menu stays open: tagging is usually tagging more than
                // one, and reopening it between each would be its whole cost.
                onClick={() => onChoose(group.id, option.value)}
              />
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

function MenuItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={`label flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] transition-colors duration-150 hover:bg-foreground/5 ${
        active ? "text-brand" : "opacity-60"
      }`}
    >
      {/* Always laid out, so the labels do not shuffle sideways as they are
          picked and unpicked. */}
      <span className="w-[10px] shrink-0">{active ? <Tick /> : null}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 10 8" aria-hidden className="h-[8px] w-[10px]">
      <path
        d="M1 4.2l2.6 2.6L9 1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The one on a picked filter, for dropping it without opening the menu. */
function Cross() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden className="h-[9px] w-[9px]">
      <path
        d="M1.5 1.5l7 7M8.5 1.5l-7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The arrow is what says a column header is a control and not a caption, so
 * it is drawn at full strength even where the label beside it is greyed back
 * — a chevron at the header's own 40% opacity is a smudge, and a header that
 * doesn't look clickable doesn't get clicked.
 */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 8"
      aria-hidden
      className={`h-[8px] w-[12px] shrink-0 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M1.5 2.5L6 6.5l4.5-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
