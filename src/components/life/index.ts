import type { Variant } from "@/variants/types";
import v1 from "./v1";
import v2 from "./v2";
import v3 from "./v3";

// Add a variant: drop `v3.tsx` in this folder, then add a line here and an
// option to the layout picker in `src/sanity/schema/sections.ts`.
export const variants: Variant<"life">[] = [
  { id: "lockup", label: "Lock-up", Component: v1 },
  { id: "bleed", label: "Traced city", Component: v2 },
  { id: "splat", label: "Splat field", Component: v3 },
];
