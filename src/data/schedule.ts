import type { ScheduleEvent } from "@/content/types";

/**
 * One illustrative week of the Academy, ported from the Cloudflare build's
 * `script.js`. Every weekday opens with the same two blocks — three hours of
 * deep work, then lunch — and then diverges through the afternoon.
 *
 * Hours are decimal and local to the schedule, not to a date: `16.5` is 4:30
 * PM. The renderer formats them; nothing here is a `Date`.
 *
 * These live in the repo rather than in Sanity, the same call the applicant
 * tiles make in `src/data/applicants.ts`: the copy is a designed artefact tied
 * to four specific photographs, not a field the client is expected to edit.
 * The lines around it — heading, sub-line, the day-view copy — are all in the
 * dataset.
 */

/** The photograph each kind of block is illustrated with. */
const PHOTOS = {
  build: {
    src: "/schedule/academy-building.jpg",
    alt: "People building together around a laptop",
  },
  lunch: { src: "/schedule/day-lunch.jpg", alt: "A shared meal" },
  connect: {
    src: "/schedule/office-collaboration.jpg",
    alt: "A collaborative workspace",
  },
  studio: {
    src: "/schedule/office-studio.jpg",
    alt: "A studio of people at work",
  },
} as const;

const build = (day: number, start: number, end: number, description: string) =>
  ({
    day,
    start,
    end,
    title: start === 9 ? "Deep work / Build" : "Build & iterate",
    category: "build",
    description,
    image: PHOTOS.build,
  }) satisfies ScheduleEvent;

/**
 * Monday through Friday, 0-indexed. Ordering within a day is by `start`, not
 * by position here, so blocks can be added anywhere in the list.
 */
export const schedule: ScheduleEvent[] = [
  // The shape every weekday shares.
  ...[0, 1, 2, 3, 4].flatMap((day): ScheduleEvent[] => [
    build(
      day,
      9,
      12,
      "Three focused hours to turn your idea into something people can use. Prototype, talk to users, write code, and keep moving.",
    ),
    {
      day,
      start: 12,
      end: 13,
      title: "Lunch together",
      category: "lunch",
      description:
        "Step away from the screen. Share a meal, swap ideas, and get to know the people building alongside you.",
      image: PHOTOS.lunch,
    },
  ]),

  // Monday
  {
    day: 0,
    start: 13,
    end: 14.5,
    title: "Personal brand lab",
    category: "learn",
    description:
      "Find a clear voice for your work. Practice telling the story of what you are building and why it matters.",
    image: PHOTOS.studio,
  },
  {
    day: 0,
    start: 15,
    end: 16.5,
    title: "Mentor office hours",
    category: "connect",
    description:
      "Bring your toughest product, technical, or founder questions to a focused small-group conversation.",
    image: PHOTOS.connect,
  },
  build(
    0,
    16.5,
    18,
    "Apply what you learned, test an assumption, and move your project forward.",
  ),

  // Tuesday
  {
    day: 1,
    start: 13,
    end: 14.5,
    title: "Startup fundamentals",
    category: "learn",
    description:
      "Explore the essentials of starting a company: understanding a customer, choosing a problem, and testing a business model.",
    image: PHOTOS.studio,
  },
  {
    day: 1,
    start: 15,
    end: 17,
    title: "AI workshop",
    category: "learn",
    description:
      "A practical session exploring how to build with AI. Experiment with tools and take a working prototype back to your project.",
    image: PHOTOS.studio,
  },
  build(1, 17, 18, "Put the afternoon’s ideas into practice."),

  // Wednesday
  {
    day: 2,
    start: 13,
    end: 18,
    title: "Hackathon",
    category: "build",
    description:
      "Form a team, choose a problem, and build a working solution. An afternoon for experiments, rapid decisions, and unexpected breakthroughs.",
    image: PHOTOS.build,
  },

  // Thursday
  {
    day: 3,
    start: 13,
    end: 15,
    title: "Sprint challenge",
    category: "learn",
    description:
      "A time-boxed challenge to sharpen your product instincts. Take a brief from first idea to something you can demonstrate.",
    image: PHOTOS.studio,
  },
  {
    day: 3,
    start: 15.5,
    end: 17,
    title: "Mentor office hours",
    category: "connect",
    description:
      "Get feedback on this week’s progress and identify the next most useful step.",
    image: PHOTOS.connect,
  },
  build(3, 17, 18, "Refine the work you want to share with the community."),

  // Friday
  {
    day: 4,
    start: 13,
    end: 16,
    title: "Weekly showcase",
    category: "showcase",
    description:
      "Show what you shipped. Share your progress, learn from your peers, and get concrete feedback for the next iteration.",
    image: PHOTOS.studio,
  },
  {
    day: 4,
    start: 16.5,
    end: 18,
    title: "Founder conversations",
    category: "connect",
    description:
      "Close the week with an open conversation about the real experience of building a company.",
    image: PHOTOS.connect,
  },
];

/** What a Saturday or a Sunday square opens onto: nothing scheduled. */
export const openDay: ScheduleEvent = {
  day: -1,
  start: 10,
  end: 18,
  title: "Explore San Francisco",
  category: "open",
  description:
    "An open day to explore, recharge, and follow your own ideas.",
  image: PHOTOS.studio,
};
