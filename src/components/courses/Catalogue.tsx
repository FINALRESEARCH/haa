"use client";

import { useMemo, useState } from "react";
import { COURSE_TYPES } from "@/content/courses.data.mjs";
import type { Course } from "@/content/types";

/**
 * `columns` sets each row across the page. `stacked` puts the description and
 * the people under the title, in one measure — which is also what every row
 * does below `lg`, whichever arrangement is picked.
 */
type Layout = "columns" | "stacked";

/**
 * The course catalogue. Its own component rather than the /network shell:
 * that shell is a table built around a photograph — a picture pinned on the
 * left, rows scrolling past it, a thumbnail in front of every name — and a
 * course has no face. Sharing it meant switching half of it off, which is
 * how you end up maintaining one component that is really two.
 *
 * So this is the other thing entirely: no pinned panel, no sideways scroll,
 * no marked row. Just the catalogue, full-bleed, one course per band, in the
 * page's own scroll.
 *
 * Every row carries its whole description. The catalogue is 40 long and read
 * top to bottom, not looked up — truncating the one column that says what a
 * course actually is would make the page a list of titles.
 *
 * Two arrangements of the same rows, chosen from the corner control the other
 * directory carries. `columns` sets a row across the page; `stacked` puts
 * everything under the title, which is the same shape the page already takes
 * below `lg` — so the narrow layout is not a third thing to maintain, it is
 * `stacked` arriving early.
 */
export default function Catalogue({
  eyebrow,
  courses,
}: {
  eyebrow: string;
  courses: Course[];
}) {
  /** `""` is every row; otherwise a `COURSE_TYPES` value. */
  const [type, setType] = useState("");
  const [layout, setLayout] = useState<Layout>("columns");

  const shown = useMemo(
    () => (type ? courses.filter((course) => course.type === type) : courses),
    [courses, type],
  );

  // Only the kinds the catalogue actually contains. A filter that can only
  // ever return everything is a row of noise — the same rule /network's
  // filters follow.
  const kinds = COURSE_TYPES.filter((option) =>
    courses.some((course) => course.type === option.value),
  );

  return (
    <main id="top" className="relative flex min-h-screen flex-col pt-[150px] sm:pt-[20vh]">
      {/* The eyebrow is the page's only title, so it is the `h1`. A page with
          no heading at all is one a screen reader cannot announce having
          arrived at, and a search result has nothing to label. */}
      <header className="flex flex-wrap items-baseline gap-x-6 gap-y-4 px-6 sm:px-10">
        <h1 className="label text-brand">{eyebrow}</h1>
        <p className="label text-foreground/40" aria-live="polite">
          {shown.length} {shown.length === 1 ? "entry" : "entries"}
        </p>
      </header>

      {kinds.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2 px-6 sm:mt-10 sm:px-10">
          <Filter label="Everything" on={type === ""} onPick={() => setType("")} />
          {kinds.map((option) => (
            <Filter
              key={option.value}
              label={option.label}
              on={type === option.value}
              onPick={() => setType(option.value)}
            />
          ))}
        </div>
      )}

      {/* Full bleed: the rules run from glass to glass and only the type is
          held in at the page's gutter, so the catalogue reads as the surface
          of the page rather than a panel laid on top of it. */}
      <div className="mt-10 border-t border-rule sm:mt-14">
        {shown.map((course) => (
          <Row key={course.id} course={course} layout={layout} />
        ))}
      </div>

      {shown.length === 0 && (
        <p className="px-6 py-20 text-[clamp(1rem,1.4vw,1.25rem)] text-foreground/60 sm:px-10">
          Nothing here matches that filter yet.
        </p>
      )}

      <div className="h-[16vh]" />

      <LayoutToggle layout={layout} onLayout={setLayout} />
    </main>
  );
}

/**
 * One course, in whichever arrangement is on.
 *
 * `columns` is four across the page — what it is, what it covers, who teaches
 * it, and what they do. `stacked` puts the same four under the title in one
 * measure. Below `lg` both come out the same, because at tablet width the
 * description is the only one of the four with enough text to need a column
 * and the rest end up as two words marooned in a quarter of the screen.
 *
 * The instructors and their titles stay apart in both. The base keeps them
 * apart — one row per course, not one per person — so a course taught by two
 * people has two names and a single string naming both their jobs, and
 * running that under the names reads as if it belonged to the last one.
 *
 * The title is given a whole column and no measure inside it: "Harness
 * Engineering: Designing the Operating Layer for Reliable Agents" needs the
 * room, and a `max-w` in a column this wide only makes it wrap early against
 * nothing.
 */
