/**
 * Pushes the nav panel copy in `src/content/nav.data.mjs` to the `navigation`
 * document in Sanity.
 *
 * Unlike `seed.mjs`, this one *overwrites* — the live site reads the dataset,
 * not the code, so this is how a copy change in the repo reaches the menu.
 * Anything an editor changed in the Studio is replaced, so run it only when
 * the repo is the source of truth for that copy.
 *
 * Existing panels keep their `_key`, so the Studio sees an edit rather than a
 * delete-and-recreate.
 *
 *   npm run sanity:sync-nav          # show the diff, write nothing
 *   npm run sanity:sync-nav -- --write
 */
import { createClient } from "@sanity/client";
import { NAV_SECTIONS } from "../src/content/nav.data.mjs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET or SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

const write = process.argv.includes("--write");

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-06-01",
  useCdn: false,
});

const current = await client.fetch(`*[_id == "navigation"][0]`);

if (!current) {
  console.error('No "navigation" document. Run `npm run sanity:seed` first.');
  process.exit(1);
}

const existing = new Map(
  (current.items ?? []).map((item) => [item.anchor, item]),
);

const items = NAV_SECTIONS.map((section) => {
  const previous = existing.get(section.id);
  return {
    _type: "navPanel",
    // Reusing the key means the Studio sees an edit, not a delete-and-recreate.
    _key: previous?._key ?? `nav-${section.id}`,
    label: section.label,
    anchor: section.id,
    heading: section.heading,
    body: section.body,
    // The Studio owns this one — it isn't part of the repo's copy.
    readMoreLabel: previous?.readMoreLabel ?? "Read more",
  };
});

let changed = 0;
for (const item of items) {
  const previous = existing.get(item.anchor);
  const before = JSON.stringify({
    heading: previous?.heading,
    body: previous?.body,
    label: previous?.label,
  });
  const after = JSON.stringify({
    heading: item.heading,
    body: item.body,
    label: item.label,
  });
  if (before === after) continue;
  changed += 1;
  console.log(`\n${item.anchor}`);
  console.log(`  - ${previous?.heading ?? "(new panel)"}`);
  console.log(`  + ${item.heading}`);
  if (JSON.stringify(previous?.body) !== JSON.stringify(item.body)) {
    console.log(
      `    body: ${previous?.body?.length ?? 0} → ${item.body.length} paragraph(s)`,
    );
  }
}

const removed = (current.items ?? []).filter(
  (item) => !NAV_SECTIONS.some((section) => section.id === item.anchor),
);
for (const item of removed) {
  console.log(`\n${item.anchor}\n  - removed`);
  changed += 1;
}

if (!changed) {
  console.log("Sanity already matches nav.data.mjs. Nothing to do.");
  process.exit(0);
}

if (!write) {
  console.log(
    `\n${changed} panel(s) would change. Re-run with --write to push.`,
  );
  process.exit(0);
}

await client.patch("navigation").set({ items }).commit();
console.log(`\nPushed ${changed} panel(s) to ${projectId}/${dataset}.`);
