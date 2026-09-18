import type { Variant } from "@/variants/types";
import v1 from "./v1";
import v2 from "./v2";
import v3 from "./v3";

// Add a variant: drop `v4.tsx` in this folder, then add a line here and an
// option to the layout picker in `src/sanity/schema/sections.ts`.
export const variants: Variant<"life">[] = [
  { id: "lockup", label: "Lock-up", Component: v1 },
  { id: "split", label: "Ruled split", Component: v2 },
  { id: "bleed", label: "Full-bleed plate", Component: v3 },
];
