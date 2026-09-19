// Derives the line work for the Life section's "traced city" variant from the
// source aerial, producing `public/life/sf-lines.webp` alongside a web-sized
// `public/life/sf-aerial.jpg`.
//
// Source: Adobe Stock 1177977191, licensed 2026-09-18, 8192x6144. Adobe's own
// vectorizer times out on a frame this dense, so the trace happens here; the
// output is a raster, not an SVG.
//
// Point SRC at the licensed original and run: node scripts/trace-sf-lines.mjs

import sharp from "sharp";

const SRC = "/tmp/sfwork/sf-aerial-full.jpg";

/**
 * Detection runs at the output size rather than small-and-upscaled. Upscaling
 * a binary trace is what gives a line its weight, so it cannot also give you a
 * one-pixel line; the thinning below does that job instead, and detecting at
 * full size is what recovers the bridge cables and the facade detail.
 */
const WIDTH = 1500;
const BLUR = 1.5;
/** Hysteresis pair: `HIGH` seeds a contour, `LOW` is allowed to continue one. */
const HIGH = 100;
const LOW = 36;

const { data, info } = await sharp(SRC)
  .resize({ width: WIDTH })
  .greyscale()
  .normalise()
  .blur(BLUR)
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const N = width * height;

/**
 * The frame runs from the Marin ridge at the top to rooftops underfoot at the
 * bottom, and edge energy climbs steeply with proximity. Weighting the
 * gradient by depth lets one threshold pair hold the bridge and the ridge line
 * while still refusing the near field, which otherwise swamps the plate.
 */
const depthAt = (y) => {
  const t = y / height;
  if (t < 0.3) return 1.3; // sky, Marin, the bay and the bridge
  if (t < 0.55) return 1.0; // the skyline band: the subject
  return 1 - 0.45 * ((t - 0.55) / 0.45) ** 1.2; // near field: let it go
};

const mag = new Float32Array(N);
/** Gradient angle quantised to the four neighbour axes. */
const dir = new Uint8Array(N);

for (let y = 1; y < height - 1; y++) {
  const depth = depthAt(y);
  for (let x = 1; x < width - 1; x++) {
    const i = y * width + x;
    const gx =
      -data[i - width - 1] + data[i - width + 1] +
      -2 * data[i - 1] + 2 * data[i + 1] +
      -data[i + width - 1] + data[i + width + 1];
    const gy =
      -data[i - width - 1] - 2 * data[i - width] - data[i - width + 1] +
      data[i + width - 1] + 2 * data[i + width] + data[i + width + 1];
    mag[i] = Math.hypot(gx, gy) * depth;
    const angle = ((((Math.atan2(gy, gx) * 180) / Math.PI) % 180) + 180) % 180;
    dir[i] = angle < 22.5 || angle >= 157.5 ? 0 : angle < 67.5 ? 1 : angle < 112.5 ? 2 : 3;
  }
}

/**
 * Non-maximum suppression. A Sobel response is a shoulder two or three pixels
 * wide, which is why thresholding it alone can only ever produce a thick line.
 * Keeping the crest — the local maximum along the gradient — leaves a single
 * pixel, and it is the whole reason this reads as drawn rather than traced.
 */
const ridge = new Float32Array(N);
const across = [
  [1, -1],
  [width + 1, -width - 1],
  [width, -width],
  [width - 1, -width + 1],
];
for (let i = width + 1; i < N - width - 1; i++) {
  const [a, b] = across[dir[i]];
  if (mag[i] >= mag[i + a] && mag[i] >= mag[i + b]) ridge[i] = mag[i];
}

/**
 * Hysteresis. A single threshold either breaks long faint contours — the
 * cables, the ridge line — or admits speckle everywhere. Seeding on the high
 * threshold and then walking outwards through anything above the low one keeps
 * contours whole while leaving isolated weak pixels behind.
 */
const out = Buffer.alloc(N);
const pending = [];
for (let i = 0; i < N; i++) {
  if (ridge[i] >= HIGH) {
    out[i] = 255;
    pending.push(i);
  }
}
const neighbours = [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1];
while (pending.length) {
  const i = pending.pop();
  for (const step of neighbours) {
    const j = i + step;
    if (j > 0 && j < N && !out[j] && ridge[j] >= LOW) {
      out[j] = 255;
      pending.push(j);
    }
  }
}

/**
 * The line art ships as an *alpha* mask: coverage in the alpha channel, colour
 * channels unused. A luminance mask would be the tidier encoding, but
 * `mask-mode: luminance` has no equivalent under Safari's `-webkit-mask-*`
 * implementation, which always reads alpha — against an image with no alpha
 * channel that means "opaque everywhere", and the ink renders as a solid sheet
 * over the whole plate. Alpha is the encoding both engines agree on.
 *
 * Masking at all (rather than `mix-blend-multiply`) is what lets the ink be
 * coloured in CSS; the blend also renders nothing inside the composited,
 * transformed plate layer the section animates.
 */
const inked = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) inked[i * 4 + 3] = out[i];

// Lossless, and not as a concession: the trace is two-valued, so lossy WebP
// has no redundancy to trade away, and its alpha prediction filter smears
// one-pixel lines into horizontal banding.
await sharp(inked, { raw: { width, height, channels: 4 } })
  .webp({ lossless: true, effort: 6 })
  .toFile("public/life/sf-lines.webp");

await sharp(SRC)
  .resize({ width: 2560 })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/life/sf-aerial.jpg");

const ink = out.reduce((total, v) => total + (v ? 1 : 0), 0);
console.log(`traced ${width}x${height}, ${((100 * ink) / N).toFixed(1)}% ink`);
