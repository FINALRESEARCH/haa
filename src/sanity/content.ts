import { stegaClean } from "next-sanity";
import { cache } from "react";
import { DEFAULT_CONTENT } from "@/content/defaults";
import type {
  Cta,
  NavPanel,
  PartnerLogo,
  Picture,
  Portrait,
  SiteContent,
} from "@/content/types";
import { imageUrl } from "./image";
import { sanityFetch } from "./live";
import { SITE_CONTENT_QUERY } from "./queries";

/** Roughly 2× the largest CSS box each image is ever drawn into. */
const PORTRAIT_WIDTH = 800;
const PLATE_WIDTH = 2100;
const LOGO_WIDTH = 400;
// Crawlers read this at face value; no need to serve it at retina width.
const OG_IMAGE_WIDTH = 1200;

type Raw = Record<string, unknown> | null | undefined;

const obj = (value: unknown): Raw =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

/** Empty and missing are the same thing here: fall back to the default. */
function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

/**
 * Values that end up inside a `<style>` block or an SVG `d` attribute, where a
 * stray character breaks the rule outright. Stega's invisible markers have to
 * come off first, and anything that still looks wrong falls back.
 */
function raw(value: unknown, fallback: string, allowed: RegExp): string {
  if (typeof value !== "string") return fallback;
  const cleaned = stegaClean(value).trim();
  return cleaned !== "" && allowed.test(cleaned) ? cleaned : fallback;
}

const COLOUR = /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,%\s]+\))$/;
const SVG_PATH = /^[\d\s,.eE+-]*[MmZzLlHhVvCcSsQqTtAa][A-Za-z\d\s,.eE+-]*$/;

function paragraphs(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const kept = value.filter(
    (entry): entry is string => typeof entry === "string" && entry.trim() !== "",
  );
  return kept.length ? kept : fallback;
}

function cta(value: unknown, fallback: Cta): Cta {
  const raw = obj(value);
  return {
    label: str(raw?.label, fallback.label),
    href: str(raw?.href, fallback.href),
  };
}

/** A whole row of links. A half-filled entry is dropped rather than rendered. */
function ctas(value: unknown, fallback: Cta[]): Cta[] {
  if (!Array.isArray(value)) return fallback;
  const kept: Cta[] = [];
  for (const entry of value) {
    const raw = obj(entry);
    const label = str(raw?.label, "");
    const href = str(raw?.href, "");
    if (!label || !href) continue;
    kept.push({ label, href });
  }
  return kept.length ? kept : fallback;
}

function picture(value: unknown, fallback: Picture): Picture {
  const raw = obj(value);
  const src = imageUrl(raw as never, PLATE_WIDTH);
  if (!src) return fallback;
  return { src, alt: str(raw?.alt, fallback.alt) };
}

function portraits(value: unknown, fallback: Portrait[]): Portrait[] {
  if (!Array.isArray(value)) return fallback;
  const kept: Portrait[] = [];
  for (const entry of value) {
    const raw = obj(entry);
    const src = imageUrl(raw?.portrait as never, PORTRAIT_WIDTH);
    if (!src) continue;
    kept.push({
      src,
      name: str(raw?.name, ""),
      affiliation: str(raw?.affiliation, ""),
    });
  }
  return kept.length ? kept : fallback;
}

function logos(value: unknown, fallback: PartnerLogo[]): PartnerLogo[] {
  if (!Array.isArray(value)) return fallback;
  const kept: PartnerLogo[] = [];
  for (const entry of value) {
    const raw = obj(entry);
    const src = imageUrl(raw?.logo as never, LOGO_WIDTH);
    if (!src) continue;
    kept.push({
      src,
      name: str(raw?.name, ""),
      scale: typeof raw?.scale === "number" && raw.scale > 0 ? raw.scale : 1,
    });
  }
  return kept.length ? kept : fallback;
}

function navPanels(value: unknown, fallback: NavPanel[]): NavPanel[] {
  if (!Array.isArray(value)) return fallback;
  const kept: NavPanel[] = [];
  for (const entry of value) {
    const raw = obj(entry);
    const id = str(raw?.anchor, "");
    const label = str(raw?.label, "");
    if (!id || !label) continue;
    kept.push({
      id,
      label,
      heading: str(raw?.heading, ""),
      body: paragraphs(raw?.body, []),
      readMoreLabel: str(raw?.readMoreLabel, "Read more"),
    });
  }
  return kept.length ? kept : fallback;
}

