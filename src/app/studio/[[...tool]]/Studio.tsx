"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

/**
 * The Studio has to be pulled in behind a client boundary: `sanity` resolves
 * some of its dependencies to `react-server` builds when it lands in the RSC
 * graph, and those builds are missing the exports it reaches for.
 */
export default function Studio() {
  return <NextStudio config={config} />;
}
