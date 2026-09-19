import Directory from "@/components/directory/Directory";
import type {
  DirectoryColumn,
  DirectoryEntry,
  DirectoryFilterGroup,
} from "@/components/directory/types";
import { sectionMetadata } from "@/components/SectionPage";
import type { NetworkPerson } from "@/content/types";
import {
  FIELDS,
  orderTaxonomy,
  RELATIONSHIPS,
  taxonomyLabel,
} from "@/content/taxonomy";
import { getSiteContent } from "@/sanity/content";
import { getNetworkPeople } from "@/sanity/network";

export const generateMetadata = () => sectionMetadata("network");

const RELATIONSHIP = "relationship";
const FIELD = "field";

/**
 * The table, left to right. The first column is the linked one, and the one
 * that stays put when the table is scrolled sideways; the rest are also what
 * the pinned card lists out in full beside it.
 *
 * Fixed tracks rather than fractions. These values are whole titles — "Deputy
 * Commissioner for Technology and AI at U.S. Food and Drug Administration" —
 * and whole lists of tags, so the table is allowed to be wider than the box
 * holding it and scroll, instead of dividing a fixed width between them and
 * cutting every column short.
 *
 * Fixed also means the long ones wrap inside their column instead of widening
 * it, which is what keeps the whole table down to about a screen and a third
 * rather than something nobody would scroll to the end of.
 */
const COLUMNS: DirectoryColumn[] = [
  { id: "name", label: "Name", width: "200px" },
  { id: "affiliation", label: "Title & Organization", width: "260px" },
  { id: RELATIONSHIP, label: "Relationship", width: "190px" },
  { id: FIELD, label: "Field", width: "300px" },
];

/**
 * The relationship labels are plural because they name a filter ("Mentors");
 * in a row they describe one entry, so the trailing "s" is dropped back off.
 */
function role(value: string): string {
  return taxonomyLabel(RELATIONSHIPS, value).replace(/s$/, "");
}

function entry(person: NetworkPerson): DirectoryEntry {
  return {
    id: person.id,
    title: person.name,
    href: person.profileUrl,
    // Most of the base has no photograph; `Directory` draws a monogram for
    // those rather than a blank.
    image: person.src
      ? { src: person.src, thumb: person.thumb ?? person.src, alt: person.name }
      : undefined,
    cells: {
      name: person.name,
      affiliation: person.affiliation,
      // Several of either is normal — a firm is often both a founding and a
      // hiring partner, and an investor who writes is both.
      [RELATIONSHIP]: person.relationships.map(role).join(" · "),
      [FIELD]: person.fields
        .map((value) => taxonomyLabel(FIELDS, value))
        .join(" · "),
    },
    tags: [
      ...person.relationships.map((value) => ({
        group: RELATIONSHIP,
        value,
      })),
      ...person.fields.map((value) => ({ group: FIELD, value })),
    ],
  };
}

/**
 * Only what the list actually contains. The Airtable taxonomy is longer than
 * anyone is tagged with yet, and a filter that returns an empty page every
 * time is worse than no filter — see `src/content/taxonomy.ts`.
 */
function filters(people: NetworkPerson[]): DirectoryFilterGroup[] {
  const groups: DirectoryFilterGroup[] = [
    {
      id: RELATIONSHIP,
      label: "Relationship",
      allLabel: "Everyone",
      options: orderTaxonomy(
        RELATIONSHIPS,
        people.flatMap((person) => person.relationships),
      ),
    },
    {
      id: FIELD,
      label: "Field",
      allLabel: "All fields",
      options: orderTaxonomy(
        FIELDS,
        people.flatMap((person) => person.fields),
      ),
    },
  ];
  // One option filters nothing — it is just the whole list under another name.
  return groups.filter((group) => group.options.length > 1);
}

/**
 * The network directory. The same shell is meant to carry the course
 * directory behind "Explore Courses" later, which is why everything
 * person-shaped — the columns, the tags, the nouns — is mapped away here
 * rather than inside `Directory`.
 */
export default async function NetworkPage() {
  const [{ nav }, people] = await Promise.all([
    getSiteContent(),
    getNetworkPeople(),
  ]);
  const panel = nav.find((section) => section.id === "network");

  return (
    <Directory
      eyebrow="The HAA Network"
      heading={panel?.heading ?? ""}
      intro={panel?.body ?? []}
      columns={COLUMNS}
      entries={people.map(entry)}
      filters={filters(people)}
      unit="people"
      emptyLabel="Nobody here matches both filters yet."
    />
  );
}
