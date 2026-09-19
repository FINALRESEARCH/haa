import type { Metadata } from "next";
import CurriculumV1 from "@/components/curriculum/v1";
import { PARTNER_LOGOS } from "@/data/partners";
import { getSiteContent } from "@/sanity/content";
import { getCourses } from "@/sanity/courses";
import { getNetworkPeople } from "@/sanity/network";

/** How many of each the page prints before it stops. */
const SPEAKERS = 8;
const MENTORS = 8;
/** Two rows of four on a wide screen; past this is never reached. */
const COURSES = 8;

/** Title from the menu, so the tab and the nav can't drift. */
export async function generateMetadata(): Promise<Metadata> {
  const { nav, curriculum } = await getSiteContent();
  return {
    title: nav.find((panel) => panel.id === "curriculum")?.label ?? "Curriculum",
    description: curriculum.opening[0],
  };
}

/**
 * The lecturer and mentor cards are the /network directory's own documents,
 * filtered by relationship rather than listed again on this page, so the two
 * can never disagree about who teaches here. Whoever has a portrait is put
 * first: the base is mostly unphotographed, and a row of monograms with the
 * two photographs buried in it reads worse than the photographs leading.
 */
function pick(people: Awaited<ReturnType<typeof getNetworkPeople>>, relationship: string, count: number) {
  return people
    .filter((person) => person.relationships.includes(relationship))
    .sort((a, b) => Number(Boolean(b.thumb)) - Number(Boolean(a.thumb)))
    .slice(0, count);
}

export default async function CurriculumPage() {
  const [{ curriculum }, people, catalogue] = await Promise.all([
    getSiteContent(),
    getNetworkPeople(),
    getCourses(),
  ]);

  return (
    <CurriculumV1
      content={curriculum}
      // The featured grid is the catalogue filtered, not a list of its own —
      // ticking "Featured on /curriculum" in the Studio is what puts a course
      // here. Nothing ticked falls back to the courses at the head of the
      // catalogue, rather than leaving a hole where the grid was; tracks are
      // skipped in that fallback, since the chapter this sits under is about
      // courses taught by named faculty.
      courses={(catalogue.some((course) => course.featured)
        ? catalogue.filter((course) => course.featured)
        : catalogue.filter((course) => course.type === "course")
      ).slice(0, COURSES)}
      speakers={pick(people, "guest-speaker", SPEAKERS)}
      mentors={pick(people, "mentor", MENTORS)}
      partners={PARTNER_LOGOS}
    />
  );
}