/** Lay whatever the dataset returned over `DEFAULT_CONTENT`, field by field. */
export function mergeContent(data: unknown): SiteContent {
  const root = obj(data);
  const settings = obj(root?.settings);
  const home = obj(root?.home);
  const fallback = DEFAULT_CONTENT;

  const hero = obj(home?.hero);
  const network = obj(home?.network);
  const program = obj(home?.program);
  const admissions = obj(home?.admissions);
  const peopleWall = obj(home?.peopleWall);
  const partners = obj(home?.partners);
  const life = obj(home?.life);
  const closing = obj(home?.closing);

  return {
    settings: {
      title: str(settings?.title, fallback.settings.title),
      description: str(settings?.description, fallback.settings.description),
      applyCta: cta(settings?.applyCta, fallback.settings.applyCta),
      fullLogo:
        imageUrl(settings?.fullLogo as never, LOGO_WIDTH) ??
        fallback.settings.fullLogo,
      wordmark:
        imageUrl(settings?.wordmark as never, LOGO_WIDTH) ??
        fallback.settings.wordmark,
      markPath: raw(settings?.markPath, fallback.settings.markPath, SVG_PATH),
      favicon:
        imageUrl(settings?.favicon as never, LOGO_WIDTH) ??
        fallback.settings.favicon,
      // No fallback: blank means blank until the client supplies one.
      ogImage: imageUrl(settings?.ogImage as never, OG_IMAGE_WIDTH) ?? null,
      theme: {
        background: raw(settings?.background, fallback.settings.theme.background, COLOUR),
        foreground: raw(settings?.foreground, fallback.settings.theme.foreground, COLOUR),
        brand: raw(settings?.brand, fallback.settings.theme.brand, COLOUR),
        panel: raw(settings?.panel, fallback.settings.theme.panel, COLOUR),
        rule: raw(settings?.rule, fallback.settings.theme.rule, COLOUR),
      },
    },

    nav: navPanels(root?.nav, fallback.nav),

    sections: {
      hero: {
        layout: str(hero?.layout, fallback.sections.hero.layout),
        headline: str(hero?.headline, fallback.sections.hero.headline),
        body: str(hero?.body, fallback.sections.hero.body),
        cta: cta(hero?.cta, fallback.sections.hero.cta),
        // The sweeping mark is the same drawing as the one in the nav.
        markPath: raw(settings?.markPath, fallback.sections.hero.markPath, SVG_PATH),
      },
      network: {
        heading: str(network?.heading, fallback.sections.network.heading),
        body: str(network?.body, fallback.sections.network.body),
        cta: cta(network?.cta, fallback.sections.network.cta),
        portraits: portraits(
          network?.portraits,
          fallback.sections.network.portraits,
        ),
      },
      program: {
        heading: str(program?.heading, fallback.sections.program.heading),
        subheading: str(
          program?.subheading,
          fallback.sections.program.subheading,
        ),
        paragraphs: paragraphs(
          program?.paragraphs,
          fallback.sections.program.paragraphs,
        ),
        cta: cta(program?.cta, fallback.sections.program.cta),
      },
      admissions: {
        image: picture(admissions?.image, fallback.sections.admissions.image),
        heading: str(admissions?.heading, fallback.sections.admissions.heading),
        paragraphs: paragraphs(
          admissions?.paragraphs,
          fallback.sections.admissions.paragraphs,
        ),
        cta: cta(admissions?.cta, fallback.sections.admissions.cta),
      },
      people: {
        layout: str(peopleWall?.layout, fallback.sections.people.layout),
        heading: str(peopleWall?.heading, fallback.sections.people.heading),
        paragraphs: paragraphs(
          peopleWall?.paragraphs,
          fallback.sections.people.paragraphs,
        ),
        tiles: portraits(peopleWall?.tiles, fallback.sections.people.tiles),
        // The applicant tiles are local files cut by `scripts/encode-loops.mjs`,
        // not Sanity assets, so the dataset has nothing to override here yet.
        applicants: fallback.sections.people.applicants,
      },
      partners: {
        layout: str(partners?.layout, fallback.sections.partners.layout),
        eyebrow: str(partners?.eyebrow, fallback.sections.partners.eyebrow),
        heading: str(partners?.heading, fallback.sections.partners.heading),
        body: str(partners?.body, fallback.sections.partners.body),
        logos: logos(partners?.logos, fallback.sections.partners.logos),
      },
      life: {
        layout: str(life?.layout, fallback.sections.life.layout),
        image: picture(life?.image, fallback.sections.life.image),
        heading: str(life?.heading, fallback.sections.life.heading),
        paragraphs: paragraphs(
          life?.paragraphs,
          fallback.sections.life.paragraphs,
        ),
        cta: cta(life?.cta, fallback.sections.life.cta),
      },
      closing: {
        layout: str(closing?.layout, fallback.sections.closing.layout),
        heading: str(closing?.heading, fallback.sections.closing.heading),
        paragraphs: paragraphs(
          closing?.paragraphs,
          fallback.sections.closing.paragraphs,
        ),
        // The label is the section's; the destination is the site's one
        // apply link, so the nav button and this one can never drift.
        apply: {
          label: str(closing?.applyLabel, fallback.sections.closing.apply.label),
          href: cta(settings?.applyCta, fallback.settings.applyCta).href,
        },
        links: ctas(closing?.links, fallback.sections.closing.links),
        markPath: raw(
          settings?.markPath,
          fallback.sections.closing.markPath,
          SVG_PATH,
        ),
      },
    },
  };
}

/**
 * `cache` keeps the layout and the page on one round trip per request. If the
 * Content Lake is unreachable we render the defaults rather than a 500.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    const { data } = await sanityFetch({ query: SITE_CONTENT_QUERY });
    return mergeContent(data);
  } catch (error) {
    console.error("[sanity] falling back to default content:", error);
    return DEFAULT_CONTENT;
  }
});
