import type { StructureResolver } from "sanity/structure";

/**
 * The singletons at the top — the pages, their chrome, and the settings behind
 * all of them — then the lists those documents draw from.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("HAA")
    .items([
      S.listItem()
        .title("Home page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem()
        .title("About page")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.listItem()
        .title("Curriculum page")
        .id("curriculumPage")
        .child(
          S.document().schemaType("curriculumPage").documentId("curriculumPage"),
        ),
      S.listItem()
        .title("Courses page")
        .id("coursesPage")
        .child(
          S.document().schemaType("coursesPage").documentId("coursesPage"),
        ),
      S.listItem()
        .title("Navigation")
        .id("navigation")
        .child(S.document().schemaType("navigation").documentId("navigation")),
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.divider(),
      S.documentTypeListItem("person").title("People"),
      S.documentTypeListItem("course").title("Courses"),
      S.documentTypeListItem("partner").title("Partners"),
      S.documentTypeListItem("applicant").title("Applicants"),
    ]);
