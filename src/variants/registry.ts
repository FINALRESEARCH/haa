import { variants as admissions } from "@/components/admissions";
import { variants as closing } from "@/components/closing";
import { variants as hero } from "@/components/hero";
import { variants as life } from "@/components/life";
import { variants as network } from "@/components/network";
import { variants as partners } from "@/components/partners";
import { variants as people } from "@/components/people";
import { variants as program } from "@/components/program";
import { defineSection } from "./define";
import type { SectionDef } from "./types";

// Order here is the render order of the homepage.
export const SECTIONS: SectionDef[] = [
  defineSection({ key: "hero", label: "Hero", anchorId: "hero", variants: hero }),
  defineSection({
    key: "network",
    label: "Network",
    anchorId: "faculty",
    variants: network,
  }),
  defineSection({
    key: "program",
    label: "Program",
    anchorId: "program",
    variants: program,
  }),
  defineSection({
    key: "admissions",
    label: "Admissions",
    anchorId: "admissions",
    variants: admissions,
  }),
  defineSection({
    key: "people",
    label: "People",
    anchorId: "people",
    variants: people,
  }),
  defineSection({
    key: "partners",
    label: "Partners",
    anchorId: "partners",
    variants: partners,
  }),
  defineSection({ key: "life", label: "Life", anchorId: "life", variants: life }),
  defineSection({
    key: "closing",
    label: "Closing",
    anchorId: "closing",
    variants: closing,
  }),
];
