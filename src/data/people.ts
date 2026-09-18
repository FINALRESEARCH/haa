import type { Portrait } from "@/content/types";

const portrait = (n: number) =>
  `/portraits/portrait-${String(n).padStart(2, "0")}.jpg`;

export const people: Portrait[] = [
  { src: portrait(1), name: "Sam Altman", affiliation: "OpenAI" },
  { src: portrait(2), name: "Jensen Huang", affiliation: "NVIDIA" },
  { src: portrait(3), name: "Marc Andreessen", affiliation: "a16z" },
  { src: portrait(4), name: "Fei-Fei Li", affiliation: "Stanford" },
  { src: portrait(5), name: "Yuval Noah Harari", affiliation: "Author" },
  // TODO: confirm the two unidentified portraits before these chips ship.
  { src: portrait(6), name: "", affiliation: "" },
  { src: portrait(7), name: "Mark Zuckerberg", affiliation: "Meta" },
  { src: portrait(8), name: "Alex Karp", affiliation: "Palantir" },
  { src: portrait(9), name: "", affiliation: "" },
  { src: portrait(10), name: "Larry Page", affiliation: "Google" },
];
