/**
 * Cuts the applicant marquee's tiles out of the full interview masters.
 *
 * Each master yields two files in `public/applicants/`: a silent 4s excerpt
 * the tile drifts, and the poster it shows until that excerpt is decoded.
 * The masters themselves go to Mux untouched — this never feeds the modal.
 *
 * Small on purpose. A marquee row duplicates its tiles to wrap seamlessly, so
 * a dozen of these decode at once; 480p at 20fps is the budget that keeps
 * that affordable, and the footage is moving anyway.
 *
 *   node scripts/encode-loops.mjs [slug ...]
 */
import { execFile } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "applicants");

/** Tile geometry: 3:4 portrait, sized for a ~20vw tile on a retina screen. */
const W = 360;
const H = 480;
const SECONDS = 4;
const FPS = 20;

const manifest = JSON.parse(
  await readFile(join(root, "scripts", "applicants.json"), "utf8"),
);

const only = process.argv.slice(2);
const queue = only.length
  ? manifest.applicants.filter((a) => only.includes(a.slug))
  : manifest.applicants;

if (!queue.length) {
  console.error(`No applicants matched ${only.join(", ")}.`);
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

/**
 * Fill the tile from the centre of the source, then slide the window to
 * `cropX`. `force_original_aspect_ratio=increase` scales the short edge up to
 * the tile before cropping, so a landscape master loses its sides rather than
 * being letterboxed into the column.
 */
const filter = (cropX) => {
  const x = `(iw-${W})*${cropX}`;
  return [
    `scale=${W}:${H}:force_original_aspect_ratio=increase`,
    `crop=${W}:${H}:${x}:(ih-${H})/2`,
    `fps=${FPS}`,
  ].join(",");
};

for (const { slug, name, file, loopStart, cropX = 0.5 } of queue) {
  const src = join(manifest.sourceDir, file);
  const loop = join(outDir, `${slug}-loop.mp4`);
  const poster = join(outDir, `${slug}-poster.jpg`);

  // `-ss` before `-i` seeks on the keyframe index instead of decoding up to
  // the in-point, which matters when the master is a minute of 13Mbps HEVC.
  await run("ffmpeg", [
    "-nostdin", "-loglevel", "error", "-y",
    "-ss", String(loopStart), "-t", String(SECONDS), "-i", src,
    "-vf", filter(cropX),
    "-c:v", "libx264", "-profile:v", "high", "-crf", "30", "-preset", "slow",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-an",
    loop,
  ]);

  await run("ffmpeg", [
    "-nostdin", "-loglevel", "error", "-y",
    "-ss", String(loopStart), "-i", src,
    "-frames:v", "1", "-vf", filter(cropX), "-q:v", "4",
    poster,
  ]);

  console.log(`  ${name.padEnd(16)} ${slug}-loop.mp4 + poster`);
}

console.log(`\n${queue.length} encoded into public/applicants/.`);
