import { MenuIcon } from "@sanity/icons/Menu";
import { defineArrayMember, defineField, defineType } from "sanity";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  icon: MenuIcon,
  fields: [
    defineField({
      name: "items",
      title: "Menu panels",
      type: "array",
      description:
        "Left to right in the menu bar. Each one opens the panel below it.",
      of: [defineArrayMember({ type: "navPanel" })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: { prepare: () => ({ title: "Navigation" }) },
});
