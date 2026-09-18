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

const PEOPLE = [
  { slug: "sam-altman", name: "Sam Altman", affiliation: "OpenAI", file: "portrait-01.jpg" },
  { slug: "jensen-huang", name: "Jensen Huang", affiliation: "NVIDIA", file: "portrait-02.jpg" },
  { slug: "marc-andreessen", name: "Marc Andreessen", affiliation: "a16z", file: "portrait-03.jpg" },
  { slug: "fei-fei-li", name: "Fei-Fei Li", affiliation: "Stanford", file: "portrait-04.jpg" },
  { slug: "yuval-noah-harari", name: "Yuval Noah Harari", affiliation: "Author", file: "portrait-05.jpg" },
  // TODO: confirm the two unidentified portraits before these chips ship.
  { slug: "portrait-06", name: "", affiliation: "", file: "portrait-06.jpg" },
  { slug: "mark-zuckerberg", name: "Mark Zuckerberg", affiliation: "Meta", file: "portrait-07.jpg" },
  { slug: "alex-karp", name: "Alex Karp", affiliation: "Palantir", file: "portrait-08.jpg" },
  { slug: "portrait-09", name: "", affiliation: "", file: "portrait-09.jpg" },
  { slug: "larry-page", name: "Larry Page", affiliation: "Google", file: "portrait-10.jpg" },
];

const PARTNERS = [
  { slug: "nvidia", name: "NVIDIA", scale: 1 },
  // TODO: public/partners/a16z.svg is not in the repo yet. Until it lands the
  // loop below skips this entry rather than failing the whole seed.
  { slug: "a16z", name: "Andreessen Horowitz", scale: 1 },
  { slug: "anduril", name: "Anduril", scale: 0.85 },
  { slug: "anthropic", name: "Anthropic", scale: 1 },
  { slug: "openai", name: "OpenAI", scale: 1 },
  { slug: "meta", name: "Meta", scale: 1 },
  { slug: "coinbase", name: "Coinbase", scale: 2.1 },
  { slug: "replit", name: "Replit", scale: 1 },
  { slug: "stripe", name: "Stripe", scale: 1 },
  { slug: "palantir", name: "Palantir", scale: 1 },
];

const NAV = [
  {
    label: "Curriculum",
    anchor: "curriculum",
    heading: "Build your education around what you want to pursue.",
    body: [
      "At HAA, your own pursuits are at the center of your education.",
      "You might start a company, build a new technology, conduct research, make art, write, master a new skill, read a book, or follow a question far enough to discover where it leads.",
      "Courses, faculty, mentors, peers, companies, and the wider HAA network exist around that work: to challenge you, expand what you know, and help you go further.",
    ],
  },
  {
    label: "Network",
    anchor: "network",
    heading: "A network that keeps working after you leave.",
    body: [
      "Students work alongside founders, researchers, investors, and operators who take their projects seriously.",
      "Introductions are made for the work, not for the résumé: the people you meet here are the people you build with next.",
    ],
  },
  {
    label: "Student Life",
    anchor: "student-life",
    heading: "A residential campus built for making things.",
    body: [
      "Everyone lives on campus, surrounded by people doing unreasonably ambitious work.",
      "Studios, labs, and shops stay open late, and the day is structured around the work rather than around the timetable.",
    ],
  },
  {
    label: "Admissions",
    anchor: "admissions",
    heading: "We read for evidence, not credentials.",
    body: [
      "Applications open once a year. We look for what you have already made, questioned, or taught yourself.",
      "There is no test score and no minimum age. Show us the work and tell us where you intend to take it.",
    ],
  },
  {
    label: "About",
    anchor: "about",
    heading: "A residential academy in San Francisco.",
    body: [
      "The Horowitz Andreessen Academy exists for students who would rather spend their time making, investigating, and experimenting than preparing for a life that starts later.",
    ],
  },
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
  const workshop = await uploadImage("workshop.jpg");
  const skyline = await uploadImage("life/sf.jpg");
  // Placeholder favicon until a purpose-drawn square icon replaces it.
  const favicon = await uploadImage("mark.svg");

  console.log("\nDocuments:");
  await client.createIfNotExists({
    _id: "siteSettings",
    _type: "siteSettings",
    title: "The Horowitz Andreessen Academy",
    description: "An academy for unusually ambitious young people.",
    applyCta: { _type: "cta", label: "Apply Now", href: "#apply" },
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
      NAV.map((item) => ({
        _type: "navPanel",
        label: item.label,
        anchor: item.anchor,
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
      cta: { _type: "cta", label: "Apply to HAA", href: "#apply" },
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
      heading: "Build your education around what you want to pursue.",
      subheading:
        "HAA is a San Francisco-based residential alternative to the traditional college path.",
      paragraphs: [
        "Most of your time is spent on self-directed pursuits: starting a company, building a technical system, conducting research, making art, writing, mastering a new field, or following an idea far enough to discover where it leads.",
        "Around that work, you can choose intensive courses taught by industry leaders, seek guidance from mentors, spend three months working inside a company, and go explore the world.",
      ],
      cta: { _type: "cta", label: "Explore the program", href: "#curriculum" },
    },
    admissions: {
      _type: "admissionsSection",
      image: {
        ...workshop,
        alt: "A student working at a bench of half-built electronics",
      },
      heading: "For people who have never been good at waiting.",
      paragraphs: [
        "Maybe you were the person building something after school while everyone else was studying for the test.",
        "Maybe you joined the robotics club, started a company, taught yourself to code, obsessed over an obscure subject, made films, ran events, built machines, wrote constantly, or found some other thing you couldn’t stop thinking about.",
        "You are curious. You take initiative. You want your work to matter.",
        "And you want to spend your life around people who have the same intensity.",
      ],
      cta: { _type: "cta", label: "Learn about admissions", href: "#admissions" },
    },
    peopleWall: {
      _type: "peopleWallSection",
      layout: "wall",
      heading: "Meet the kind of people we’re looking for.",
      paragraphs: [
        "They’re already building, researching, experimenting, and pursuing ideas of their own.",
        "Meet some of HAA’s early applicants and see what they’re working on.",
      ],
      // The wall is four across by two down.
      tiles: keyed(people.slice(0, 8).map(ref)),
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
      applyLabel: "Apply to HAA",
      links: keyed([
        { _type: "cta", label: "Explore the Program", href: "/program" },
        { _type: "cta", label: "Meet the Network", href: "/network" },
        { _type: "cta", label: "Admissions", href: "/admissions" },
      ]),
    },
  });
  console.log("  homePage");

  console.log("\nDone. Open /studio to edit.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
