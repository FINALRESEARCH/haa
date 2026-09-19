import type { ComponentType } from "react";
import type { AboutContent } from "@/content/types";
import v1 from "./v1";
import v2 from "./v2";
import v3 from "./v3";

/**
 * /about is its own route rather than a slice of the home page, so it keeps
 * its own variant list instead of joining `src/variants/registry.ts`. The
 * switcher on the page reads it through `?about=1|2`.
 *
 * Add a variant: drop `v3.tsx` in this folder and add a line here.
 */
export type AboutVariant = {
  /** Stable across re-orderings; matches the layout picker in the Studio. */
  id: string;
  /** Row label in the switcher. */
  label: string;
  Component: ComponentType<{ content: AboutContent }>;
};

export const variants: AboutVariant[] = [
  { id: "editorial", label: "Editorial", Component: v1 },
  { id: "centered", label: "Centred", Component: v2 },
  { id: "document", label: "Document", Component: v3 },
];
