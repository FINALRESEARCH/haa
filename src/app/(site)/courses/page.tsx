import type { Metadata } from "next";
import Catalogue from "@/components/courses/Catalogue";
import { getSiteContent } from "@/sanity/content";
import { getCourses } from "@/sanity/courses";

export async function generateMetadata(): Promise<Metadata> {
  const { courses } = await getSiteContent();
  return { title: "Courses", description: courses.heading };
}

/**
 * The course directory. Deliberately not the /network shell: see the note at
 * the top of `Catalogue.tsx`. The rows are `course` documents, falling back
 * to the client's Airtable export — `src/sanity/courses.ts` decides which.
 */
export default async function CoursesPage() {
  const [{ courses: page }, catalogue] = await Promise.all([
    getSiteContent(),
    getCourses(),
  ]);

  return <Catalogue eyebrow={page.eyebrow} courses={catalogue} />;
}
