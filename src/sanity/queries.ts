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
  "home": *[_type == "homePage"][0]{
    hero{ layout, headline, body, cta, video{ asset->{
      playbackId,
      "renditions": data.static_renditions.files[].name
    } } },
    network{ layout, heading, body, cta, portraits[]->${PERSON} },
    program{ heading, subheading, paragraphs, cta },
    admissions{ image, heading, paragraphs, cta },
    peopleWall{ layout, heading, paragraphs, tiles[]->${PERSON} },
    partners{ layout, eyebrow, heading, body, logos[]->{ name, logo, scale } },
    life{ layout, image, heading, paragraphs, cta },
    closing{ layout, heading, paragraphs, applyLabel, links }
  }
}`);
