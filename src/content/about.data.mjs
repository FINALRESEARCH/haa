/**
 * The /about manifesto, kept as plain JS so `scripts/seed.mjs` and the site
 * can share one copy. Everything that needs types imports it through
 * `defaults.ts`.
 *
 * Editing here changes the in-app fallback only — the live page reads the
 * `aboutPage` document in Sanity.
 */

/**
 * @type {{
 *   layout: string;
 *   eyebrow: string;
 *   heading: string;
 *   opening: string[];
 *   chapters: { heading: string; paragraphs: string[]; links: { label: string; href: string }[] }[];
 *   closing: { applyLabel: string; links: { label: string; href: string }[] };
 * }}
 */
export const ABOUT = {
  layout: "editorial",
  eyebrow: "Why HAA",
  heading: "Education for an age of infinite doing.",
  opening: [
    "The internet made it possible to learn almost anything. AI is making it possible to do things that once required years of training, large teams, or access to specialized institutions.",
    "An eighteen-year-old today can start a company, build software, make a film, conduct research, reach millions of people, or teach themselves a field from scratch.",
    "That changes what it means to be educated.",
    "HAA exists for this moment.",
  ],

  chapters: [
    {
      heading: "When the tools change, education changes with them.",
      paragraphs: [
        "What it means to be educated has never been fixed.",
        "Every major shift in what humans can do has changed what we need to learn, what skills matter, and how we prepare young people for the world ahead.",
        "AI is one of those shifts.",
        "Knowledge still matters deeply. But knowing is no longer enough. The ability to ask good questions, exercise judgment, use powerful tools well, work with exceptional people, and turn ideas into reality matters more than ever.",
        "HAA is building an education around those abilities.",
      ],
      links: [],
    },
    {
      heading: "Learn by pursuing something real.",
      paragraphs: [
        "We believe people learn differently when they care deeply about the outcome.",
        "That is why HAA begins with the student: the company you want to start, the technology you want to understand, the question you cannot stop thinking about, the skill you want to master, the thing you want to make.",
        "Your pursuits create reasons to learn.",
        "Courses give you knowledge when you need it. Mentors offer judgment when you get stuck. Peers challenge your thinking. Working inside a company shows you what great teams actually feel like. Going somewhere unfamiliar changes what you notice.",
        "Education becomes something you participate in rather than something that simply happens to you.",
      ],
      links: [{ label: "Explore the HAA Experience", href: "/curriculum" }],
    },
    {
      heading: "Agency is a skill.",
      paragraphs: [
        "HAA gives students unusual freedom because learning what to do with freedom is part of the education.",
        "You decide what deserves your attention. You seek out the people who can help. You make commitments and follow through on them. You learn when to persist, when to change direction, and when to ask for help.",
        "The goal is not to prescribe what every student should learn or become.",
        "It is to build a culture where ambition, curiosity, experimentation, responsibility, and self-direction are taken seriously.",
      ],
      links: [],
    },
    {
      heading: "Built by a pioneer in education.",
      paragraphs: [
        "Gagan Biyani has spent his career rethinking how people learn.",
        "He co-founded Udemy, helping pioneer a model that made it possible for anyone, anywhere to learn from experts online. Years later, he co-founded Maven, creating a new model for live, cohort-based learning on the internet.",
        "HAA is the next chapter of that work. It asks the question: what becomes possible when ambitious young people, exceptional teachers, mentors, and collaborators spend two formative years together in person?",
      ],
      links: [],
    },
    {
      heading: "Put exceptional young people in the same room.",
      paragraphs: [
        "One of the great things education has always done is bring people together before anyone knows exactly who they will become.",
        "You try things together. You discover who you trust. You meet people whose interests change your own. A classmate becomes a collaborator. A friend becomes a cofounder. Someone introduces you to a field you had never considered.",
        "For unusually ambitious young people, those peers can be difficult to find nearby. Many find one another today through group chats, online communities, hackathons, and the internet.",
        "HAA brings them into the same place.",
      ],
      links: [],
    },
    {
      heading: "Build a life, not just a résumé.",
      paragraphs: [
        "We want HAA students to leave having done things that matter to them.",
        "Maybe you started a company. Maybe you discovered the person you want to build it with. Maybe you became an exceptional engineer, wrote something worth reading, or fell in love with a field you had never encountered before.",
        "Along the way, you should also have made close friends, learned how you work, become more capable of navigating uncertainty, and developed the confidence that comes from taking your own ideas seriously.",
        "The point of HAA is not to tell you what your life should look like.",
        "It is to expand what you are capable of doing with it.",
      ],
      links: [],
    },
  ],

  closing: {
    applyLabel: "Apply",
    links: [
      { label: "Explore the HAA Experience", href: "/curriculum" },
      { label: "Meet the Network", href: "/network" },
    ],
  },
};
