import type { Variant } from "@/variants/types";
import v1 from "./v1";
import v2 from "./v2";

// Add a variant: drop `v3.tsx` in this folder, then add a line here.
// Order is the order in the switcher, and the first is the default.
export const variants: Variant<"program">[] = [
  { id: "schedule", label: "A Day in the Academy", Component: v2 },
  { id: "original", label: "Original", Component: v1 },
];
