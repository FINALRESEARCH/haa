import { cache } from "react";
import type { NetworkPerson } from "@/content/types";
import { networkPeople as AIRTABLE } from "@/data/network";
import { obj, str } from "./content";
import { imageUrl } from "./image";
import { sanityFetch } from "./live";
import { NETWORK_PEOPLE_QUERY } from "./queries";

/**
 * The directory's picture panel is a third of the screen at most, so these
 * are pulled at a fraction of the homepage tiles' width.
 */
const PORTRAIT_WIDTH = 1400;
/** The row thumbnail is 40px wide; this is it at 2×, with room to spare. */
const THUMB_WIDTH = 160;

/** Values the taxonomy might not list are kept; the labeller handles them. */
function tags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is string => typeof entry === "string" && entry.trim() !== "",
  );
}

/**
 * The relationships column went multi-select in Airtable after the first
 * documents were written, so a document may carry either the array or the old
 * single string. Both are read, and the single one only counts when the array
 * is empty — an editor who has picked the new field has picked all of it.
 */
function relationships(raw: Record<string, unknown> | null | undefined): string[] {
  const many = tags(raw?.relationships);
  if (many.length) return many;
  const one = str(raw?.relationship, "");
  return one ? [one] : [];
}

function people(data: unknown): NetworkPerson[] {
  if (!Array.isArray(data)) return [];
  const kept: NetworkPerson[] = [];
  for (const entry of data) {
    const raw = obj(entry);
    const src = imageUrl(raw?.portrait as never, PORTRAIT_WIDTH);
    const thumb = imageUrl(raw?.portrait as never, THUMB_WIDTH);
    const name = str(raw?.name, "");
    // The name is the one thing a row cannot do without; a document mid-edit
    // simply waits its turn. A missing portrait is normal, not unfinished.
    if (!name) continue;
    kept.push({
      id: str(raw?.id, name),
      src,
      thumb: thumb ?? src,
      name,
      affiliation: str(raw?.affiliation, ""),
      relationships: relationships(raw),
      fields: tags(raw?.fields),
      profileUrl: str(raw?.profileUrl, ""),
    });
  }
  return kept;
}

const key = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Airtable is the directory's spine and Sanity is what has been done to it.
 *
 * Neither one alone is the list: the base carries all 210 rows and their
 * filtering but has no photo column, while the Studio carries the portraits
 * and any hand-editing, and at the moment holds only the homepage's twenty.
 * So the two are merged per person, matched on the name — which is both the
 * Airtable primary column and what `scripts/import-network.mjs` builds the
 * document `_id` out of, so the join survives the import.
 *
 * A Studio field only wins where it has something to say. That keeps an
 * editor's correction from being undone by the next Airtable export, without
 * letting a half-filled document blank out a row that Airtable had complete.
 * Anyone in Sanity and not in Airtable is kept and sorted in.
 */
function merge(documents: NetworkPerson[]): NetworkPerson[] {
  const unmatched = new Map(documents.map((doc) => [key(doc.name), doc]));
  const rows = AIRTABLE.map((person) => {
    const doc = unmatched.get(key(person.name));
    if (!doc) return person;
    unmatched.delete(key(person.name));
    return {
      ...person,
      id: doc.id,
      src: doc.src,
      thumb: doc.thumb,
      affiliation: doc.affiliation || person.affiliation,
      relationships: doc.relationships.length
        ? doc.relationships
        : person.relationships,
      fields: doc.fields.length ? doc.fields : person.fields,
      profileUrl: doc.profileUrl || person.profileUrl,
    };
  });
  return [...rows, ...unmatched.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/**
 * Same contract as `getSiteContent`: an unreachable Content Lake renders the
 * Airtable export on its own rather than a 500.
 */
export const getNetworkPeople = cache(async (): Promise<NetworkPerson[]> => {
  try {
    const { data } = await sanityFetch({ query: NETWORK_PEOPLE_QUERY });
    return merge(people(data));
  } catch (error) {
    console.error("[sanity] rendering the network directory from Airtable alone:", error);
    return AIRTABLE;
  }
});
