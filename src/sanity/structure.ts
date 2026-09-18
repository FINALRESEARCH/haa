import type { StructureResolver } from "sanity/structure";

/**
 * Three singletons at the top — the page itself, its chrome, and the settings
 * behind both — then the two lists those documents draw from.
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
      S.documentTypeListItem("partner").title("Partners"),
      S.documentTypeListItem("applicant").title("Applicants"),
    ]);
