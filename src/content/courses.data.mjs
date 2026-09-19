/**
 * The vocabulary and the page copy for /courses, kept as plain JS so
 * `scripts/seed.mjs` and the site can share one copy — the same arrangement
 * `about.data.mjs` and `curriculum.data.mjs` use.
 *
 * The catalogue itself is not here: it is an Airtable export, so it lives in
 * `src/data/courses.ts` beside the network's, and Sanity's `course` documents
 * win over it (see `src/sanity/courses.ts`).
 */

/**
 * The two kinds of row, and the directory's only filter. This is the base's
 * own `Type` column, slugged — the same rule `taxonomy.data.mjs` follows — so
 * an export and this list cannot drift.
 *
 * Labels are plural because they name a filter; the value stays singular
 * because it describes one row.
 */
export const COURSE_TYPES = [
  { value: "course", label: "Courses" },
  { value: "track", label: "Tracks" },
];

/** The copy at the top of /courses. */
export const COURSES_PAGE = {
  eyebrow: "Courses at HAA",
  heading: "Learn from people at the frontier of their fields.",
  // Deliberately empty: the table is the page. The Studio field is still
  // there if a line above it is ever wanted.
  intro: [],
};
