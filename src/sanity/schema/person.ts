import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";

export const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      description:
        "Shown in the hover chip on the network grid. Leave empty to suppress the chip.",
    }),
    defineField({
      name: "affiliation",
      type: "string",
      description: 'The half after the comma: "Sam Altman, OpenAI".',
    }),
    defineField({
      name: "portrait",
      type: "image",
      description: "Square crop. The grid renders these edge to edge.",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "affiliation", media: "portrait" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Unidentified",
      subtitle,
      media,
    }),
  },
});
