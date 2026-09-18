import { CogIcon } from "@sanity/icons/Cog";
import { defineField, defineType } from "sanity";

/** A hex or rgba() value, fed straight into a CSS custom property. */
const colour = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: "string",
    group: "theme",
    description,
    validation: (rule) =>
      rule
        .required()
        .regex(/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))$/, {
          name: "a hex value or rgb()/rgba()",
        }),
  });

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "meta", title: "Metadata", default: true },
    { name: "identity", title: "Identity" },
    { name: "seo", title: "SEO & sharing" },
    { name: "theme", title: "Theme" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "meta",
      description: "The browser tab and the default share title.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "applyCta",
      title: "Nav button",
      type: "cta",
      group: "identity",
      description: "The button on the right of the nav bar.",
    }),
    defineField({
      name: "fullLogo",
      type: "image",
      group: "identity",
      description: "Mark plus wordmark, shown in the nav on phones.",
      options: { accept: "image/svg+xml,image/png" },
    }),
    defineField({
      name: "wordmark",
      type: "image",
      group: "identity",
      description: "Centred in the nav bar on desktop.",
      options: { accept: "image/svg+xml,image/png" },
    }),
    defineField({
      name: "markPath",
      title: "Mark path",
      type: "text",
      rows: 4,
      group: "identity",
      description:
        "The `d` attribute of the HAA mark, drawn on a 53 × 27 viewBox. Used for the nav mark and the hero sweep.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "favicon",
      type: "image",
      group: "seo",
      description:
        "The browser tab, bookmark, and home-screen icon. Placeholder for now (the HAA mark) — ideally replace with a purpose-drawn square icon before launch.",
      options: { accept: "image/svg+xml,image/png,image/x-icon" },
    }),
    defineField({
      name: "ogImage",
      title: "Sharing image — ⚠️ action item, pending from client",
      type: "image",
      group: "seo",
      description:
        "Shown when the site is shared on social media, Slack, or iMessage. Recommended size 1200 × 630px (JPG or PNG). Left blank on purpose — the client still needs to supply final artwork. Until it's set, shares show no preview image rather than a wrong one.",
      options: { hotspot: true },
    }),
    colour("background", "Background", "Page background, `--background`."),
    colour("foreground", "Foreground", "Body text, `--foreground`."),
    colour("brand", "Brand", "The red used for the mark and links, `--brand`."),
    colour("panel", "Panel", "`--panel`."),
    colour("rule", "Rule", "Hairlines in the nav, `--rule`."),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
