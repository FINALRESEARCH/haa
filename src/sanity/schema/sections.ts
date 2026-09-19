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
      initialValue: "video",
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
      name: "layout",
      type: "string",
      description:
        "Which of the two speaker layouts the page ships with. The ?network= switcher still overrides this locally.",
      options: {
        list: [
          { title: "Tiles (one wide tile per speaker, names underneath)", value: "tiles" },
          { title: "Original (five-across grid, names on hover)", value: "original" },
        ],
        layout: "radio",
      },
      initialValue: "tiles",
    }),
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
    defineField({
      name: "gridLabel",
      type: "string",
      description:
        "Sits above the year grid. Keep it honest — the grid is not student data.",
    }),
    defineField({
      name: "gridSummary",
      type: "string",
      description: "Under the grid, until a day is picked.",
    }),
    defineField({
      name: "dayTitle",
      type: "string",
      description: "The heading shown after a square is opened.",
    }),
    defineField({
      name: "weekdayBody",
      type: "text",
      rows: 3,
      description: "The line under it when the square was a weekday.",
    }),
    defineField({
      name: "weekendBody",
      type: "text",
      rows: 3,
      description: "And when it was a Saturday or a Sunday.",
    }),
    // The week itself is not a field: it lives in `src/data/schedule.ts`,
    // tied to four specific photographs. See the note there.
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: "Program", subtitle: title }) },
});

export const admissionsSection = defineType({
  name: "admissionsSection",
  title: "Students",
  type: "object",
  description:
    "One title, a little copy, and the applicant video row. The row is built from the Applicant documents, not from this section.",
  fields: [
    defineField({
      name: "heading",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    paragraphs(
      "paragraphs",
      "One entry per paragraph. Keep it short — the videos under it are the section.",
    ),
    defineField({ name: "cta", type: "cta" }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: "Students", subtitle: title }) },
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
      initialValue: "bleed",
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
      initialValue: "rows",
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
