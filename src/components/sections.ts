/**
 * The typed view of the nav panel copy. The copy itself lives in
 * `src/content/nav.data.mjs`, which the Sanity scripts read too, so the
 * fallback and the dataset can be pushed from one place.
 */
import { NAV_SECTIONS } from "@/content/nav.data.mjs";

export type Section = {
  id: string;
  label: string;
  heading: string;
  body: string[];
};

export const sections: Section[] = NAV_SECTIONS;
