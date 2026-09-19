import type { PartnerLogo } from "@/content/types";

/**
 * The ten founding partners — the ones who pay, shape the curriculum, and put
 * their mark here. Hiring partners are a separate tier and do not appear.
 *
 * Every mark is a full wordmark lockup, not an icon glyph: at the size these
 * draw, too few people recognise the icons alone.
 *
 * `scale` is normalised for equal optical area rather than equal height. The
 * lockups run from 2.4:1 (Stripe) to 8.9:1 (Anthropic), so sizing them all to
 * one height would make the squat marks read as small and the long ones as
 * enormous. Each value is sqrt(4.96 / ownRatio) — 4.96 being the median, Meta —
 * which holds the marks at a constant area. Nudge by hand from there.
 *
 * Sources (Wikimedia Commons unless noted; anduril.svg predates this pass):
 *   nvidia     File:NVIDIA logo.svg — the current eye+wordmark lockup.
 *              The bare "Nvidia_logo.svg" wordmark is an older, heavier
 *              cut. The registered-mark glyph is stripped; no other mark
 *              in the grid carries one.
 *   anthropic  File:Anthropic_logo.svg
 *   openai     File:OpenAI_Logo.svg
 *   meta       File:Meta_Platforms_Inc._logo.svg
 *   coinbase   File:Coinbase.svg
 *   stripe     File:Stripe_Logo,_revised_2016.svg
 *   palantir   File:Palantir_Technologies_logo.svg
 *   google     File:Google_2015_logo.svg
 *   replit     svgl.app replit-wordmark-light.svg (Commons has icon only)
 */
export const PARTNER_LOGOS: PartnerLogo[] = [
  { file: "nvidia", name: "NVIDIA", scale: 0.97 },
  { file: "anduril", name: "Anduril", scale: 0.96 },
  { file: "anthropic", name: "Anthropic", scale: 0.75 },
  { file: "openai", name: "OpenAI", scale: 1.16 },
  { file: "meta", name: "Meta", scale: 1 },
  { file: "coinbase", name: "Coinbase", scale: 0.94 },
  { file: "replit", name: "Replit", scale: 1.07 },
  { file: "stripe", name: "Stripe", scale: 1.44 },
  { file: "palantir", name: "Palantir", scale: 1.09 },
  { file: "google", name: "Google", scale: 1.29 },
].map(({ file, name, scale }) => ({ src: `/partners/${file}.svg`, name, scale }));
