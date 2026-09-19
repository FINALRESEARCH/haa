import { sections as navSections } from "@/components/sections";
import { PARTNER_LOGOS } from "@/data/partners";
import { applicants } from "@/data/applicants";
import { people } from "@/data/people";
import type { SiteContent } from "./types";

const MARK_PATH =
  "M19.0845 26.449H11.0349V0H19.0845V26.449ZM38.1449 26.449H30.0953L22.7519 0H30.8013L38.1449 26.449ZM52.5017 26.449H44.4521L37.1087 0H45.1583L52.5017 26.449ZM7.4751 16.9619H0V9.48684H7.4751V16.9619Z";

/**
 * The site as it was before Sanity, kept as the fallback for every field. The
 * mapper in `src/sanity/content.ts` reaches for one of these whenever the
 * dataset has nothing to offer, so the page never renders a hole.
 */
export const DEFAULT_CONTENT: SiteContent = {
  settings: {
    title: "The Horowitz Andreessen Academy",
    description: "An academy for unusually ambitious young people.",
    applyCta: { label: "Apply Now", href: "#apply" },
    fullLogo: "/full-logo.svg",
    wordmark: "/wordmark.svg",
    markPath: MARK_PATH,
    // Placeholder until a purpose-drawn square icon replaces it.
    favicon: "/mark.svg",
    // Genuinely blank: the client hasn't supplied share artwork yet.
    ogImage: null,
    theme: {
      background: "#f7f6f4",
      foreground: "#111111",
      brand: "#fe3619",
      panel: "#efeeec",
      rule: "rgba(0, 0, 0, 0.04)",
    },
  },

  nav: navSections.map((section) => ({
    id: section.id,
    label: section.label,
    heading: section.heading,
    body: section.body,
    readMoreLabel: "Read more",
  })),

  sections: {
    hero: {
      layout: "original",
      headline: "An academy for unusually ambitious young people.",
      body: "For students who would rather spend their time making, investigating, experimenting, and pursuing difficult questions.",
      cta: { label: "Apply to HAA", href: "#apply" },
      // Genuinely blank: the footage only ever comes from Mux.
      video: null,
      markPath: MARK_PATH,
    },

    network: {
      heading: "Learn from people shaping the world.",
      body: "A community of founders, scientists, engineers, investors, designers, and operators teach at HAA, speak with students, offer mentorship, and open doors to Silicon Valley and the world.",
      cta: { label: "Explore the network", href: "#network" },
      portraits: people,
    },

    program: {
      heading: "Build your education around what you want to pursue.",
      subheading:
        "HAA is a San Francisco-based residential alternative to the traditional college path.",
      paragraphs: [
        "Most of your time is spent on self-directed pursuits: starting a company, building a technical system, conducting research, making art, writing, mastering a new field, or following an idea far enough to discover where it leads.",
        "Around that work, you can choose intensive courses taught by industry leaders, seek guidance from mentors, spend three months working inside a company, and go explore the world.",
      ],
      cta: { label: "Explore the program", href: "#curriculum" },
    },

    admissions: {
      image: {
        src: "/workshop.jpg",
        alt: "A student working at a bench of half-built electronics",
      },
      heading: "For people who have never been good at waiting.",
      paragraphs: [
        "Maybe you were the person building something after school while everyone else was studying for the test.",
        "Maybe you joined the robotics club, started a company, taught yourself to code, obsessed over an obscure subject, made films, ran events, built machines, wrote constantly, or found some other thing you couldn’t stop thinking about.",
        "You are curious. You take initiative. You want your work to matter.",
        "And you want to spend your life around people who have the same intensity.",
      ],
      cta: { label: "Learn about admissions", href: "#admissions" },
    },

    people: {
      layout: "wall",
      heading: "Meet the kind of people we’re looking for.",
      paragraphs: [
        "They’re already building, researching, experimenting, and pursuing ideas of their own.",
        "Meet some of HAA’s early applicants and see what they’re working on.",
      ],
      // The wall is four across by two down, so it takes the first eight.
      tiles: people.slice(0, 8),
      applicants,
    },

    life: {
      layout: "splat",
      image: {
        src: "/life/sf.jpg",
        alt: "San Francisco and the Bay Bridge at dusk, seen from across the bay",
      },
      heading: "Residence in San Francisco.",
      paragraphs: [
        "HAA is residential because the people around you matter as much as the material you study.",
        "You will live and work alongside a small cohort of unusually driven peers, in a city where some of the most consequential technology companies and research labs in the world are being built.",
        "San Francisco becomes an extension of the Academy: the people you meet, the companies you visit, the conversations you stumble into, and the ideas circulating through the city.",
      ],
      cta: { label: "Explore life at HAA", href: "/life" },
    },

    closing: {
      layout: "quiet",
      heading: "What will you pursue?",
      paragraphs: [
        "Bring your obsessions, your unfinished ideas, the questions you can’t leave alone, and the things you have already started.",
        "We’ll give you exceptional peers, extraordinary teachers, access to a remarkable network, and room to pursue them seriously.",
      ],
      apply: { label: "Apply to HAA", href: "#apply" },
      links: [
        { label: "Explore the Program", href: "/program" },
        { label: "Meet the Network", href: "/network" },
        { label: "Admissions", href: "/admissions" },
      ],
      markPath: MARK_PATH,
    },

    partners: {
      layout: "marquee",
      eyebrow: "Partners",
      heading: "Connected to the institutions shaping what comes next.",
      body: "HAA is being built with a network spanning frontier technology, entrepreneurship, research, and industry.",
      logos: PARTNER_LOGOS,
    },
  },
};
