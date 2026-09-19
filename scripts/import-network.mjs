/**
 * Pulls the network directory from the client's Airtable base into Sanity
 * `person` documents, which is what /network renders.
 *
 *   npm run network:import -- --dry-run   # print what would change
 *   npm run network:import                # write it
 *
 * Airtable is the client's working copy: they keep adding to it, so this is
 * meant to be re-run. Re-running never clobbers work done in the Studio that
 * Airtable has no column for — the Mux hover clip, a hand-set image hotspot —
 * because each person is patched field by field rather than replaced.
 *
 * Column names are matched loosely (case and spacing are ignored, and a few
 * likely synonyms are accepted) so the base can be renamed without breaking
 * this. Whatever it cannot find, it says so and leaves empty.
 */
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient } from "@sanity/client";
import { FIELDS, RELATIONSHIPS } from "../src/content/taxonomy.data.mjs";

const DRY_RUN = process.argv.includes("--dry-run");

const BASE = process.env.AIRTABLE_BASE_ID ?? "appeEKu35B4MwL1jx";
const TABLE = process.env.AIRTABLE_TABLE_ID ?? "tblVfYoagUR5i3iGC";
const VIEW = process.env.AIRTABLE_VIEW_ID ?? "viwC5O43Hu2KTCpe9";
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

/** Every record in the view, a page at a time. */
async function records() {
  const all = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${TABLE}`);
    url.searchParams.set("view", VIEW);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${airtableToken}` },
    });
    if (!response.ok) {
      throw new Error(
        `Airtable ${response.status}: ${await response.text()}`,
      );
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
  name: ["Name", "Full Name", "Person"],
  affiliation: [
    "Title & Organization",
    "Affiliation",
    "Company",
    "Organization",
    "Org",
    "Title",
    "Role",
  ],
  relationships: ["Relationships", "Relationship", "Type", "Category"],
  fields: ["Tags", "Field", "Fields", "Focus", "Expertise"],
  profileUrl: ["URL", "Profile", "Profile URL", "Profile Link", "Link", "Website", "LinkedIn"],
  // The base has no photo column today. These stay because adding one is the
  // obvious next thing the client does, and this then picks it up unchanged.
  photo: ["Photo", "Portrait", "Image", "Headshot", "Picture", "Attachments"],
};

const slug = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Airtable labels the options as filters read ("Guest Speakers"); the schema
 * stores one person's own ("guest-speaker"). Depluralise only when that lands
 * on a value the taxonomy actually knows — anything else is kept verbatim, and
 * the page title-cases it.
 */
function taxonomyValue(options, raw) {
  const candidate = slug(raw);
  if (!candidate) return "";
  if (options.some((option) => option.value === candidate)) return candidate;
  const singular = candidate.replace(/s$/, "");
  if (options.some((option) => option.value === singular)) return singular;
  return candidate;
}

const list = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

/** Airtable attachment URLs expire, so the bytes are copied into Sanity. */
async function uploadPortrait(attachment, name) {
  const response = await fetch(attachment.url);
  if (!response.ok) {
    throw new Error(`portrait ${response.status} for ${name}`);
  }
  const body = Buffer.from(await response.arrayBuffer());
  const asset = await client.assets.upload("image", body, {
    filename: attachment.filename ?? `${slug(name)}.jpg`,
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

function person(record) {
  const fields = record.fields ?? {};
  const name = String(column(fields, COLUMNS.name) ?? "").trim();
  const photo = list(column(fields, COLUMNS.photo)).find((file) =>
    String(file?.type ?? "").startsWith("image/"),
  );
  return {
    name,
    affiliation: String(column(fields, COLUMNS.affiliation) ?? "").trim(),
    // Multi-select in Airtable: a firm is often both a founding and a hiring
    // partner, and dropping all but the first would hide it from one filter.
    relationships: list(column(fields, COLUMNS.relationships))
      .map((value) => taxonomyValue(RELATIONSHIPS, value))
      .filter(Boolean),
    fields: list(column(fields, COLUMNS.fields))
      .map((value) => taxonomyValue(FIELDS, value))
      .filter(Boolean),
    profileUrl: String(column(fields, COLUMNS.profileUrl) ?? "").trim(),
    photo,
  };
}

async function main() {
  console.log(
    `${DRY_RUN ? "Reading" : "Importing"} ${BASE}/${TABLE} -> ${projectId}/${dataset}\n`,
  );
  const rows = await records();
  console.log(`${rows.length} records in the view\n`);

  let written = 0;
  let skipped = 0;

  for (const record of rows) {
    const entry = person(record);
    // A row with no name cannot be a directory row: it has nothing to read
    // and nothing to link. A row with no portrait is fine — the base has no
    // photo column, so the directory draws a monogram instead.
    if (!entry.name) {
      skipped += 1;
      continue;
    }

    const _id = `person-${slug(entry.name)}`;
    const patch = {
      name: entry.name,
      affiliation: entry.affiliation,
      relationships: entry.relationships,
      fields: entry.fields,
      profileUrl: entry.profileUrl,
    };
    // An empty column would otherwise overwrite something an editor typed in
    // the Studio; only what Airtable actually holds is written.
    for (const [field, value] of Object.entries(patch)) {
      const empty = Array.isArray(value) ? value.length === 0 : value === "";
      if (empty) delete patch[field];
    }

    const summary = [
      entry.affiliation,
      entry.relationships.join("/"),
      entry.fields.join("/"),
      entry.photo ? "photo" : "no photo",
    ]
      .filter(Boolean)
      .join(" · ");
    console.log(`  ${entry.name} — ${summary}`);
    if (DRY_RUN) continue;

    const existing = await client.getDocument(_id).catch(() => null);
    // The portrait is only re-uploaded when there isn't one: Airtable's copy
    // is the source, but a hotspot set in the Studio is worth keeping.
    if (!existing?.portrait && entry.photo) {
      patch.portrait = await uploadPortrait(entry.photo, entry.name);
    }

    await client.createIfNotExists({ _id, _type: "person" });
    await client.patch(_id).set(patch).commit();
    written += 1;
  }

  console.log(
    `\n${DRY_RUN ? "Would write" : "Wrote"} ${DRY_RUN ? rows.length - skipped : written} people, skipped ${skipped}.`,
  );
  if (!DRY_RUN) {
    console.log(
      "Anyone in Sanity but no longer in Airtable is left alone — delete them in the Studio.",
    );
  }
}

await main();
