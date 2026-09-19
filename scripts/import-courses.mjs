/**
 * Pulls the course directory from the client's Airtable base into Sanity
 * `course` documents, which is what /courses renders.
 *
 *   npm run courses:import -- --dry-run   # print what would change
 *   npm run courses:import                # write it
 *
 * The sibling of `import-network.mjs`, and it works the same way: Airtable is
 * the client's working copy, so this is meant to be re-run, and each course is
 * patched field by field rather than replaced — which is what keeps the one
 * thing Airtable has no column for, the "Featured on /curriculum" toggle, from
 * being wiped on every import.
 *
 * Column names are matched loosely (case and spacing are ignored, and a few
 * likely synonyms are accepted) so the base can be renamed without breaking
 * this. Whatever it cannot find, it says so and leaves empty.
 */
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient } from "@sanity/client";
import { COURSE_TYPES } from "../src/content/courses.data.mjs";

const DRY_RUN = process.argv.includes("--dry-run");

const BASE = process.env.AIRTABLE_COURSES_BASE_ID ?? "appRyVWnOqGuk2Fxe";
const TABLE = process.env.AIRTABLE_COURSES_TABLE_ID ?? "tblKNbWUnmKI5lWyy";
const airtableToken = process.env.AIRTABLE_TOKEN;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!airtableToken) {
  console.error(
    "Missing AIRTABLE_TOKEN. Create a personal access token with\n" +
      "data.records:read on this base at https://airtable.com/create/tokens",
  );
  process.exit(1);
}

/**
 * The Sanity write token, or the one the `sanity` CLI already has if you are
 * logged in. A dry run needs neither.
 */
async function sanityToken() {
  if (process.env.SANITY_API_WRITE_TOKEN) {
    return process.env.SANITY_API_WRITE_TOKEN;
  }
  try {
    const cli = JSON.parse(
      await readFile(join(homedir(), ".config/sanity/config.json"), "utf8"),
    );
    if (cli.authToken) return cli.authToken;
  } catch {
    // Falls through to the error below.
  }
  if (DRY_RUN) return undefined;
  console.error(
    "Missing SANITY_API_WRITE_TOKEN, and the sanity CLI is not logged in.\n" +
      "Run `npx sanity login`, or add a token to .env.local.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token: await sanityToken(),
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-06-01",
  useCdn: false,
});

/** Every record in the table, a page at a time. */
async function records() {
  const all = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${TABLE}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${airtableToken}` },
    });
    if (!response.ok) {
      throw new Error(`Airtable ${response.status}: ${await response.text()}`);
    }
    const page = await response.json();
    all.push(...page.records);
    offset = page.offset;
  } while (offset);
  return all;
}

const key = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

/** The first column whose name matches one of `names`, loosely. */
function column(fields, names) {
  const wanted = names.map(key);
  for (const [name, value] of Object.entries(fields)) {
    if (wanted.includes(key(name))) return value;
  }
  return undefined;
}

const COLUMNS = {
  title: ["Title", "Name", "Course"],
  type: ["Type", "Kind", "Category"],
  description: ["Description", "Summary", "About"],
  people: ["People", "Instructors", "Instructor", "Faculty", "Speakers"],
  affiliation: [
    "Title & Affiliation",
    "Title and Affiliation",
    "Affiliation",
    "Title & Organization",
    "Organization",
  ],
};

const slug = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Airtable's "Course"/"Track" to the schema's "course"/"track". */
function typeValue(raw) {
  const candidate = slug(raw?.name ?? raw);
  if (!candidate) return "";
  if (COURSE_TYPES.some((option) => option.value === candidate)) {
    return candidate;
  }
  const singular = candidate.replace(/s$/, "");
  return COURSE_TYPES.some((option) => option.value === singular)
    ? singular
    : candidate;
}

/**
 * The People column is free text, and the base writes a pair either way round
 * — "A & B" on one row, "A, B" on the next, with a stray newline in at least
 * one. All three separators are treated the same.
 */
function people(value) {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim());
  if (!value) return [];
  return String(value)
    .split(/\s*(?:,|&|\n)\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function course(record) {
  const fields = record.fields ?? {};
  return {
    title: String(column(fields, COLUMNS.title) ?? "").trim(),
    type: typeValue(column(fields, COLUMNS.type)),
    description: String(column(fields, COLUMNS.description) ?? "").trim(),
    people: people(column(fields, COLUMNS.people)),
    affiliation: String(column(fields, COLUMNS.affiliation) ?? "").trim(),
  };
}

async function main() {
  console.log(
    `${DRY_RUN ? "Reading" : "Importing"} ${BASE}/${TABLE} -> ${projectId}/${dataset}\n`,
  );
  const rows = await records();
  console.log(`${rows.length} records in the table\n`);

  let written = 0;
  let skipped = 0;

  for (const record of rows) {
    const entry = course(record);
    // A row with no title cannot be a directory row: it has nothing to read.
    if (!entry.title) {
      skipped += 1;
      continue;
    }

    const _id = `course-${slug(entry.title)}`;
    const patch = {
      title: entry.title,
      type: entry.type,
      description: entry.description,
      people: entry.people,
      affiliation: entry.affiliation,
    };
    // An empty column would otherwise overwrite something an editor typed in
    // the Studio; only what Airtable actually holds is written. `featured` is
    // never in this patch at all — it is the Studio's alone.
    for (const [field, value] of Object.entries(patch)) {
      const empty = Array.isArray(value) ? value.length === 0 : value === "";
      if (empty) delete patch[field];
    }

    const summary = [entry.type, entry.people.join("/")]
      .filter(Boolean)
      .join(" · ");
    console.log(`  ${entry.title} — ${summary}`);
    if (DRY_RUN) continue;

    await client.createIfNotExists({ _id, _type: "course" });
    await client.patch(_id).set(patch).commit();
    written += 1;
  }

  console.log(
    `\n${DRY_RUN ? "Would write" : "Wrote"} ${DRY_RUN ? rows.length - skipped : written} courses, skipped ${skipped}.`,
  );
  if (!DRY_RUN) {
    console.log(
      "Anything in Sanity but no longer in Airtable is left alone — delete it in the Studio.",
    );
  }
}

await main();
