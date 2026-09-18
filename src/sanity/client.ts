import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, studioBasePath } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  // Stega only turns on for draft-mode requests, where it makes every string
  // on the page clickable in the Presentation tool.
  stega: { studioUrl: studioBasePath },
});
