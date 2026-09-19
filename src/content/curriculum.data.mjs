/**
 * The /curriculum page — "The HAA Experience" — kept as plain JS so
 * `scripts/seed.mjs` and the site can share one copy, exactly as
 * `about.data.mjs` is. Everything that needs types imports it through
 * `defaults.ts`.
 *
 * Editing here changes the in-app fallback only — the live page reads the
 * `curriculumPage` document in Sanity.
 *
 * A chapter is a heading, a lede set larger than the body, its paragraphs,
 * and then its `points` — the bolded sub-arguments the client's copy runs
 * under several of the chapters. `features` names the ready-made blocks a
 * chapter or a point prints after its type; the page has no way to invent one
 * that isn't in `src/components/curriculum/features.tsx`.
 */

/**
 * @typedef {{ heading: string; paragraphs: string[]; features: string[] }} Point
 * @typedef {{
 *   heading: string;
 *   lede: string;
 *   paragraphs: string[];
 *   points: Point[];
 *   features: string[];
 *   links: { label: string; href: string }[];
 * }} Chapter
 */

/**
 * @type {{
 *   eyebrow: string;
 *   heading: string;
 *   opening: string[];
 *   chapters: Chapter[];
 *   pursuits: string[];
 *   week: { day: string; entries: { label: string; span: number }[] }[];
 *   closing: { heading: string; applyLabel: string };
 * }}
 */
