import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The blocks a chapter or a point can print after its type. The page can only
 * draw what `src/components/curriculum/features.tsx` has a renderer for, so
 * this list and that file are edited together.
 */
const FEATURES = [
  { title: "Example pursuits", value: "pursuits" },
  { title: "Featured courses (from the catalogue)", value: "courses" },
  { title: "Guest lecturers (from the network)", value: "speakers" },
  { title: "Co-op partners (logos)", value: "partners" },
  { title: "One week at HAA", value: "week" },
  { title: "Mentors (from the network)", value: "mentors" },
];

const features = (description: string) =>
  defineField({
    name: "features",
    title: "Blocks",
    type: "array",
    description,
    of: [defineArrayMember({ type: "string" })],
    options: { list: FEATURES },
  });

/** A bolded sub-argument inside a chapter. */
const curriculumPoint = defineType({
  name: "curriculumPoint",
  title: "Point",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paragraphs",
      type: "array",
      description: "One entry per paragraph.",
      of: [defineArrayMember({ type: "text", rows: 3 })],
      validation: (rule) => rule.min(1),
    }),
    features("Optional. Printed under this point rather than at the foot of the chapter."),
  ],
  preview: {
    select: { title: "heading", paragraphs: "paragraphs" },
    prepare: ({ title, paragraphs }) => ({
      title: title as string,
      subtitle: `${(paragraphs as unknown[] | undefined)?.length ?? 0} paragraph(s)`,
    }),
  },
});

/** One movement of the page: a heading, a lede, body, then its points. */
const curriculumChapter = defineType({
  name: "curriculumChapter",
  title: "Chapter",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lede",
      type: "text",
      rows: 3,
      description: "The single line under the heading, set larger than the paragraphs.",
    }),
    defineField({
      name: "paragraphs",
      type: "array",
      description: "One entry per paragraph. A chapter may have none and carry only its points.",
      of: [defineArrayMember({ type: "text", rows: 3 })],
    }),
    defineField({
      name: "points",
      type: "array",
      description: "The bolded sub-arguments under the chapter, in order.",
      of: [defineArrayMember({ type: "curriculumPoint" })],
    }),
    features("Optional. Printed at the foot of the chapter, after its points."),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      description: "Optional. Printed as mono arrow links under the chapter.",
      of: [defineArrayMember({ type: "cta" })],
    }),
  ],
  preview: {
    select: { title: "heading", points: "points" },
    prepare: ({ title, points }) => ({
      title: title as string,
      subtitle: `${(points as unknown[] | undefined)?.length ?? 0} point(s)`,
    }),
  },
});

/** One block in a day column of the "no typical week" calendar. */
const curriculumEntry = defineType({
  name: "curriculumEntry",
  title: "Block",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "span",
      title: "Height",
      type: "number",
      description:
        "The block's share of its column — a course block runs long, office hours are a slot. Not hours: the page prints no clock. Give every day the same total so the five columns line up.",
      initialValue: 4,
      validation: (rule) => rule.min(1).max(24),
    }),
  ],
  preview: {
    select: { title: "label", span: "span" },
    prepare: ({ title, span }) => ({
      title: title as string,
      subtitle: `height ${(span as number | undefined) ?? 1}`,
    }),
  },
});

/** One day column of the "no typical week" calendar. */
const curriculumDay = defineType({
  name: "curriculumDay",
  title: "Day",
  type: "object",
  fields: [
    defineField({
      name: "day",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "entries",
      title: "Blocks",
      type: "array",
      description: "What fills the day, top to bottom.",
      of: [defineArrayMember({ type: "curriculumEntry" })],
    }),
  ],
  preview: {
    select: { title: "day", entries: "entries" },
    prepare: ({ title, entries }) => ({
      title: title as string,
      subtitle:
        (entries as { label?: string }[] | undefined)
          ?.map((entry) => entry?.label ?? "")
          .filter(Boolean)
          .join(" · ") ?? "",
    }),
  },
});

/**
 * /curriculum — "The HAA Experience". `src/content/curriculum.data.mjs` backs
 * every field, so a cleared field still renders the page.
 *
 * The lists at the foot are the material the `features` blocks draw from.
 * Three of the blocks take nothing from here at all: the lecturer and mentor
 * cards are `person` documents filtered by relationship, and the featured
 * course grid is the `course` documents ticked "Featured on /curriculum", so
 * none of them can drift from the directory that lists them in full.
 */
const curriculumPage = defineType({
  name: "curriculumPage",
  title: "Curriculum page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "The mono line above the heading.",
      initialValue: "The HAA Experience",
    }),
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "opening",
      type: "array",
      description: "The opening statement. One entry per paragraph.",
      of: [defineArrayMember({ type: "text", rows: 3 })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "chapters",
      type: "array",
      of: [defineArrayMember({ type: "curriculumChapter" })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "pursuits",
      title: "Example pursuits",
      type: "array",
      description: 'Drawn by the "Example pursuits" block. Eight reads best.',
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "week",
      title: "One week at HAA",
      type: "array",
      description: 'Drawn by the "One week at HAA" block.',
      of: [defineArrayMember({ type: "curriculumDay" })],
    }),
    defineField({
      name: "closingHeading",
      type: "string",
      description: "The question at the foot of the page.",
      initialValue: "What will you pursue?",
    }),
    defineField({
      name: "applyLabel",
      type: "string",
      description:
        "The primary button at the foot of the page. Its link comes from Site settings, so it can never drift from the other apply buttons.",
      initialValue: "Apply to HAA",
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({
      title: "Curriculum page",
      subtitle: title as string,
    }),
  },
});

export {
  curriculumChapter,
  curriculumDay,
  curriculumEntry,
  curriculumPage,
  curriculumPoint,
};
