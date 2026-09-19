import type { MuxVideo, Portrait } from "@/content/types";

const portrait = (n: number) =>
  `/portraits/portrait-${String(n).padStart(2, "0")}.jpg`;

/**
 * Stand-in hover footage. The real clips are the client's to source — each
 * speaker actually speaking somewhere — and land as Mux assets on the `person`
 * document, at which point Sanity supplies `video` and none of this is used.
 *
 * Until then the applicant loops already in `public/` stand in, cycled rather
 * than repeated so the grid does not read as one clip playing ten times.
 */
const PLACEHOLDER_SLUGS = [
  "diwen-huang",
  "elle-liemandt",
  "idhant-ranjan",
  "ren-takahashi",
];

export const placeholderVideo = (i: number): MuxVideo => {
  const slug = PLACEHOLDER_SLUGS[i % PLACEHOLDER_SLUGS.length];
  return {
    src: `/applicants/${slug}-loop.mp4`,
    poster: `/applicants/${slug}-poster.jpg`,
  };
};

const speaker = (n: number, name: string, title: string): Portrait => ({
  src: portrait(n),
  name,
  affiliation: title,
  video: placeholderVideo(n),
});

export const people: Portrait[] = [
  speaker(1, "Sam Altman", "Founder of OpenAI"),
  speaker(2, "Jensen Huang", "CEO of NVIDIA"),
  speaker(3, "Marc Andreessen", "Co-founder of a16z"),
  speaker(4, "Fei-Fei Li", "Professor at Stanford"),
  speaker(5, "Yuval Noah Harari", "Author of Sapiens"),
  // TODO: the client has not identified these two portraits. They hold their
  // place in the grid and simply go uncaptioned until the names land.
  speaker(6, "", ""),
  speaker(7, "Mark Zuckerberg", "Founder of Meta"),
  speaker(8, "Alex Karp", "CEO of Palantir"),
  speaker(9, "", ""),
  speaker(10, "Larry Page", "Co-founder of Google"),
];
