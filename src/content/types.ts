/**
 * The shape the page renders from. Sanity fills it in; `defaults.ts` backs
 * every field, so an empty dataset or a cleared field still renders the site.
 */

export type Cta = { label: string; href: string };

export type Portrait = {
  src: string;
  /**
   * Printed under the tile, always — parents of applicants will not recognise
   * these faces. An entry without one still takes its place in the grid; it
   * simply goes uncaptioned until the client identifies it.
   */
  name: string;
  /**
   * The title line under the name, in mono: "Founder of OpenAI", "CEO of
   * NVIDIA". What they are, not just where — one line, never a bio.
   */
  affiliation: string;
  /** Fades up over the still on hover. Null until a master is on Mux. */
  video: MuxVideo | null;
};

export type PartnerLogo = {
  src: string;
  name: string;
  /** Optical sizing: a couple of the marks draw small inside their box. */
  scale: number;
};

export type Picture = { src: string; alt: string };

export type Applicant = {
  name: string;
  /** The line under the name: what they are working on, not a job title. */
  pursuit: string;
  /** The silent 4s tile excerpt, cut by `scripts/encode-loops.mjs`. */
  loop: string;
  /** Held until the excerpt decodes, and the whole tile under reduced motion. */
  poster: string;
  /**
   * The full interview, with audio, played in the tile's modal. Null until the
   * master is on Mux *with* an mp4 static rendition — the tile is unclickable
   * until then rather than opening a modal with nothing in it.
   */
  video: MuxVideo | null;
};

/** A Mux asset resolved to the two URLs a plain `<video>` needs. */
export type MuxVideo = { src: string; poster: string };

export type HeroContent = {
  /** Matches a `Variant["id"]` in `src/components/hero/index.ts`. */
  layout: string;
  headline: string;
  body: string;
  cta: Cta;
  /**
   * The sizzle behind the "video" layout. Null until a Mux asset with a static
   * rendition is attached, which is the layout's cue to use its placeholder.
   */
  video: MuxVideo | null;
  /** Copied from `SiteSettings`: the hero sweeps the mark across the screen. */
  markPath: string;
};

export type NetworkContent = {
  /** Matches a `Variant["id"]` in `src/components/network/index.ts`. */
  layout: string;
  heading: string;
  body: string;
  cta: Cta;
  portraits: Portrait[];
};

/** Drives the block's illustration and the label above its title. */
export type ScheduleCategory =
  | "build"
  | "lunch"
  | "learn"
  | "connect"
  | "showcase"
  | "open";

/** One block in the illustrative week. See `src/data/schedule.ts`. */
export type ScheduleEvent = {
  /** 0 = Monday … 4 = Friday. The open day uses -1: it belongs to no weekday. */
  day: number;
  /** Decimal hours, so 16.5 is 4:30 PM. Formatted at render. */
  start: number;
  end: number;
  title: string;
  category: ScheduleCategory;
  description: string;
  image: Picture;
};

export type ProgramContent = {
  heading: string;
  subheading: string;
  /**
   * Only the "Original" layout prints these. The schedule layout that replaced
   * it carries no body copy, but the field stays so the switcher can fall back
   * without the dataset losing the paragraphs.
   */
  paragraphs: string[];
  cta: Cta;
  /** The line above the year grid, next to the "illustrative" disclaimer. */
  gridLabel: string;
  /** Standing in for a date until a day is chosen. */
  gridSummary: string;
  /** The heading the day view shows for every day. */
  dayTitle: string;
  /** The line under it, which turns on whether the square was a weekday. */
  weekdayBody: string;
  weekendBody: string;
  /** The illustrative week a weekday square opens onto. */
  schedule: ScheduleEvent[];
  /** What a weekend square opens onto instead. */
  openDay: ScheduleEvent;
};

/**
 * The merged student section: one heading, a short block of copy, and the
 * applicant row. The workbench plate and the separate "kind of people we're
 * looking for" screen both folded into this — the videos are the only visual.
 */
export type AdmissionsContent = {
  heading: string;
  paragraphs: string[];
  /** The tiles the row drifts. Also reused on `/admissions`. */
  applicants: Applicant[];
  cta: Cta;
};

export type LifeContent = {
  /** Matches a `Variant["id"]` in `src/components/life/index.ts`. */
  layout: string;
  /** The plate that rises and locks. Swap for a video poster if it becomes one. */
  image: Picture;
  heading: string;
  paragraphs: string[];
  cta: Cta;
};

export type PartnersContent = {
  /** Matches a `Variant["id"]` in `src/components/partners/index.ts`. */
  layout: string;
  eyebrow: string;
  heading: string;
  /** The single line under the heading. */
  body: string;
  logos: PartnerLogo[];
};

export type ClosingContent = {
  /** Matches a `Variant["id"]` in `src/components/closing/index.ts`. */
  layout: string;
  heading: string;
  paragraphs: string[];
  /**
   * The primary button. Composed in `src/sanity/content.ts` from this
   * section's label and `settings.applyCta.href`, so the application URL is
   * only ever set in one place — the same trick the hero uses for `markPath`.
   */
  apply: Cta;
  /** The three secondary destinations, in order. */
  links: Cta[];
  /** Copied from `SiteSettings`: the "Mark" layout draws it oversized. */
  markPath: string;
};

/** One numbered movement of the /about manifesto. */
export type AboutChapter = {
  heading: string;
  paragraphs: string[];
  /** Usually empty: only a couple of chapters send you somewhere. */
  links: Cta[];
};

