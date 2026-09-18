import type { SiteContent } from "@/content/types";
import { SECTIONS } from "./registry";
import type { SectionDef, Selection } from "./types";

/**
 * The switcher runs everywhere, including production deploys, so a variant
 * combination can be demoed from the live URL. Set NEXT_PUBLIC_VARIANTS=0 to
 * turn it off once the site is public.
 */
export function variantsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_VARIANTS !== "0";
}

/**
 * The layout the Studio asked for. Only sections with more than one variant
 * expose the field, so everything else falls through to the first variant.
 */
function chosenIndex(section: SectionDef, content: SiteContent): number {
  const { layout } = content.sections[section.key] as { layout?: string };
  const index = layout ? section.variantIds.indexOf(layout) : -1;
  return index >= 0 ? index : 0;
}

/** Every section on the variant Sanity publishes. */
export function defaultSelection(content: SiteContent): Selection {
  return Object.fromEntries(
    SECTIONS.map((section) => [section.key, chosenIndex(section, content)]),
  );
}

/** Clamp a raw `?hero=2` style value to a real variant index. */
function parseIndex(
  raw: string | string[] | undefined,
  count: number,
  fallback: number,
): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (!Number.isInteger(n)) return fallback;
  return n >= 1 && n <= count ? n - 1 : fallback;
}

export function selectionFromParams(
  params: Record<string, string | string[] | undefined>,
  content: SiteContent,
): Selection {
  const defaults = defaultSelection(content);
  return Object.fromEntries(
    SECTIONS.map((section) => [
      section.key,
      parseIndex(
        params[section.key],
        section.variantIds.length,
        defaults[section.key],
      ),
    ]),
  );
}
