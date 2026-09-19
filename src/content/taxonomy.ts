/**
 * The two axes the network directory filters on. The vocabularies themselves
 * live in `taxonomy.data.mjs`, which the Airtable importer reads too; this
 * file is the typed view of them plus the labelling the page needs.
 *
 * Imported by both the Studio schema (`src/sanity/schema/person.ts`) and the
 * page, so the dropdown and the filter row can't drift apart.
 */
import {
  FIELDS as FIELD_OPTIONS,
  RELATIONSHIPS as RELATIONSHIP_OPTIONS,
} from "./taxonomy.data.mjs";

export type TaxonomyOption = { value: string; label: string };

/** How they're attached to HAA — the directory's first filter. */
export const RELATIONSHIPS: TaxonomyOption[] = RELATIONSHIP_OPTIONS;

/** What they work on — the second filter. */
export const FIELDS: TaxonomyOption[] = FIELD_OPTIONS;

/** "quantum-biology" -> "Quantum Biology", for values no list accounts for. */
export function taxonomyLabel(
  options: TaxonomyOption[],
  value: string,
): string {
  const known = options.find((option) => option.value === value);
  if (known) return known.label;
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/** Listed options first, in list order; anything unlisted after, A–Z. */
export function orderTaxonomy(
  options: TaxonomyOption[],
  values: string[],
): TaxonomyOption[] {
  const unique = [...new Set(values)];
  const listed = options.filter((option) => unique.includes(option.value));
  const rest = unique
    .filter((value) => !options.some((option) => option.value === value))
    .sort()
    .map((value) => ({ value, label: taxonomyLabel(options, value) }));
  return [...listed, ...rest];
}
