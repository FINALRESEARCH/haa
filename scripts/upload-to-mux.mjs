/**
 * Uploads the applicant masters to Mux and writes the documents the Studio
 * expects, so an applicant created this way is indistinguishable from one
 * dragged into the video field by hand.
 *
 * That means two documents per applicant, not one: a `mux.videoAsset` holding
 * the whole Mux asset payload, and the `applicant` that weakly references it.
 * `passthrough` carries the Sanity asset id into Mux, which is how the
 * plugin's webhooks find their way back to the right document.
 *
 * Mux credentials are read from the dataset — the plugin keeps them in
 * `secrets.mux` rather than an env var — so the only secret this needs is the
 * Sanity write token.
 *
 *   node --env-file=.env.local scripts/upload-to-mux.mjs [slug ...]
 */
import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-06-01",
  useCdn: false,
});

const secrets = await client.getDocument("secrets.mux");
if (!secrets?.token || !secrets?.secretKey) {
  console.error("No Mux credentials in `secrets.mux` — set them in the Studio first.");
  process.exit(1);
}
const auth =
  "Basic " + Buffer.from(`${secrets.token}:${secrets.secretKey}`).toString("base64");

const mux = async (path, init = {}) => {
  const res = await fetch(`https://api.mux.com/video/v1${path}`, {
    ...init,
    headers: { authorization: auth, "content-type": "application/json", ...init.headers },
  });
  if (!res.ok) throw new Error(`Mux ${path} → ${res.status} ${await res.text()}`);
  return (await res.json()).data;
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const manifest = JSON.parse(
  await readFile(join(root, "scripts", "applicants.json"), "utf8"),
);

const only = process.argv.slice(2);
const queue = only.length
  ? manifest.applicants.filter((a) => only.includes(a.slug))
  : manifest.applicants;

// Anything already in the dataset stays there: re-running must not produce a
// second copy of an applicant, or a second Mux asset billed alongside it.
const existing = new Set(
  await client.fetch('*[_type == "applicant"].slug.current'),
);

for (const { slug, name, file, loopStart } of queue) {
  if (existing.has(slug)) {
    console.log(`  ${slug} — already in the dataset, skipping`);
    continue;
  }

  const src = join(manifest.sourceDir, file);
  const { size } = await stat(src);
  const assetDocId = randomUUID();

  // `passthrough` is set to the Sanity document id before the asset exists,
  // matching what the plugin does from the browser.
  const upload = await mux("/uploads", {
    method: "POST",
    body: JSON.stringify({
      cors_origin: "*",
      new_asset_settings: {
        playback_policies: ["public"],
        video_quality: "plus",
        // The site plays mp4s, never HLS — `muxVideo()` in
        // `src/sanity/content.ts` builds its URL out of these. Without one the
        // applicant's tile has no modal to open. `scripts/mux-static-renditions.mjs`
        // backfills assets that were uploaded before this was here.
        static_renditions: [{ resolution: "highest" }],
        passthrough: assetDocId,
      },
    }),
  });

  // No explicit content-length: undici derives it from the buffer and
  // rejects the request outright if the header is set by hand.
  const put = await fetch(upload.url, {
    method: "PUT",
    headers: { "content-type": "application/octet-stream" },
    body: await readFile(src),
  });
  if (!put.ok) throw new Error(`Upload PUT for ${slug} → ${put.status}`);
  console.log(`  ${name} — ${(size / 1e6).toFixed(0)}MB uploaded, encoding…`);

  let assetId;
  for (let i = 0; i < 60 && !assetId; i++) {
    await wait(3000);
    assetId = (await mux(`/uploads/${upload.id}`)).asset_id;
  }
  if (!assetId) throw new Error(`${slug}: Mux never attached an asset`);

  let asset;
  for (let i = 0; i < 100; i++) {
    asset = await mux(`/assets/${assetId}`);
    if (asset.status === "ready") break;
    if (asset.status === "errored") throw new Error(`${slug}: ${JSON.stringify(asset.errors)}`);
    await wait(5000);
  }
  if (asset.status !== "ready") throw new Error(`${slug}: still ${asset.status}`);

  const playbackId = asset.playback_ids?.[0]?.id;

  await client.createOrReplace({
    _id: assetDocId,
    _type: "mux.videoAsset",
    assetId,
    playbackId,
    status: "ready",
    uploadId: upload.id,
    data: asset,
  });

  await client.create({
    _type: "applicant",
    name,
    slug: { _type: "slug", current: slug },
    pursuit: "",
    loopStart,
    video: {
      _type: "mux.video",
      asset: { _type: "reference", _ref: assetDocId, _weak: true },
    },
  });

  console.log(`     ready — playbackId ${playbackId}`);
}

console.log("\nDone.");
