/**
 * The shape the page renders from. Sanity fills it in; `defaults.ts` backs
 * every field, so an empty dataset or a cleared field still renders the site.
 */

export type Cta = { label: string; href: string };

export type Portrait = {
  src: string;
  /** Shown in the hover chip; leave empty to suppress the chip. */
  name: string;
  affiliation: string;
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
  /** Mux playback id for the full interview. Empty until the master is uploaded. */
  playbackId: string;
};

/** A Mux asset resolved to the two URLs a plain `<video>` needs. */
export type HeroVideo = { src: string; poster: string };

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
  video: HeroVideo | null;
  /** Copied from `SiteSettings`: the hero sweeps the mark across the screen. */
  markPath: string;
};

export type NetworkContent = {
  heading: string;
  body: string;
  cta: Cta;
  portraits: Portrait[];
};

export type ProgramContent = {
  heading: string;
  subheading: string;
  paragraphs: string[];
  cta: Cta;
};

export type AdmissionsContent = {
  image: Picture;
  heading: string;
  paragraphs: string[];
  cta: Cta;
};

export type PeopleContent = {
  /** Matches a `Variant["id"]` in `src/components/people/index.ts`. */
  layout: string;
  heading: string;
  /** Only the layouts that put the wall in normal flow have room for these. */
  paragraphs: string[];
  tiles: Portrait[];
  /** The marquee layout drifts these instead of `tiles`. */
  applicants: Applicant[];
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

/** Keyed by `SectionDef["key"]`, which is also the `?hero=2` URL param. */
export type SectionContent = {
  hero: HeroContent;
  network: NetworkContent;
  program: ProgramContent;
  admissions: AdmissionsContent;
  people: PeopleContent;
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
};
