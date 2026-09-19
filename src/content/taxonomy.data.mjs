/**
 * The filter vocabularies, kept as plain JS so the Airtable importer
 * (`scripts/import-network.mjs`) and the site can share one copy. Everything
 * that needs types imports them through `taxonomy.ts` instead.
 *
 * Both are the client's Airtable select columns, in their order:
 * https://airtable.com/appeEKu35B4MwL1jx/tblVfYoagUR5i3iGC
 *
 * `value` is the Airtable choice name slugged, which is exactly what the
 * importer derives from a record, so the two cannot drift. Adding a choice in
 * Airtable without adding it here still renders — it just gets a title-cased
 * label and sorts to the end of the filter row.
 */

/**
 * How someone is attached to HAA. Labels are plural because they name a
 * filter ("Mentors"); the value stays singular because it describes one
 * entry. Airtable allows several per record — a firm can be both a founding
 * and a hiring partner — so every entry carries a list.
 */
export const RELATIONSHIPS = [
  { value: "faculty", label: "Faculty" },
  { value: "mentor", label: "Mentors" },
  { value: "advisor", label: "Advisors" },
  { value: "guest-speaker", label: "Guest Speakers" },
  { value: "funding-partner", label: "Funding Partners" },
  { value: "co-op-partner", label: "Co-op Partners" },
  { value: "investor", label: "Investors" },
  { value: "industry-partner", label: "Industry Partners" },
  { value: "founding-partner", label: "Founding Partners" },
  { value: "hiring-partner", label: "Hiring Partners" },
];

/** What they work on. One entry can carry several. */
export const FIELDS = [
  { value: "ai", label: "AI" },
  { value: "engineering", label: "Engineering" },
  { value: "startups", label: "Startups" },
  { value: "product", label: "Product" },
  { value: "design", label: "Design" },
  { value: "science", label: "Science" },
  { value: "investing", label: "Investing" },
  { value: "writing", label: "Writing" },
  { value: "founder", label: "Founders" },
  { value: "media", label: "Media" },
  { value: "education", label: "Education" },
  { value: "community", label: "Community" },
  { value: "leadership", label: "Leadership" },
  { value: "hardware-robotics", label: "Hardware & Robotics" },
  { value: "policy-government", label: "Policy & Government" },
  { value: "defense-aerospace", label: "Defense & Aerospace" },
  { value: "finance", label: "Finance" },
  { value: "biotech-health", label: "Biotech & Health" },
  { value: "crypto", label: "Crypto" },
  { value: "gtm-sales", label: "GTM / Sales" },
];
