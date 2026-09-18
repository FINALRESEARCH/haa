import type { Variant } from "@/variants/types";
import v1 from "./v1";
import v2 from "./v2";

// Add a variant: drop `v3.tsx` in this folder, then add a line here and an
// option to the layout picker in `src/sanity/schema/sections.ts`.
export const variants: Variant<"hero">[] = [
  { id: "original", label: "Original", Component: v1 },
  { id: "marquee", label: "Marquee mark", Component: v2 },
];
