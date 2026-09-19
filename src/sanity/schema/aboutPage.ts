import { defineArrayMember, defineField, defineType } from "sanity";

/** One numbered movement of the manifesto. */
const aboutChapter = defineType({
  name: "aboutChapter",
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
      name: "paragraphs",
      type: "array",
      description: "One entry per paragraph.",
      of: [defineArrayMember({ type: "text", rows: 3 })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      description:
        "Optional. Printed under the chapter as mono arrow links — most chapters have none.",
      of: [defineArrayMember({ type: "cta" })],
    }),
  ],
  preview: {
    select: { title: "heading", paragraphs: "paragraphs" },
    prepare: ({ title, paragraphs }) => ({
      title: title as string,
      subtitle: `${(paragraphs as unknown[] | undefined)?.length ?? 0} paragraph(s)`,
    }),
  },
});

/**
 * The /about manifesto: an opening statement, then the chapters, then the
 * closing buttons. `src/content/about.data.mjs` backs every field, so a
 * cleared field still renders the page.
 */
const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  fields: [
    defineField({
      name: "layout",
      type: "string",
      description:
        "Which of the three layouts the page ships with. The ?about= switcher still overrides this locally.",
      options: {
        list: [
          { title: "Editorial (number and heading beside the argument)", value: "editorial" },
          { title: "Centred (everything stacked down the middle)", value: "centered" },
          { title: "Document (the centred stack, set flush left)", value: "document" },
        ],
        layout: "radio",
      },
      initialValue: "editorial",
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: "The mono line above the opening statement.",
      initialValue: "Why HAA",
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
      description:
        "The opening statement, set larger than the chapters. One entry per paragraph.",
      of: [defineArrayMember({ type: "text", rows: 3 })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "chapters",
      type: "array",
      description: "Numbered on the page in this order.",
      of: [defineArrayMember({ type: "aboutChapter" })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "applyLabel",
      type: "string",
      description:
        "The primary button at the foot of the page. Its link comes from Site settings, so it can never drift from the other apply buttons.",
      initialValue: "Apply to HAA",
    }),
    defineField({
      name: "links",
      title: "Closing links",
      type: "array",
      of: [defineArrayMember({ type: "cta" })],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: "About page", subtitle: title as string }),
  },
});

export { aboutChapter, aboutPage };
