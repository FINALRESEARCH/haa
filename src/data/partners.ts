import type { PartnerLogo } from "@/content/types";

export const PARTNER_LOGOS: PartnerLogo[] = [
  { file: "nvidia", name: "NVIDIA", scale: 1 },
  // TODO: /partners/a16z.svg is not in the repo yet; this cell draws empty.
  { file: "a16z", name: "Andreessen Horowitz", scale: 1 },
  { file: "anduril", name: "Anduril", scale: 0.85 },
  { file: "anthropic", name: "Anthropic", scale: 1 },
  { file: "openai", name: "OpenAI", scale: 1 },
  { file: "meta", name: "Meta", scale: 1 },
  { file: "coinbase", name: "Coinbase", scale: 2.1 },
  { file: "replit", name: "Replit", scale: 1 },
  { file: "stripe", name: "Stripe", scale: 1 },
  { file: "palantir", name: "Palantir", scale: 1 },
].map(({ file, name, scale }) => ({ src: `/partners/${file}.svg`, name, scale }));
