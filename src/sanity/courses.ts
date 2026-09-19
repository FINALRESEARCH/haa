import { cache } from "react";
import type { Course } from "@/content/types";
import { COURSES as FALLBACK } from "@/data/courses";
import { obj, str } from "./content";
import { sanityFetch } from "./live";
import { COURSES_QUERY } from "./queries";

/** Values the vocabulary might not list are kept; the labeller handles them. */
function tags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is string => typeof entry === "string" && entry.trim() !== "",
  );
}

function courses(data: unknown): Course[] {
  if (!Array.isArray(data)) return [];
  const kept: Course[] = [];
  for (const entry of data) {
    const raw = obj(entry);
    const title = str(raw?.title, "");
    // The title is the one thing a course cannot do without; a document
    // mid-edit simply waits its turn.
    if (!title) continue;
    kept.push({
      id: str(raw?.id, title),
      title,
      type: str(raw?.type, ""),
      description: str(raw?.description, ""),
      people: tags(raw?.people),
      affiliation: str(raw?.affiliation, ""),
      featured: raw?.featured === true,
    });
  }
  return kept;
}

/**
 * Unlike the network directory, this one does not merge Airtable with Sanity.
 * The network has to: its base carries all 210 rows while the Studio carries
 * the portraits, so neither one alone is the list. The course base carries
 * every column the page renders and the Studio adds no artwork, so there is
 * nothing to merge — the moment a `course` document exists the dataset is the
 * catalogue outright.
 *
 * Same contract as `getSiteContent`: an unreachable Content Lake renders the
 * Airtable export rather than a 500.
 */
export const getCourses = cache(async (): Promise<Course[]> => {
  try {
    const { data } = await sanityFetch({ query: COURSES_QUERY });
    const written = courses(data);
    return written.length ? written : FALLBACK;
  } catch (error) {
    console.error("[sanity] rendering the course directory from Airtable alone:", error);
    return FALLBACK;
  }
});
