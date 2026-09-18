import type { Applicant } from "@/content/types";

/**
 * The four masters delivered so far. `scripts/encode-loops.mjs` cuts the loop
 * and poster for each out of `scripts/applicants.json`; keep the slugs in the
 * two files the same.
 *
 * `playbackId` stays empty until the master is uploaded to Mux — the tile
 * falls back to being unclickable rather than opening an empty modal.
 */
const tile = (slug: string, name: string, pursuit: string): Applicant => ({
  name,
  pursuit,
  loop: `/applicants/${slug}-loop.mp4`,
  poster: `/applicants/${slug}-poster.jpg`,
  playbackId: "",
});

export const applicants: Applicant[] = [
  tile("diwen-huang", "Diwen Huang", ""),
  tile("elle-liemandt", "Elle Liemandt", ""),
  tile("idhant-ranjan", "Idhant Ranjan", ""),
  // TODO: name this one — the master is still an unedited camera-roll file.
  tile("applicant-04", "", ""),
];
