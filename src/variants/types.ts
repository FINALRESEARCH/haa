import type { ComponentType, ReactNode } from "react";
import type { SectionContent, SectionKey, SiteContent } from "@/content/types";

// Every section variant receives the anchor id it must render on its root
// element, so Nav's links keep working no matter which variant is active, plus
// the slice of Sanity content that belongs to its section.
export type VariantProps<K extends SectionKey> = {
  id: string;
  content: SectionContent[K];
};

export type Variant<K extends SectionKey> = {
  /** Stable across re-orderings; matches the layout picker in the Studio. */
  id: string;
  /** Row label in the switcher */
  label: string;
  Component: ComponentType<VariantProps<K>>;
};

/**
 * The registry entry, with the variant's content type already erased. Only
 * `defineSection` can build one, and it closes over the section's key so
 * `render` stays type-safe on the inside.
 */
export type SectionDef = {
  /** URL param key, e.g. `?hero=2` */
  key: SectionKey;
  /** Row label in the switcher */
  label: string;
  /** DOM id handed to the active variant */
  anchorId: string;
  variantIds: string[];
  variantLabels: string[];
  render: (index: number, content: SiteContent) => ReactNode;
};

export type Selection = Record<string, number>;
