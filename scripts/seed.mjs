/**
 * First-run seed: pushes the site as it shipped before Sanity into the dataset,
 * uploading everything in `public/` as real assets.
 *
 * It mirrors `src/content/defaults.ts`, which stays the in-app fallback. Every
 * document is written with `createIfNotExists`, so running this a second time
 * never overwrites an editor's work — delete a document in the Studio first if
 * you want it rebuilt.
 *
 *   npm run sanity:seed
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { ABOUT } from "../src/content/about.data.mjs";
import { COURSES_PAGE } from "../src/content/courses.data.mjs";
import { CURRICULUM } from "../src/content/curriculum.data.mjs";
import { NAV_SECTIONS } from "../src/content/nav.data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET or SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-06-01",
  useCdn: false,
});

/** Sanity dedupes by content hash, so re-uploading the same file is free. */
async function uploadImage(publicPath) {
  const filename = publicPath.split("/").pop();
  const body = await readFile(join(root, "public", publicPath));
  const asset = await client.assets.upload("image", body, { filename });
  process.stdout.write(`  uploaded ${publicPath}\n`);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

/** Same as `uploadImage`, but a file that is not in `public` is skipped. */
async function uploadImageIfPresent(publicPath) {
  try {
    return await uploadImage(publicPath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    process.stdout.write(`  skipped ${publicPath} (not in public/)\n`);
    return null;
  }
}

const ref = (_ref) => ({ _type: "reference", _ref });

/**
 * Sanity reserves the period in document ids for drafts and releases, and a
 * mutation that uses one is dropped without an error. Fail loudly instead.
 */
async function assertExists(ids) {
  const found = await client.fetch("*[_id in $ids]._id", { ids });
  const missing = ids.filter((id) => !found.includes(id));
  if (missing.length) {
    throw new Error(`These documents were not written: ${missing.join(", ")}`);
  }
}
const keyed = (items) =>
  items.map((item, index) => ({ ...item, _key: `k${index}` }));

/**
 * `relationship` and `fields` drive the /network directory's two filters. The
 * values here are placeholders, same as the ones in `src/data/network.ts`:
 * plausible, not sourced, and meant to be replaced the moment the client's own
 * database lands. The two unidentified portraits carry neither — they are not
 * in the directory at all until they have a name.
 */
const PEOPLE = [
  { slug: "sam-altman", name: "Sam Altman", affiliation: "OpenAI", file: "portrait-01.jpg", relationship: "guest-speaker", fields: ["ai", "startups"] },
  { slug: "jensen-huang", name: "Jensen Huang", affiliation: "NVIDIA", file: "portrait-02.jpg", relationship: "guest-speaker", fields: ["ai", "engineering"] },
  { slug: "marc-andreessen", name: "Marc Andreessen", affiliation: "a16z", file: "portrait-03.jpg", relationship: "founding-partner", fields: ["investing", "startups"] },
  { slug: "fei-fei-li", name: "Fei-Fei Li", affiliation: "Stanford", file: "portrait-04.jpg", relationship: "faculty", fields: ["ai", "science"] },
  { slug: "yuval-noah-harari", name: "Yuval Noah Harari", affiliation: "Author", file: "portrait-05.jpg", relationship: "guest-speaker", fields: ["writing"] },
  // TODO: the client has not identified these two portraits. They hold their
  // place in the grid and simply go uncaptioned until the names land.
  { slug: "portrait-06", name: "", affiliation: "", file: "portrait-06.jpg" },
  { slug: "mark-zuckerberg", name: "Mark Zuckerberg", affiliation: "Meta", file: "portrait-07.jpg", relationship: "guest-speaker", fields: ["startups", "leadership"] },
  { slug: "alex-karp", name: "Alex Karp", affiliation: "Palantir", file: "portrait-08.jpg", relationship: "mentor", fields: ["startups", "ai"] },
  { slug: "portrait-09", name: "", affiliation: "", file: "portrait-09.jpg" },
  { slug: "larry-page", name: "Larry Page", affiliation: "Google", file: "portrait-10.jpg", relationship: "advisor", fields: ["engineering", "product"] },
];

// The ten founding partners, mirroring `src/data/partners.ts` — keep the two
// in step. a16z is deliberately absent: it backs HAA but does not pay for a
// slot here, and these ten do. Scales are equal-area, not equal-height; see
// the note in that file before changing one.
const PARTNERS = [
  { slug: "nvidia", name: "NVIDIA", scale: 0.97 },
  { slug: "anduril", name: "Anduril", scale: 0.96 },
  { slug: "anthropic", name: "Anthropic", scale: 0.75 },
  { slug: "openai", name: "OpenAI", scale: 1.16 },
  { slug: "meta", name: "Meta", scale: 1 },
  { slug: "coinbase", name: "Coinbase", scale: 0.94 },
  { slug: "replit", name: "Replit", scale: 1.07 },
  { slug: "stripe", name: "Stripe", scale: 1.44 },
  { slug: "palantir", name: "Palantir", scale: 1.09 },
  { slug: "google", name: "Google", scale: 1.29 },
];


const MARK_PATH =
  "M19.0845 26.449H11.0349V0H19.0845V26.449ZM38.1449 26.449H30.0953L22.7519 0H30.8013L38.1449 26.449ZM52.5017 26.449H44.4521L37.1087 0H45.1583L52.5017 26.449ZM7.4751 16.9619H0V9.48684H7.4751V16.9619Z";

async function main() {
  console.log(`Seeding ${projectId}/${dataset}\n`);

  console.log("Portraits:");
  const people = [];
  for (const person of PEOPLE) {
    const portrait = await uploadImage(`portraits/${person.file}`);
    const _id = `person-${person.slug}`;
    await client.createIfNotExists({
      _id,
      _type: "person",
      name: person.name,
      affiliation: person.affiliation,
      portrait,
      ...(person.relationship ? { relationship: person.relationship } : {}),
      ...(person.fields ? { fields: person.fields } : {}),
    });
    people.push(_id);
  }

  console.log("\nPartner marks:");
  const partners = [];
  for (const partner of PARTNERS) {
    const logo = await uploadImageIfPresent(`partners/${partner.slug}.svg`);
    if (!logo) continue;
    const _id = `partner-${partner.slug}`;
    await client.createIfNotExists({
      _id,
      _type: "partner",
      name: partner.name,
      scale: partner.scale,
      logo,
    });
    partners.push(_id);
  }

  await assertExists([...people, ...partners]);

  console.log("\nIdentity:");
  const fullLogo = await uploadImage("full-logo.svg");
  const wordmark = await uploadImage("wordmark.svg");
  const skyline = await uploadImage("life/sf.jpg");
  // Placeholder favicon until a purpose-drawn square icon replaces it.
  const favicon = await uploadImage("mark.svg");

  console.log("\nDocuments:");
  await client.createIfNotExists({
    _id: "siteSettings",
    _type: "siteSettings",
    title: "The Horowitz Andreessen Academy",
    description: "An academy for unusually ambitious young people.",
    applyCta: { _type: "cta", label: "Apply", href: "#apply" },
    fullLogo,
    wordmark,
    markPath: MARK_PATH,
    favicon,
    // ogImage intentionally omitted — action item, pending from the client.
    background: "#f7f6f4",
    foreground: "#111111",
    brand: "#fe3619",
    panel: "#efeeec",
    rule: "rgba(0, 0, 0, 0.04)",
  });
  console.log("  siteSettings");

  await client.createIfNotExists({
    _id: "navigation",
    _type: "navigation",
    items: keyed(
      NAV_SECTIONS.map((item) => ({
        _type: "navPanel",
        label: item.label,
        anchor: item.id,
        heading: item.heading,
        body: item.body,
        readMoreLabel: "Read more",
      })),
    ),
  });
  console.log("  navigation");

  await client.createIfNotExists({
    _id: "homePage",
    _type: "homePage",
    hero: {
      _type: "heroSection",
      headline: "An academy for unusually ambitious young people.",
      body: "For students who would rather spend their time making, investigating, experimenting, and pursuing difficult questions.",
      cta: { _type: "cta", label: "Apply", href: "#apply" },
    },
    network: {
      _type: "networkSection",
      heading: "Learn from people shaping the world.",
      body: "A community of founders, scientists, engineers, investors, designers, and operators teach at HAA, speak with students, offer mentorship, and open doors to Silicon Valley and the world.",
      cta: { _type: "cta", label: "Explore the network", href: "#network" },
      portraits: keyed(people.map(ref)),
    },
    program: {
      _type: "programSection",
      heading: "A year of building.",
      subheading: "Look closer at a day.",
      paragraphs: [
        "Most of your time is spent on self-directed pursuits: starting a company, building a technical system, conducting research, making art, writing, mastering a new field, or following an idea far enough to discover where it leads.",
        "Around that work, you can choose intensive courses taught by industry leaders, seek guidance from mentors, spend three months working inside a company, and go explore the world.",
      ],
      cta: { _type: "cta", label: "Explore the program", href: "/curriculum" },
      gridLabel: "Illustrative year",
      gridSummary: "Every square is a day of possibility.",
      dayTitle: "A day at the Academy.",
      weekdayBody:
        "Focused time to build, with a community that helps you go further. This is an example of the Academy\u2019s daily rhythm.",
      weekendBody:
        "Unscheduled time. Explore the city, recharge, or follow an idea just because you can.",
    },
    admissions: {
      _type: "admissionsSection",
      heading: "For people who are hungry to learn and build.",
      paragraphs: [
        "Maybe you were the person building something after school while everyone else was studying for the test. Maybe you joined the robotics club, started a company, taught yourself to code, obsessed over an obscure subject, made films, ran events, built machines, wrote constantly, or found some other thing you couldn’t stop thinking about.",
        "We’re looking for you.",
        "Meet some of the other people who share that drive and are applying to HAA.",
      ],
      cta: { _type: "cta", label: "Learn about admissions", href: "/admissions" },
    },
    partners: {
      _type: "partnersSection",
      layout: "marquee",
      eyebrow: "Partners",
      heading: "Connected to the institutions shaping what comes next.",
      body: "HAA is being built with a network spanning frontier technology, entrepreneurship, research, and industry.",
      logos: keyed(partners.map(ref)),
    },
    life: {
      _type: "lifeSection",
      layout: "lockup",
      image: {
        ...skyline,
        alt: "San Francisco and the Bay Bridge at dusk, seen from across the bay",
      },
      heading: "Residence in San Francisco.",
      paragraphs: [
        "HAA is residential because the people around you matter as much as the material you study.",
        "You will live and work alongside a small cohort of unusually driven peers, in a city where some of the most consequential technology companies and research labs in the world are being built.",
        "San Francisco becomes an extension of the Academy: the people you meet, the companies you visit, the conversations you stumble into, and the ideas circulating through the city.",
      ],
      cta: { _type: "cta", label: "Explore life at HAA", href: "/life" },
    },
    closing: {
      _type: "closingSection",
      layout: "quiet",
      heading: "What will you pursue?",
      paragraphs: [
        "Bring your obsessions, your unfinished ideas, the questions you can\u2019t leave alone, and the things you have already started.",
        "We\u2019ll give you exceptional peers, extraordinary teachers, access to a remarkable network, and room to pursue them seriously.",
      ],
      applyLabel: "Apply",
      links: keyed([
        { _type: "cta", label: "Explore the Program", href: "/program" },
        { _type: "cta", label: "Meet the Network", href: "/network" },
        { _type: "cta", label: "Admissions", href: "/admissions" },
      ]),
    },
  });
  console.log("  homePage");

  await client.createIfNotExists({
    _id: "aboutPage",
    _type: "aboutPage",
    layout: ABOUT.layout,
    eyebrow: ABOUT.eyebrow,
    heading: ABOUT.heading,
    opening: ABOUT.opening,
    chapters: keyed(
      ABOUT.chapters.map((chapter) => ({
        _type: "aboutChapter",
        heading: chapter.heading,
        paragraphs: chapter.paragraphs,
        links: keyed(chapter.links.map((link) => ({ _type: "cta", ...link }))),
      })),
    ),
    applyLabel: ABOUT.closing.applyLabel,
    links: keyed(ABOUT.closing.links.map((link) => ({ _type: "cta", ...link }))),
  });
  console.log("  aboutPage");

  await client.createIfNotExists({
    _id: "curriculumPage",
    _type: "curriculumPage",
    eyebrow: CURRICULUM.eyebrow,
    heading: CURRICULUM.heading,
    opening: CURRICULUM.opening,
    chapters: keyed(
      CURRICULUM.chapters.map((chapter) => ({
        _type: "curriculumChapter",
        heading: chapter.heading,
        lede: chapter.lede,
        paragraphs: chapter.paragraphs,
        points: keyed(
          chapter.points.map((point) => ({
            _type: "curriculumPoint",
            heading: point.heading,
            paragraphs: point.paragraphs,
            features: point.features,
          })),
        ),
        features: chapter.features,
        links: keyed(chapter.links.map((link) => ({ _type: "cta", ...link }))),
      })),
    ),
    pursuits: CURRICULUM.pursuits,
    week: keyed(
      CURRICULUM.week.map((day) => ({
        _type: "curriculumDay",
        day: day.day,
        entries: keyed(
          day.entries.map((entry) => ({ _type: "curriculumEntry", ...entry })),
        ),
      })),
    ),
    closingHeading: CURRICULUM.closing.heading,
    applyLabel: CURRICULUM.closing.applyLabel,
  });
  console.log("  curriculumPage");

  await client.createIfNotExists({
    _id: "coursesPage",
    _type: "coursesPage",
    ...COURSES_PAGE,
  });
  console.log("  coursesPage");

  // The catalogue itself is not seeded: it is an Airtable base, so it comes
  // in through `npm run courses:import` the way the network does.

  console.log("\nDone. Open /studio to edit.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
