import { defineLive } from "next-sanity/live";
import { client } from "./client";

// A viewer token, so the Presentation tool can read drafts. Published content
// streams without it.
const token = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  browserToken: token,
  serverToken: token,
});
