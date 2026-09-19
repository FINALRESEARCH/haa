import { BookIcon } from "@sanity/icons/Book";
import { defineArrayMember, defineField, defineType } from "sanity";
import { COURSE_TYPES } from "../../content/courses.data.mjs";

/**
 * One row of the course directory — a course or a track. The fields are the
 * client's Airtable columns, so an export and a document describe the same
 * thing; see `src/data/courses.ts`, which is the floor until a `course`
 * document exists, at which point the dataset wins outright.
 *
 * /courses renders all of them; /curriculum's featured grid renders the ones
 * ticked `featured`, so the cards there and the rows here cannot drift.
 */
export const course = defineType({
  name: "course",
  title: "Course",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      type: "string",
      description:
        "A course is taught by named instructors. A track is a themed series with a guest-speaker lineup. This is the directory's only filter, so a row without one can be found only by scrolling.",
      options: {
        list: COURSE_TYPES.map(({ value, label }) => ({ value, title: label })),
        layout: "radio",
      },
      initialValue: "course",
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      description:
        "What it covers, in a sentence or two. This is the directory's widest column.",
    }),
    defineField({
      name: "people",
      type: "array",
      description:
        "The instructors of a course, or a track's speaker lineup. One entry per person — the directory joins them itself, so do not put several in one line.",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "affiliation",
      title: "Title & affiliation",
      type: "text",
      rows: 2,
      description:
        "The instructors' current titles and organizations. Courses carry this; tracks do not, because a lineup of speakers has no single one.",
      hidden: ({ parent }) => parent?.type === "track",
    }),
    defineField({
      name: "featured",
      title: "Featured on /curriculum",
      type: "boolean",
      description:
        "Prints this course in the grid on the curriculum page. Eight fills that grid; past eight are simply not reached.",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      type: "type",
      featured: "featured",
    },
    prepare: ({ title, subtitle, type, featured }) => {
      // Plural in the filter row, singular when it describes this one row.
      const label =
        COURSE_TYPES.find((option) => option.value === type)?.label.replace(
          /s$/,
          "",
        ) ?? "";
      return {
        title: title as string,
        subtitle: [featured ? "Featured" : "", label, subtitle]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});

/** The copy at the top of /courses. The rows are the `course` documents. */
export const coursesPage = defineType({
  name: "coursesPage",
  title: "Courses page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "The mono line above the heading.",
      initialValue: "Courses at HAA",
    }),
    defineField({
      name: "heading",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      type: "array",
      description: "One entry per paragraph.",
      of: [defineArrayMember({ type: "text", rows: 3 })],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({
      title: "Courses page",
      subtitle: title as string,
    }),
  },
});
