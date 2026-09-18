import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { defineField, defineType } from "sanity";

export const partner = defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      type: "image",
      description:
        "An SVG on a transparent background. The site paints it black.",
      options: { accept: "image/svg+xml,image/png" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "scale",
      type: "number",
      description:
        "Optical sizing. 1 is the default; raise it for marks that draw small inside their box.",
      initialValue: 1,
      validation: (rule) => rule.min(0.2).max(4),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "scale", media: "logo" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle && subtitle !== 1 ? `scale ${subtitle}` : undefined,
      media,
    }),
  },
});
