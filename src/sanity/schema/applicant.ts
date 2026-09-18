import { PlayIcon } from "@sanity/icons/Play";
import { defineField, defineType } from "sanity";

/**
 * One of the applicants on the "Meet the kind of people we're looking for"
 * marquee. Distinct from `person`, which is the faculty/network grid: those
 * are a still portrait and a job title, these are a minute of video.
 *
 * Two artefacts come out of each of these, from one master upload:
 *   - the full video, hosted on Mux, played with audio in the tile's modal
 *   - a silent 4s excerpt + poster, cut by `scripts/encode-loops.mjs` into
 *     `public/applicants/`, which is what the marquee tile actually drifts
 *
 * The excerpt is a local file rather than a Sanity asset on purpose: ten of
 * them load on every single page view, and that is the one place where an
 * asset CDN's bandwidth allowance would actually bite.
 */
export const applicant = defineType({
  name: "applicant",
  title: "Applicant",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      description:
        "Names the generated files: `/applicants/<slug>-loop.mp4` and `-poster.jpg`. Re-run the encode script after changing it.",
      options: { source: "name", maxLength: 40 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pursuit",
      type: "string",
      description:
        'What they are working on — the line under the name. "Building a satellite ground station", not a job title.',
    }),
    defineField({
      name: "video",
      type: "mux.video",
      title: "Full video",
      description:
        "The whole interview, with audio. Plays in the modal; never on the marquee.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "loopStart",
      type: "number",
      title: "Loop in-point (seconds)",
      description:
        "Where the silent 4s marquee excerpt is cut from, and the frame the poster is grabbed at. Pick a moment with movement in it — a static talking head reads as a broken video.",
      initialValue: 0,
      validation: (rule) => rule.required().min(0),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "pursuit" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Unnamed applicant",
      subtitle: subtitle || "No pursuit set",
    }),
  },
});
