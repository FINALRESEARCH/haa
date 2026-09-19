import { UserIcon } from "@sanity/icons/User";
import { defineArrayMember, defineField, defineType } from "sanity";
import { FIELDS, RELATIONSHIPS } from "../../content/taxonomy";

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
        "Printed under the portrait on the network grid, always. Leave it empty and the portrait still shows, just without a caption.",
    }),
    defineField({
      name: "affiliation",
      type: "string",
      description:
        'The second line under the name: "OpenAI", "Stanford". One line, not a bio.',
    }),
    defineField({
      name: "portrait",
      type: "image",
      description:
        "The grid renders these edge to edge in a wide tile, so set the hotspot on the face — the crop is landscape, not the square this was probably shot as. Optional: the directory draws a monogram of the name until there is one, and the homepage grid only shows people who have one.",
      options: { hotspot: true },
    }),
    defineField({
      name: "video",
      type: "mux.video",
      title: "Hover clip",
      description:
        "A few silent seconds of them actually speaking somewhere, which fades up over the portrait on hover. Tick MP4 / static renditions in the upload dialog — the tile plays a static rendition rather than an adaptive stream, and an asset without one simply never appears. Leave empty and the tile stays a still.",
    }),
    defineField({
      name: "relationships",
      title: "Relationships",
      type: "array",
      description:
        "How they are attached to HAA. This is one of the two filters on the /network directory, so an entry without any can only ever be found by scrolling. Several is normal — a firm is often both a founding and a hiring partner.",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: RELATIONSHIPS.map(({ value, label }) => ({ value, title: label })),
      },
    }),
    defineField({
      name: "fields",
      title: "Fields",
      type: "array",
      description:
        "What they work on — the directory's second filter. Several is normal: an investor who writes is both.",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: FIELDS.map(({ value, label }) => ({ value, title: label })),
      },
    }),
    defineField({
      name: "profileUrl",
      title: "Profile link",
      type: "url",
      description:
        "Where their name goes when clicked on the directory — their own site, company page, or profile. Leave it empty and the name simply prints without a link.",
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https"], allowRelative: true }),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "affiliation",
      media: "portrait",
      relationships: "relationships",
    },
    prepare: ({ title, subtitle, media, relationships }) => {
      const roles = (relationships ?? [])
        .map(
          (value: string) =>
            RELATIONSHIPS.find((option) => option.value === value)?.label ??
            value,
        )
        .join(", ");
      return {
        title: title || "Unidentified",
        subtitle: [subtitle, roles].filter(Boolean).join(" \u00b7 "),
        media,
      };
    },
  },
});
