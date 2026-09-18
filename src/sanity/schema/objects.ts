import { defineArrayMember, defineField, defineType } from "sanity";

/** A link rendered as one of the site's mono-cased labels. */
export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: "Set in the mono face and upper-cased by the site.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      type: "string",
      description:
        "An in-page anchor like `#admissions`, or a full https:// URL.",
      initialValue: "#",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});

/** One column of the nav's drop-down menu. */
export const navPanel = defineType({
  name: "navPanel",
  title: "Menu panel",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: "The word in the menu bar.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "anchor",
      type: "string",
      title: "Anchor id",
      description:
        'Where "Read more" jumps to, without the `#`. Use a section id such as `admissions`.',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9-]+$/, { name: "lowercase letters, digits and -" }),
    }),
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      type: "array",
      description: "One entry per paragraph.",
      of: [defineArrayMember({ type: "text", rows: 3 })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "readMoreLabel",
      type: "string",
      initialValue: "Read more",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "heading" },
  },
});
