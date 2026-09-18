import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/client";

/** The Presentation tool calls this to start a preview session. */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
