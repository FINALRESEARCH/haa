/**
 * Turns on mp4 static renditions for the applicant masters, and re-syncs the
 * `mux.videoAsset` documents afterwards.
 *
 * Why this exists: the site never touches HLS. `muxVideo()` in
 * `src/sanity/content.ts` builds a plain mp4 URL out of
 * `data.static_renditions.files[]`, which is how the hero plays and how the
 * applicant modal plays — one `<video>` element, no player bundle. An asset
 * uploaded without renditions has no mp4, so its tile stays unclickable.
 *
 * Renditions are billed (encoding once, then storage per minute), so this
 * asks for exactly one: the highest the source supports.
 *
 * The re-sync is the part that is easy to miss. The mapper reads the Sanity
 * document's copy of the Mux payload, not Mux — normally the plugin's webhook
 * refreshes it, but nothing is listening when this runs from a terminal.
 *
 *   node --env-file=.env.local scripts/mux-static-renditions.mjs
 */
import { createClient } from "@sanity/client";

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
  return res.status === 204 ? null : (await res.json()).data;
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const docs = await client.fetch(
  `*[_type == "applicant"]{ "name": name, "asset": video.asset->{_id, assetId} }`,
);

for (const { name, asset } of docs) {
  if (!asset?.assetId) {
    console.log(`  ${name} — no Mux asset attached, skipping`);
    continue;
  }

  let live = await mux(`/assets/${asset.assetId}`);
  const existing = live.static_renditions?.files?.length ?? 0;

  if (!existing) {
    // `highest` tracks the source rather than pinning a ladder rung, so a
    // portrait phone master is not silently upscaled to 1080p landscape.
    await mux(`/assets/${asset.assetId}/static-renditions`, {
      method: "POST",
      body: JSON.stringify({ resolution: "highest" }),
    });
    console.log(`  ${name} — rendition requested, encoding…`);

    for (let i = 0; i < 60; i++) {
      await wait(5000);
      live = await mux(`/assets/${asset.assetId}`);
      if (live.static_renditions?.files?.some((f) => f.status === "ready")) break;
    }
  }

  const files = (live.static_renditions?.files ?? []).map((f) => f.name);
  if (!files.length) throw new Error(`${name}: no rendition after waiting`);

  // Whole payload, exactly as the plugin's webhook would leave it.
  await client.patch(asset._id).set({ data: live }).commit();
  console.log(`     ${name} — ${files.join(", ")}`);
}

console.log("\nDone.");
