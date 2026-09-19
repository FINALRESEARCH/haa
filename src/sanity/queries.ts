import { defineQuery } from "next-sanity";

/** The hover clip is a static rendition, same as the hero's — see `muxVideo`. */
const PERSON = `{
  name,
  affiliation,
  portrait,
  video{ asset->{ playbackId, "renditions": data.static_renditions.files[].name } }
}`;

/**
 * The whole site in one round trip. The page is a single route, so splitting
 * this up would only cost more requests.
 */
export const SITE_CONTENT_QUERY = defineQuery(`{
  "settings": *[_type == "siteSettings"][0]{
    title,
    description,
    applyCta,
    fullLogo,
    wordmark,
    markPath,
    favicon,
    ogImage,
    background,
    foreground,
    brand,
    panel,
    rule
  },
  "nav": *[_type == "navigation"][0].items[]{
    label,
    anchor,
    heading,
    body,
    readMoreLabel
  },
  "applicants": *[_type == "applicant"] | order(name asc){
    name,
    pursuit,
    "slug": slug.current,
    video{ asset->{ playbackId, "renditions": data.static_renditions.files[].name } }
  },
  "home": *[_type == "homePage"][0]{
    hero{ layout, headline, body, cta, video{ asset->{
      playbackId,
      "renditions": data.static_renditions.files[].name
    } } },
    network{ layout, heading, body, cta, portraits[]->${PERSON} },
    program{ heading, subheading, paragraphs, cta, gridLabel, gridSummary, dayTitle, weekdayBody, weekendBody },
    admissions{ heading, paragraphs, cta },
    partners{ layout, eyebrow, heading, body, logos[]->{ name, logo, scale } },
    life{ layout, image, heading, paragraphs, cta },
    closing{ layout, heading, paragraphs, applyLabel, links }
  },
  "about": *[_type == "aboutPage"][0]{
    layout,
    eyebrow,
    heading,
    opening,
    chapters[]{ heading, paragraphs, links },
    applyLabel,
    links
  },
  "curriculum": *[_type == "curriculumPage"][0]{
    eyebrow,
    heading,
    opening,
    chapters[]{
      heading,
      lede,
      paragraphs,
      points[]{ heading, paragraphs, features },
      features,
      links
    },
    pursuits,
    week[]{ day, entries[]{ label, span } },
    closingHeading,
    applyLabel
  },
  "courses": *[_type == "coursesPage"][0]{ eyebrow, heading, intro }
}`);

/**
 * Everyone in the dataset, for the /network directory. Separate from
 * `SITE_CONTENT_QUERY` on purpose: the homepage renders a hand-picked ten,
 * this page renders the lot, and only this route pays for it.
 *
 * Unnamed documents are left out. They can hold a place in the homepage grid
 * uncaptioned, but a directory row with no name is unreadable and unfilterable.
 * A missing portrait is not a reason to drop anyone: the source Airtable base
 * has no photo column, so most of the directory has none and draws a monogram.
 *
 * `relationship` is the old single-valued field, still selected so documents
 * written before the column went multi-select keep filtering; `src/sanity/network.ts`
 * folds the two together.
 */
export const NETWORK_PEOPLE_QUERY = defineQuery(`
  *[_type == "person" && defined(name) && name != ""]
  | order(name asc){
    "id": _id,
    name,
    affiliation,
    portrait,
    relationships,
    relationship,
    fields,
    profileUrl
  }
`);

/**
 * The catalogue, for /courses and for /curriculum's featured grid. Separate
 * from `SITE_CONTENT_QUERY` for the same reason the directory's people are:
 * only the two routes that actually render courses should pay for them.
 *
 * Ordered by title so the directory has a stable resting order; the page
 * re-sorts nothing, so what an editor sees in the Studio list is the order
 * the rows arrive in.
 */
export const COURSES_QUERY = defineQuery(`
  *[_type == "course" && defined(title) && title != ""]
  | order(title asc){
    "id": _id,
    title,
    type,
    description,
    people,
    affiliation,
    featured
  }
`);
