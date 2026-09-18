import type { Variant } from "@/variants/types";
import v1 from "./v1";

// Add a variant: drop `v2.tsx` in this folder, then add a line here.
export const variants: Variant<"people">[] = [
  { id: "original", label: "Original", Component: v1 },
];
