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
      name: "layout",
      type: "string",
      description:
        "Which of the three hero layouts the page ships with. The ?hero= switcher still overrides this locally.",
      options: {
        list: [
          { title: "Original (mark sweeps left on scroll)", value: "original" },
          { title: "Marquee mark (mark loops rightward on its own)", value: "marquee" },
          { title: "Video background (full-bleed footage, white copy)", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "original",
    }),
    defineField({
      name: "headline",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "body", type: "text", rows: 4 }),
    defineField({ name: "cta", type: "cta" }),
    defineField({
      name: "video",
      type: "mux.video",
      title: "Sizzle",
      description:
        'Only the "Video background" layout plays this. It is a muted full-bleed loop, so tick MP4 / static renditions in the upload dialog — the page plays a static rendition rather than an adaptive stream, and an asset without one falls back to the placeholder footage.',
    }),
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
      name: "layout",
      type: "string",
      description:
        "Which of the two people layouts the page ships with. The ?people= switcher still overrides this locally.",
      options: {
        list: [
          { title: "Wall (pinned, heading inverted over the tiles)", value: "wall" },
          { title: "Stacked (heading and copy above the grid)", value: "stacked" },
          { title: "Marquee (two video rows drifting around the copy)", value: "marquee" },
        ],
        layout: "radio",
      },
      initialValue: "wall",
    }),
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      description: "Sits over the wall in mix-blend-difference white.",
      validation: (rule) => rule.required(),
    }),
    paragraphs(
      "paragraphs",
      'One entry per paragraph. Only the "Stacked" layout has room for these.',
    ),
    defineField({
      name: "tiles",
      type: "array",
      description: "Eight portraits: four across on desktop, two rows.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "person" }] })],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: "People wall", subtitle: title }) },
});

export const closingSection = defineType({
  name: "closingSection",
  title: "Closing",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      type: "string",
      description:
        "Which of the two closing layouts the page ships with. The ?closing= switcher still overrides this locally.",
      options: {
        list: [
          { title: "Quiet (type only)", value: "quiet" },
          { title: "Mark (the HAA drawing behind the type)", value: "mark" },
        ],
        layout: "radio",
      },
      initialValue: "quiet",
    }),
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    paragraphs(),
    defineField({
      name: "applyLabel",
      type: "string",
      title: "Apply button label",
      description:
        "The button's destination is the apply link in Site settings, so the form URL is only ever set in one place.",
      initialValue: "Apply to HAA",
    }),
    defineField({
      name: "links",
      type: "array",
      title: "Secondary links",
      description: "The three destinations under the button, in order.",
      of: [defineArrayMember({ type: "cta" })],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: "Closing", subtitle: title }) },
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
          { title: "Traced city (line work fills with colour)", value: "bleed" },
          { title: "Splat field (the plate as a particle cloud)", value: "splat" },
        ],
        layout: "radio",
      },
      initialValue: "splat",
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
      name: "body",
      type: "text",
      rows: 3,
      description: "The single line under the heading.",
    }),
    defineField({
      name: "logos",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "partner" }] })],
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: "Partners", subtitle: title }) },
});
