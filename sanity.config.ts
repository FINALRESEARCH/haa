import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId, studioBasePath } from "./src/sanity/env";
import { SINGLETON_TYPES, schemaTypes } from "./src/sanity/schema";
import { structure } from "./src/sanity/structure";

const singletons: readonly string[] = SINGLETON_TYPES;

export default defineConfig({
  name: "haa",
  title: "HAA",
  basePath: studioBasePath,
  projectId,
  dataset,

  schema: {
    types: schemaTypes,
    // There is only ever one of each singleton, so keep them out of the
    // "create new" menus.
    templates: (prev) =>
      prev.filter((template) => !singletons.includes(template.schemaType)),
  },

  document: {
    // ...and stop an editor deleting the document the homepage reads from.
    actions: (prev, { schemaType }) =>
      singletons.includes(schemaType)
        ? prev.filter(
            ({ action }) =>
              action && !["unpublish", "delete", "duplicate"].includes(action),
          )
        : prev,
  },

  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
