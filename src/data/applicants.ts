import type { Applicant } from "@/content/types";

/**
 * The fallback row, used only when the dataset has no `applicant` documents —
 * the real tiles come from Sanity now (see `src/sanity/content.ts`), which is
 * also where the Mux video for each modal comes from.
 *
 * `scripts/encode-loops.mjs` cuts the loop and poster for each out of
 * `scripts/applicants.json`; keep the slugs in the two files the same.
 *
 * `video` is null here by definition: this list exists for the case where
 * there is no dataset to resolve a Mux asset from.
 */
const tile = (slug: string, name: string, pursuit: string): Applicant => ({
  name,
  pursuit,
  loop: `/applicants/${slug}-loop.mp4`,
  poster: `/applicants/${slug}-poster.jpg`,
  video: null,
});

export const applicants: Applicant[] = [
  tile("diwen-huang", "Diwen Huang", "Building a satellite ground station"),
  // TODO: placeholder pursuits. The three lines below are stand-ins of
  // deliberately different lengths — they set the caption's typography while
  // the client supplies what these three are actually working on.
  tile("elle-liemandt", "Elle Liemandt", "Placeholder — pursuit line goes here"),
  tile(
    "idhant-ranjan",
    "Idhant Ranjan",
    "Placeholder — a longer pursuit line, about this length",
  ),
  // TODO: placeholder name as well as pursuit. The client has not supplied
  // this one's real name, and the master is still an unedited camera-roll
  // file, so nothing here is shippable. Left obviously blank rather than
  // plausible, so it cannot go live unnoticed.
  tile("ren-takahashi", "Applicant name TBC", "Placeholder — pursuit TBC"),
];
