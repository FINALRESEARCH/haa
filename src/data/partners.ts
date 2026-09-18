import type { PartnerLogo } from "@/content/types";

export const PARTNER_LOGOS: PartnerLogo[] = [
  { file: "coinbase", name: "Coinbase", scale: 2.1 },
  { file: "google", name: "Google", scale: 1 },
  { file: "meta", name: "Meta", scale: 1 },
  { file: "nvidia", name: "NVIDIA", scale: 1 },
  { file: "replit", name: "Replit", scale: 1 },
  { file: "stripe", name: "Stripe", scale: 1 },
  { file: "openai", name: "OpenAI", scale: 1 },
  { file: "anthropic", name: "Anthropic", scale: 1 },
  { file: "palantir", name: "Palantir", scale: 1 },
  { file: "anduril", name: "Anduril", scale: 0.85 },
].map(({ file, name, scale }) => ({ src: `/partners/${file}.svg`, name, scale }));