/** The /about page. Its own document, not a slice of the home page. */
export type AboutContent = {
  /** Matches an `AboutVariant["id"]` in `src/components/about/index.ts`. */
  layout: string;
  /** The mono line above the opening statement. */
  eyebrow: string;
  heading: string;
  /** The opening statement, set larger than the chapters that follow. */
  opening: string[];
  chapters: AboutChapter[];
  closing: {
    /**
     * The primary button, composed in `src/sanity/content.ts` from this label
     * and `settings.applyCta.href` — the same trick the closing section uses.
     */
    apply: Cta;
    links: Cta[];
  };
};

/**
 * The blocks a curriculum chapter can print after its type. A value the page
 * has no renderer for is dropped rather than rendered as a hole — see
 * `src/components/curriculum/features.tsx`.
 */
export type CurriculumFeature =
  | "pursuits"
  | "courses"
  | "speakers"
  | "partners"
  | "week"
  | "mentors";

/** A bolded sub-argument inside a chapter, with its own optional blocks. */
export type CurriculumPoint = {
  heading: string;
  paragraphs: string[];
  features: CurriculumFeature[];
};

/** One movement of the /curriculum page. */
export type CurriculumChapter = {
  heading: string;
  /** The single line under the heading, set larger than the paragraphs. */
  lede: string;
  paragraphs: string[];
  points: CurriculumPoint[];
  features: CurriculumFeature[];
  links: Cta[];
};

/**
 * A row of the course directory, as the client's Airtable base defines it —
 * see `src/data/courses.ts`. Both the /courses directory and /curriculum's
 * featured grid render this, so the cards on the curriculum page can never
 * disagree with the catalogue about what a course is called.
 */
export type Course = {
  /** The Sanity `_id`, or the slugged title in the fallback data. */
  id: string;
  title: string;
  /**
   * `course` or `track` — the base's own distinction and the directory's only
   * filter. A course is taught by named instructors; a track is a themed
   * series with a guest-speaker lineup.
   */
  type: string;
  description: string;
  /** The instructors of a course, or a track's speaker lineup. */
  people: string[];
  /** The instructors' titles. Empty on every track: the base has no such column. */
  affiliation: string;
  /** Printed on /curriculum's featured grid. Set in the Studio, not Airtable. */
  featured: boolean;
};

/** The copy at the top of /courses. The rows come from `Course`. */
export type CoursesPageContent = {
  eyebrow: string;
  heading: string;
  intro: string[];
};

/**
 * One block in a day column of the "no typical week" calendar. `span` is its
 * share of the column's height, not a number of hours — the page draws the
 * shape of a week without claiming a timetable the school hasn't set.
 */
export type CurriculumEntry = { label: string; span: number };

/** One day column of the "no typical week" calendar. */
export type CurriculumDay = { day: string; entries: CurriculumEntry[] };

/** The /curriculum page. Its own document, like /about. */
export type CurriculumContent = {
  /** The mono line above the heading. */
  eyebrow: string;
  heading: string;
  opening: string[];
  chapters: CurriculumChapter[];
  pursuits: string[];
  week: CurriculumDay[];
  closing: {
    heading: string;
    /**
     * Composed in `src/sanity/content.ts` from this page's label and
     * `settings.applyCta.href`, the same as /about's.
     */
    apply: Cta;
  };
};

/** Keyed by `SectionDef["key"]`, which is also the `?hero=2` URL param. */
export type SectionContent = {
  hero: HeroContent;
  network: NetworkContent;
  program: ProgramContent;
  admissions: AdmissionsContent;
  partners: PartnersContent;
  life: LifeContent;
  closing: ClosingContent;
};

export type SectionKey = keyof SectionContent;

export type NavPanel = {
  /** Anchor the panel's "Read more" jumps to, and the hash that opens it. */
  id: string;
  label: string;
  heading: string;
  body: string[];
  readMoreLabel: string;
};

export type Theme = {
  background: string;
  foreground: string;
  brand: string;
  panel: string;
  rule: string;
};

export type SiteSettings = {
  title: string;
  description: string;
  applyCta: Cta;
  fullLogo: string;
  wordmark: string;
  /** The `d` attribute of the HAA mark, on a 53 × 27 viewBox. */
  markPath: string;
  /** Browser tab / bookmark / home-screen icon. Always has a value. */
  favicon: string;
  /**
   * The social-share preview image (og:image / twitter:image). Unlike every
   * other field here, `null` is a real, intended state: it stays blank until
   * the client supplies final artwork, rather than falling back to a
   * placeholder that would ship as if it were the real thing.
   */
  ogImage: string | null;
  theme: Theme;
};

export type SiteContent = {
  settings: SiteSettings;
  nav: NavPanel[];
  sections: SectionContent;
  about: AboutContent;
  curriculum: CurriculumContent;
  courses: CoursesPageContent;
};

/**
 * A `person` document as the /network directory needs it: the portrait plus
 * the two things the directory is filtered and linked by. The homepage grid
 * reads the same documents through `Portrait` and ignores all of this.
 */
export type NetworkPerson = {
  /** The Sanity `_id`, or a slug in the fallback data. */
  id: string;
  /**
   * The portrait, at the size the pinned panel draws it. Undefined is the
   * common case, not an edge one: Airtable has no photo column, so a row has
   * a picture only once someone has uploaded one in the Studio. The directory
   * draws a monogram for the rest.
   */
  src?: string;
  /** The same portrait at row-thumbnail size. */
  thumb?: string;
  name: string;
  /** The line under the name: "OpenAI", not a sentence. */
  affiliation: string;
  /**
   * `RELATIONSHIPS` values. Several is normal — a firm is often both a
   * founding and a hiring partner — and empty is possible mid-edit.
   */
  relationships: string[];
  /** `FIELDS` values. Empty is normal. */
  fields: string[];
  /** Where the name links. Empty prints the name unlinked. */
  profileUrl: string;
};
