/**
 * Puts the hero sizzle on Mux and attaches it to the home page, so the field
 * ends up exactly as it would had someone dragged the file into the Studio:
 * a `mux.videoAsset` holding the Mux payload, and `homePage.hero.video`
 * weakly referencing it. `passthrough` carries the Sanity asset id into Mux,
 * which is how the plugin's webhooks find their way back to the document.
 *
 * Unlike the applicant masters, this asset is encoded with a static rendition
 * as well: the hero plays a plain `<video>` rather than an adaptive stream, so
 * without an MP4 there is nothing for it to point at. That is set per asset
 * rather than in `muxInput()` so the applicant masters aren't billed for MP4s
 * that no one ever plays.
 *
 * Mux credentials are read from the dataset — the plugin keeps them in
 * `secrets.mux` rather than an env var — so the only secret this needs is the
 * Sanity write token.
 *
 *   node --env-file=.env.local scripts/upload-hero-video.mjs [file|url] [--replace]
 *
 * The source defaults to the placeholder footage the hero hotlinked before
 * this existed. `--replace` is required to point the hero at a second asset:
 * without it an accidental re-run would bill for another encode.
 */
import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

const PLACEHOLDER =
  "https://d1lamhf6l6yk6d.cloudfront.net/uploads/2026/03/fundraise-landscape.mp4";

const args = process.argv.slice(2);
const replace = args.includes("--replace");
const source = args.find((arg) => !arg.startsWith("--")) ?? PLACEHOLDER;

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

const home = await client.fetch('*[_type == "homePage"][0]{ _id, "video": hero.video }');
if (!home) {
  console.error("No `homePage` document yet — run `npm run sanity:seed` first.");
  process.exit(1);
}
if (home.video?.asset?._ref && !replace) {
  console.error(
    `The hero already has an asset (${home.video.asset._ref}).\n` +
      "Pass --replace to encode another one and point the hero at it.",
  );
  process.exit(1);
}

// A URL is fetched rather than streamed through Mux's own ingest so that a
// local file and a remote one take exactly the same path from here on.
const body = /^https?:\/\//.test(source)
  ? Buffer.from(await (await fetch(source)).arrayBuffer())
  : await readFile(source);
console.log(`  ${source}\n  ${(body.byteLength / 1e6).toFixed(1)}MB, uploading…`);

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
      static_renditions: [{ resolution: "highest" }],
      passthrough: assetDocId,
    },
  }),
});

// No explicit content-length: undici derives it from the buffer and rejects
// the request outright if the header is set by hand.
const put = await fetch(upload.url, {
  method: "PUT",
  headers: { "content-type": "application/octet-stream" },
  body,
});
if (!put.ok) throw new Error(`Upload PUT → ${put.status} ${await put.text()}`);
console.log("  uploaded, encoding…");

let assetId;
for (let i = 0; i < 60 && !assetId; i++) {
  await wait(3000);
  assetId = (await mux(`/uploads/${upload.id}`)).asset_id;
}
if (!assetId) throw new Error("Mux never attached an asset");

// Two things have to land, and they land separately: the asset itself, then
// the MP4 the hero actually plays. Storing `data` before the renditions are
// ready would leave the page with an asset it can find no source on.
let asset;
for (let i = 0; i < 160; i++) {
  asset = await mux(`/assets/${assetId}`);
  if (asset.status === "errored") throw new Error(JSON.stringify(asset.errors));
  const renditions = asset.static_renditions?.status;
  if (asset.status === "ready" && (renditions === "ready" || renditions === "errored")) break;
  await wait(5000);
}
if (asset.status !== "ready") throw new Error(`Asset still ${asset.status}`);

const playbackId = asset.playback_ids?.[0]?.id;
const files = asset.static_renditions?.files?.map((file) => file.name) ?? [];
if (!files.length) {
  console.warn(
    "  ⚠ Mux produced no static rendition, so the hero will keep using the\n" +
      "    placeholder. Enable MP4 support on this asset and re-run.",
  );
}

await client.createOrReplace({
  _id: assetDocId,
  _type: "mux.videoAsset",
  assetId,
  playbackId,
  status: "ready",
  uploadId: upload.id,
  data: asset,
});

await client
  .patch(home._id)
  .set({
    "hero.video": {
      _type: "mux.video",
      asset: { _type: "reference", _ref: assetDocId, _weak: true },
    },
  })
  .commit();

console.log(`\nDone — playbackId ${playbackId}`);
console.log(`  renditions: ${files.join(", ") || "none"}`);
if (files.length) console.log(`  https://stream.mux.com/${playbackId}/${files[0]}`);
