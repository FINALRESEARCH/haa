/**
 * The nav panel copy, kept as plain JS so the Sanity scripts
 * (`scripts/seed.mjs`, `scripts/sync-nav.mjs`) and the site can share one
 * copy. Everything that needs types imports it through
 * `src/components/sections.ts` instead.
 *
 * Editing a panel here changes the in-app fallback only — the live site reads
 * the `navigation` document in Sanity, so push the change with
 * `npm run sanity:sync-nav` (or edit it in the Studio).
 */

/** @type {{ id: string; label: string; heading: string; body: string[] }[]} */
export const NAV_SECTIONS = [
  {
    id: "curriculum",
    label: "Curriculum",
    heading: "Build your education around what you want to pursue.",
    body: [
      "At HAA, your own pursuits are at the center of your education.",
      "You might start a company, build a new technology, conduct research, make art, write, master a new skill, read a book, or follow a question far enough to discover where it leads.",
      "Courses, faculty, mentors, peers, companies, and the wider HAA network exist around that work: to challenge you, expand what you know, and help you go further.",
    ],
  },
  {
    id: "network",
    label: "Network",
    heading: "The people around you change what becomes possible.",
    body: [
      "HAA brings together people and institutions at the frontier of technology, science, entrepreneurship, investing, and culture.",
      "Some will teach you for weeks. Some will come for a single unforgettable conversation. Others will offer advice, open doors, help you find your way through a problem, or create opportunities to work and build in the real world.",
    ],
  },
  {
    id: "student-life",
    label: "Student Life",
    heading: "A residential campus built for making things.",
    body: [
      "Everyone lives on campus for two years, surrounded by people doing unreasonably ambitious work.",
      "Studios, labs, and shops stay open late, and the day is structured around the work rather than around the timetable.",
    ],
  },
  {
    id: "admissions",
    label: "Admissions",
    heading: "We read for evidence, not credentials.",
    body: [
      "Applications open once a year. We look for what you have already made, questioned, or taught yourself.",
      "There is no test score and no minimum age. Show us the work and tell us where you intend to take it.",
    ],
  },
  {
    id: "about",
    label: "About",
    heading: "Education for an age of infinite doing.",
    body: [
      "The internet made it possible to learn almost anything. AI is making it possible to do things that once required years of training, large teams, or access to specialized institutions.",
      "An eighteen-year-old today can start a company, build software, make a film, conduct research, reach millions of people, or teach themselves a field from scratch.",
      "That changes what it means to be educated.",
      "HAA exists for this moment.",
    ],
  },
];