export const CURRICULUM = {
  eyebrow: "The HAA Experience",
  heading: "Build your education around what you want to pursue.",
  opening: [
    "At HAA, your pursuits are at the center of your education. Start a company, build a new technology, conduct research, make art, master a skill, read deeply, or follow a question wherever it leads. Courses, mentors, peers, companies, and the wider HAA network are there to help you go further.",
  ],

  chapters: [
    {
      heading: "Follow your obsessions.",
      lede: "At HAA, you have an unusual amount of freedom to decide what deserves your time.",
      paragraphs: [
        "You choose what to pursue, how deeply to pursue it, when to keep going, and when something new is worth following instead. That freedom can be exhilarating, but it also asks you to be proactive, independent, and honest about how you are using your time.",
      ],
      points: [
        {
          heading: "Pursue what matters to you.",
          paragraphs: [
            "There is no prescribed kind of project at HAA. You might devote yourself to one thing for months, or follow several interests at once. You might start a company, conduct research, make art, master a skill, or disappear down a question you cannot stop thinking about.",
          ],
          features: [],
        },
        {
          heading: "Own your direction.",
          paragraphs: [
            "No one is going to hand you a checklist of what to work on next. You should be able to say what you are pursuing, why you care about it, and what you want to accomplish or understand. The direction is yours.",
          ],
          features: [],
        },
        {
          heading: "Make your progress visible.",
          paragraphs: [
            "You are independent, but not alone. Each week, you meet with your peers to share what moved forward, where you got stuck, and what you want to do next. Progress is measured in the work itself and the commitments you follow through on.",
          ],
          features: [],
        },
        {
          heading: "Learn to ask for what you need.",
          paragraphs: [
            "Faculty, mentors, staff, peers, experts, and the wider HAA network are there when you need perspective, feedback, introductions, or help getting unstuck. Part of becoming more capable is learning to recognize what you need, find the right person, and ask.",
          ],
          features: [],
        },
      ],
      features: ["pursuits"],
      links: [],
    },

    {
      heading: "Learn from people at the frontier of their fields.",
      lede: "Courses at HAA are concentrated, multi-session experiences taught by people with deep firsthand expertise.",
      paragraphs: [
        "You choose the courses that are most relevant to what you’re pursuing or what you’re curious to understand, so the time you spend in a classroom is valuable and fun.",
        "Faculty will spend several weeks taking you deep into an area they know exceptionally well. Guest speakers come to HAA for one-off conversations, lectures, workshops, and other encounters that expose you to remarkable people and ideas.",
      ],
      points: [],
      features: ["courses", "speakers"],
      links: [
        { label: "Explore all courses", href: "/courses" },
        { label: "Meet the network", href: "/network" },
      ],
    },

    {
      heading: "Take your education into the world.",
      lede: "Some things cannot be learned on a campus.",
      paragraphs: [],
      points: [
        {
          heading: "Work inside a company.",
          paragraphs: [
            "Every HAA student spends at least three months working full-time inside a company.",
            "You choose an organization that matches your interests and ambitions. HAA helps you access strong opportunities through its network, while you take responsibility for finding the environment where you will learn the most.",
            "For three months, you become part of a real team, contribute real work, and see from the inside how an ambitious organization operates.",
          ],
          features: ["partners"],
        },
        {
          heading: "Go somewhere your question takes you.",
          paragraphs: [
            "Every student also spends three to four weeks pursuing a project somewhere in the world.",
            "The destination begins with the pursuit. You might travel because a particular technology, craft, community, ecosystem, industry, culture, or field of research can be understood differently there.",
            "HAA helps make the experience possible with funding and access to people in its global network.",
            "The point is not simply to travel. It is to let the world become part of your education.",
          ],
          features: [],
        },
      ],
      features: [],
      links: [],
    },

    {
      heading: "There is no typical week at HAA.",
      lede: "Your time takes shape around what you’re pursuing.",
      paragraphs: [
        "One week might pull you deep into a project. Another might include a course you’ve been waiting to take, a conversation with a mentor, or a guest speaker whose work opens up an entirely new direction.",
        "What stays constant is that your time is yours to use deliberately, with Friday Reviews bringing you back together with your peers to share progress and decide what comes next.",
      ],
      points: [],
      features: ["week"],
      links: [],
    },

    {
      heading: "A network within reach.",
      lede: "When you need expertise, perspective, feedback, an introduction, or simply someone who has encountered the problem before, HAA gives you people to turn to.",
      paragraphs: [
        "Mentors from across technology, entrepreneurship, creative fields, leadership, and other areas hold recurring office hours and make themselves available to students.",
        "The expectation is not that someone will tell you what to do next. It is that when you need help, you learn to seek out the right person and ask.",
      ],
      points: [],
      features: ["mentors"],
      links: [{ label: "Explore the network", href: "/network" }],
    },
  ],

  /** The "pursuits" block: eight examples, not a menu to choose from. */
  pursuits: [
    "Start a company",
    "Build a robot",
    "Conduct independent research",
    "Write a book",
    "Make a film",
    "Learn a new field",
    "Create an artwork",
    "Explore a difficult question",
  ],

  /**
   * The "one week at HAA" calendar. Every entry is something the copy above
   * already names — pursuit time, courses, mentors, guest speakers and the
   * Friday Review — rather than an invented timetable.
   *
   * `span` is the block's share of its column, which is what gives the grid a
   * calendar's shape: a course block runs long, office hours are a slot. It
   * is deliberately not a number of hours, and the page prints no clock, so
   * nothing here commits the school to a schedule it hasn't set. The spans in
   * each day add to the same total so the five columns line up.
   */
  week: [
    {
      day: "Monday",
      entries: [
        { label: "Course block", span: 4 },
        { label: "Pursuit time", span: 7 },
      ],
    },
    {
      day: "Tuesday",
      entries: [
        { label: "Pursuit time", span: 5 },
        { label: "Mentor office hours", span: 2 },
        { label: "Pursuit time", span: 4 },
      ],
    },
    {
      day: "Wednesday",
      entries: [
        { label: "Course block", span: 4 },
        { label: "Pursuit time", span: 7 },
      ],
    },
    {
      day: "Thursday",
      entries: [
        { label: "Pursuit time", span: 7 },
        { label: "Guest speaker", span: 2 },
        { label: "Pursuit time", span: 2 },
      ],
    },
    {
      day: "Friday",
      entries: [
        { label: "Pursuit time", span: 8 },
        { label: "Friday Review", span: 3 },
      ],
    },
  ],

  closing: {
    heading: "What will you pursue?",
    applyLabel: "Apply",
  },
};
