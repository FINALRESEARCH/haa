import type { Variant } from "@/variants/types";
import v1 from "./v1";
import v2 from "./v2";
import v3 from "./v3";

// Add a variant: drop `v4.tsx` in this folder, then add a line here and an
// option to the layout picker in `src/sanity/schema/sections.ts`.
export const variants: Variant<"hero">[] = [
  { id: "original", label: "Original", Component: v1 },
  { id: "marquee", label: "Marquee mark", Component: v2 },
  { id: "video", label: "Video background", Component: v3 },
];
