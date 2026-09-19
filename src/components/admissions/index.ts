import type { Variant } from "@/variants/types";
import v1 from "./v1";

// Add a variant: drop `v2.tsx` in this folder, then add a line here.
export const variants: Variant<"admissions">[] = [
  { id: "marquee", label: "Marquee", Component: v1 },
];
