import { defineArrayMember, defineField, defineType } from "sanity";

/** Paragraph arrays are used all over the page; this keeps them consistent. */
const paragraphs = (name = "paragraphs", description?: string) =>
  defineField({
    name,
    type: "array",
    description: description ?? "One entry per paragraph.",
    of: [defineArrayMember({ type: "text", rows: 3 })],
    validation: (rule) => rule.min(1),
  });

export const heroSection = defineType({
  name: "heroSection",
  title: "Hero",
  type: "object",
  fields: [
    defineField({
      name: "headline",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "body", type: "text", rows: 4 }),
    defineField({ name: "cta", type: "cta" }),
  ],
  preview: { select: { title: "headline" }, prepare: ({ title }) => ({ title: "Hero", subtitle: title }) },
});

export const networkSection = defineType({
  name: "networkSection",
  title: "Network",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "body", type: "text", rows: 4 }),
    defineField({ name: "cta", type: "cta" }),
    defineField({
      name: "portraits",
      type: "array",
      description:
        "The grid. Ten reads best: five across on desktop, two rows.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "person" }] })],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: "Network", subtitle: title }) },
});

export const programSection = defineType({
  name: "programSection",
  title: "Program",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subheading",
      type: "text",
      rows: 2,
      description: "The smaller line directly under the heading.",
    }),
    paragraphs(),
    defineField({ name: "cta", type: "cta" }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: "Program", subtitle: title }) },
});

export const admissionsSection = defineType({
  name: "admissionsSection",
  title: "Admissions",
  type: "object",
  fields: [
    defineField({
      name: "image",
      type: "image",
      description: "The wide plate above the copy. Roughly 2:1.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "heading",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    paragraphs(),
    defineField({ name: "cta", type: "cta" }),
  ],
  preview: { select: { title: "heading", media: "image" }, prepare: ({ title, media }) => ({ title: "Admissions", subtitle: title, media }) },
});

export const peopleWallSection = defineType({
  name: "peopleWallSection",
  title: "People wall",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      description: "Sits over the wall in mix-blend-difference white.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tiles",
      type: "array",
      description: "Eight portraits: four across on desktop, two rows.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "person" }] })],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: "People wall", subtitle: title }) },
});

export const lifeSection = defineType({
  name: "lifeSection",
  title: "Life in San Francisco",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      type: "string",
      description:
        "Which of the three layouts the page ships with. The ?life= switcher still overrides this locally.",
      options: {
        list: [
          { title: "Lock-up (plate rises, heading inverts)", value: "lockup" },
          { title: "Ruled split", value: "split" },
          { title: "Full-bleed plate", value: "bleed" },
        ],
        layout: "radio",
      },
      initialValue: "lockup",
    }),
    defineField({
      name: "image",
      type: "image",
      description:
        "The city plate. Roughly 3:2. A video may replace this later; keep a frame here as the poster.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      description: "Rises over the plate in mix-blend-difference.",
      validation: (rule) => rule.required(),
    }),
    paragraphs(),
    defineField({ name: "cta", type: "cta" }),
  ],
  preview: { select: { title: "heading", media: "image" }, prepare: ({ title, media }) => ({ title: "Life in San Francisco", subtitle: title, media }) },
});

export const partnersSection = defineType({
  name: "partnersSection",
  title: "Partners",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      type: "string",
      description:
        "Which of the three partner layouts the page ships with. The ?partners= switcher still overrides this locally.",
      options: {
        list: [
          { title: "Marquee", value: "marquee" },
          { title: "Two rows of five", value: "rows" },
          { title: "Ruled lattice", value: "lattice" },
        ],
        layout: "radio",
      },
      initialValue: "marquee",
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: 'Only the "Ruled lattice" layout shows this.',
    }),
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logos",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "partner" }] })],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: "Partners", subtitle: title }) },
});
