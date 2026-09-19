"use client";

import Image from "next/image";
import { COURSE_TYPES } from "@/content/courses.data.mjs";
import type {
  Course,
  CurriculumContent,
  CurriculumFeature,
  NetworkPerson,
  PartnerLogo,
} from "@/content/types";

/**
 * The ready-made blocks a chapter or a point can print after its type. The
 * copy names them ("[6–8 featured course cards]", "[Selected mentor cards]")
 * rather than spelling them out, so each one is a component here and the
 * Studio only picks which chapter draws which.
 *
 * Two of them — the lecturers and the mentors — are not page content at all:
 * they are the `person` documents the /network directory already renders,
 * filtered by relationship, so the page cannot drift from the directory.
 */
export type FeatureData = {
  content: CurriculumContent;
  /** The catalogue's featured courses — the same documents /courses lists. */
  courses: Course[];
  speakers: NetworkPerson[];
  mentors: NetworkPerson[];
  partners: PartnerLogo[];
};

/** A block with nothing behind it yet prints nothing, not an empty frame. */
export function Feature({
  name,
  data,
}: {
  name: CurriculumFeature;
  data: FeatureData;
}) {
  switch (name) {
    case "pursuits":
      return <Pursuits items={data.content.pursuits} />;
    case "courses":
      return <Courses items={data.courses} />;
    case "week":
      return <Week days={data.content.week} />;
    case "speakers":
      return <People people={data.speakers} caption="Selected guest lecturers" />;
    case "mentors":
      return <People people={data.mentors} caption="Selected mentors" />;
    case "partners":
      return <Partners logos={data.partners} />;
  }
}

/** The eight examples, as a wrapped row of chips rather than a list. */
function Pursuits({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-foreground/12 px-4 py-2 text-[15px] leading-none tracking-[-0.01em]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The featured grid. These are `course` documents ticked "Featured", not a
 * second list kept on this page, so the cards here and the rows on /courses
 * can never disagree about what a course is called. The chapter's "Explore
 * all courses" link goes to that directory.
 *
 * The instructors are the card's second line rather than the description:
 * the copy above already says what courses are, and on a card a fifth of the
 * screen wide, four names read where two sentences do not.
 */
function Courses({ items }: { items: Course[] }) {
  if (!items.length) return null;
  return (
    <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-foreground/8 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((course) => (
        <li
          key={course.id}
          className="flex min-h-[200px] flex-col justify-between bg-background p-6"
        >
          <p className="label text-brand">{typeLabel(course.type)}</p>

          <div className="mt-8">
            <p className="text-[17px] font-medium leading-[1.25] tracking-[-0.02em]">
              {course.title}
            </p>
            {course.people.length > 0 && (
              <p className="mt-3 text-[13px] leading-[1.35] text-foreground/50">
                {course.people.join(", ")}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** "track" -> "Track". Singular: the tag describes this one card. */
function typeLabel(value: string): string {
  const known = COURSE_TYPES.find((option) => option.value === value);
  if (known) return known.label.replace(/s$/, "");
  return value ? value[0].toUpperCase() + value.slice(1) : "Course";
}

/**
 * The week, as a calendar: one tall column per day, each block taking the
 * share of the column its `span` asks for, so a course block runs long and
 * office hours read as a slot dropped into a morning.
 *
 * No time gutter and no clock on the blocks. The copy's whole point is that
 * there is no typical week, and printing "9:00" down the left would commit
 * the school to a timetable it hasn't set — the proportions carry the shape
 * of a week without asserting its hours.
 *
 * `flex-grow` rather than a row grid: the spans are relative, an editor can
 * give a day any total, and grow divides whatever is left between the blocks
 * that asked for it without the column needing to know the total up front.
 */
function Week({ days }: { days: CurriculumContent["week"] }) {
  if (!days.length) return null;
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-foreground/8 sm:grid-cols-5">
      {days.map((day) => (
        <div key={day.day} className="flex flex-col bg-background p-3">
          <p className="label px-2 py-3 text-foreground/40">{day.day}</p>

          <div className="flex min-h-[220px] flex-1 flex-col gap-1 sm:min-h-[520px]">
            {day.entries.map((entry, index) => (
              <div
                // The label repeats within a day — a morning and an afternoon
                // of pursuit time are two blocks — so the position is the key.
                key={`${entry.label}-${index}`}
                style={{ flexGrow: entry.span }}
                className={`flex basis-0 items-start rounded-lg px-3 py-2.5 text-[13px] leading-[1.3] tracking-[-0.01em] ${
                  // The Friday Review is the one fixed point in the week, and
                  // the copy says so; the brand wash is that sentence in the
                  // layout rather than another line of type.
                  entry.label.toLowerCase().includes("review")
                    ? "bg-brand/10 text-brand"
                    : "bg-panel text-foreground/70"
                }`}
              >
                {entry.label}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Lecturer and mentor cards, drawn from the network directory. Most of that
 * base has no photograph — it came from an Airtable with no photo column — so
 * the card leads with the name and prints a monogram where a portrait would
 * go, the same compromise `Directory.tsx` makes.
 */
function People({
  people,
  caption,
}: {
  people: NetworkPerson[];
  caption: string;
}) {
  if (!people.length) return null;
  return (
    <div>
      <p className="label text-foreground/40">{caption}</p>
      <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {people.map((person) => (
          <li key={person.id}>
            <span className="relative block aspect-square w-14 overflow-hidden rounded-full bg-foreground/5">
              {person.thumb ? (
                <Image
                  src={person.thumb}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="label absolute inset-0 flex items-center justify-center text-[11px] text-foreground/30"
                >
                  {initials(person.name)}
                </span>
              )}
            </span>
            <p className="mt-4 text-[15px] font-medium leading-[1.25] tracking-[-0.015em]">
              {person.name}
            </p>
            {person.affiliation && (
              <p className="mt-1 text-[13px] leading-[1.35] text-foreground/50">
                {person.affiliation}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Sam Altman" -> "SA", "Anduril" -> "A". Same rule as the directory's. */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const ends = words.length === 1 ? [words[0]] : [words[0], words.at(-1)!];
  return ends
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/** The co-op logo row, at the scale each mark was drawn to sit at. */
function Partners({ logos }: { logos: PartnerLogo[] }) {
  if (!logos.length) return null;
  return (
    <div>
      <p className="label text-foreground/40">Selected co-op partners</p>
      <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-foreground/8 sm:grid-cols-3 lg:grid-cols-5">
        {logos.map((logo) => (
          <li
            key={logo.name}
            className="flex h-24 items-center justify-center bg-background px-6"
          >
            <span
              className="relative block h-6 w-full"
              style={{ transform: `scale(${logo.scale})` }}
            >
              <Image
                src={logo.src}
                alt={logo.name}
                fill
                sizes="160px"
                className="object-contain"
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
