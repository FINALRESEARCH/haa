import type { Variant } from "@/variants/types";
import v1 from "./v1";
import v2 from "./v2";
import v3 from "./v3";

// Add a variant: drop `v4.tsx` in this folder, then add a line here and an
// option to the layout picker in `src/sanity/schema/sections.ts`.
export const variants: Variant<"partners">[] = [
  { id: "marquee", label: "Marquee", Component: v1 },
  { id: "rows", label: "Two rows of five", Component: v2 },
  { id: "lattice", label: "Ruled lattice", Component: v3 },
];
