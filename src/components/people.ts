export type Person = {
  src: string;
  /** Shown in the hover chip; leave empty to suppress the chip. */
  name: string;
  affiliation: string;
};

export const people: Person[] = [
  { src: "/portraits/portrait-01.jpg", name: "Sam Altman", affiliation: "OpenAI" },
  { src: "/portraits/portrait-02.jpg", name: "Jensen Huang", affiliation: "NVIDIA" },
  { src: "/portraits/portrait-03.jpg", name: "Marc Andreessen", affiliation: "a16z" },
  { src: "/portraits/portrait-04.jpg", name: "Fei-Fei Li", affiliation: "Stanford" },
  { src: "/portraits/portrait-05.jpg", name: "Yuval Noah Harari", affiliation: "Author" },
  // TODO: confirm the two unidentified portraits before these chips ship.
  { src: "/portraits/portrait-06.jpg", name: "", affiliation: "" },
  { src: "/portraits/portrait-07.jpg", name: "Mark Zuckerberg", affiliation: "Meta" },
  { src: "/portraits/portrait-08.jpg", name: "Alex Karp", affiliation: "Palantir" },
  { src: "/portraits/portrait-09.jpg", name: "", affiliation: "" },
  { src: "/portraits/portrait-10.jpg", name: "Larry Page", affiliation: "Google" },
];
