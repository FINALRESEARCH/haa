import { HomeIcon } from "@sanity/icons/Home";
import { defineField, defineType } from "sanity";

/**
 * The homepage is one document with one field per screen, in render order.
 * Adding a screen here means adding a section to `src/variants/registry.tsx`.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({ name: "hero", type: "heroSection" }),
    defineField({ name: "network", type: "networkSection" }),
    defineField({ name: "program", type: "programSection" }),
    defineField({ name: "admissions", type: "admissionsSection" }),
    defineField({ name: "peopleWall", type: "peopleWallSection" }),
    defineField({ name: "partners", type: "partnersSection" }),
    defineField({ name: "life", type: "lifeSection" }),
    defineField({ name: "closing", type: "closingSection" }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
