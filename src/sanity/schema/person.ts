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
        "The grid renders these edge to edge in a wide tile, so set the hotspot on the face — the crop is landscape, not the square this was probably shot as.",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "video",
      type: "mux.video",
      title: "Hover clip",
      description:
        "A few silent seconds of them actually speaking somewhere, which fades up over the portrait on hover. Tick MP4 / static renditions in the upload dialog — the tile plays a static rendition rather than an adaptive stream, and an asset without one simply never appears. Leave empty and the tile stays a still.",
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