function Row({ course, layout }: { course: Course; layout: Layout }) {
  const track = course.type === "track";
  const stacked = layout === "stacked";

  const title = (
    <h2
      className={`text-[clamp(1.15rem,1.7vw,1.6rem)] leading-[1.18] font-medium tracking-[-0.025em] ${
        // Stacked, the title is the only thing on its line, so it needs a
        // measure of its own — the full width of the page is far past the
        // point a heading stops being one line of thought.
        stacked ? "max-w-[30ch]" : "lg:col-span-4"
      }`}
    >
      {course.title}
    </h2>
  );

  const description = (
    <p
      className={`text-[15px] leading-[1.6] tracking-[-0.005em] text-foreground/70 ${
        stacked ? "mt-6 max-w-[78ch]" : "lg:col-span-4"
      }`}
    >
      {course.description}
    </p>
  );

  const people =
    course.people.length > 0 ? (
      <ul
        className={
          stacked
            ? // A row rather than a column when there is a whole page to run
              // along: six names down the left of a stacked entry is a list
              // longer than the entry it belongs to.
              "mt-3 flex flex-wrap gap-x-5 gap-y-1"
            : "flex flex-col gap-1.5 lg:col-span-2"
        }
      >
        {course.people.map((name) => (
          <li
            key={name}
            className="text-[15px] leading-[1.35] tracking-[-0.01em]"
          >
            {name}
          </li>
        ))}
      </ul>
    ) : null;

  /* Courses carry their instructors' titles; a track's lineup has no single
     one, so the base leaves the column empty and so do we. */
  const affiliation = course.affiliation ? (
    <p
      className={`text-[13px] leading-[1.45] text-foreground/45 ${
        // Stacked, this is a caption on the names above it rather than a
        // field of its own, so it sits as close under them as the two sizes
        // allow. The room above the description is what separates the whole
        // byline from it.
        stacked ? "mt-0.5 max-w-[78ch]" : "lg:col-span-2"
      }`}
    >
      {course.affiliation}
    </p>
  ) : null;

  return (
    <article className="border-b border-rule px-6 py-10 transition-colors duration-200 hover:bg-panel/60 sm:px-10 lg:py-12">
      {/* The type tag is lifted out of the columns and given the row's first
          line to itself, so the four columns can start together at the top of
          the title. Left inside the first column it pushed the title down by
          its own height, and the description beside it then began a line and
          a half above the thing it describes. */}
      <p className={`label ${track ? "text-foreground/35" : "text-brand"}`}>
        {kindLabel(course.type)}
      </p>

      {stacked ? (
        // Title, then who teaches it, then what it covers. The names are a
        // byline — on a stacked entry they belong to the title, and reading
        // the description first means meeting "Learn how AI is turned into
        // products people use" before knowing whose course that is.
        <div className="mt-4">
          {title}
          {people}
          {affiliation}
          {description}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-12">
          {title}
          {description}
          {/* An empty cell is still placed on a wide screen, or the next row's
              columns would not line up with this one's. */}
          {people ?? <div className="hidden lg:col-span-2 lg:block" />}
          {affiliation ?? <div className="hidden lg:col-span-2 lg:block" />}
        </div>
      )}
    </article>
  );
}

/**
 * The same corner control the other directory carries, for the same reason:
 * two arrangements of one page, to be looked at side by side and chosen
 * between. Nothing here persists — a reload is back to the default.
 */
function LayoutToggle({
  layout,
  onLayout,
}: {
  layout: Layout;
  onLayout: (next: Layout) => void;
}) {
  const [open, setOpen] = useState(false);
  const arrangements: { id: Layout; label: string }[] = [
    { id: "columns", label: "Columns" },
    { id: "stacked", label: "Stacked" },
  ];

  return (
    <div className="fixed right-4 bottom-4 z-50 font-mono text-[11px] text-white">
      {open && (
        <div className="mb-2 w-[220px] rounded-xl bg-neutral-900/95 p-3 shadow-xl backdrop-blur-sm">
          <p className="pb-2 tracking-[0.08em] text-white/40 uppercase">
            Rows
          </p>
          <div className="flex gap-1">
            {arrangements.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={layout === option.id}
                onClick={() => onLayout(option.id)}
                className={`flex-1 rounded-md py-1.5 tracking-[0.08em] uppercase transition-colors ${
                  layout === option.id
                    ? "bg-white text-neutral-900"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        className="ml-auto flex h-9 items-center gap-2 rounded-full bg-neutral-900/95 px-4 tracking-[0.08em] uppercase shadow-xl transition-colors hover:bg-neutral-800"
      >
        Layout
      </button>
    </div>
  );
}

/** "track" -> "Track". Singular: the tag describes this one row. */
function kindLabel(value: string): string {
  const known = COURSE_TYPES.find((option) => option.value === value);
  if (known) return known.label.replace(/s$/, "");
  return value ? value[0].toUpperCase() + value.slice(1) : "";
}

function Filter({
  label,
  on,
  onPick,
}: {
  label: string;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={`label rounded-full border px-4 py-2 transition-colors duration-200 ${
        on
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/15 text-foreground/50 hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
