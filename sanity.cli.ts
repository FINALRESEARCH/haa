import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./src/sanity/env";

/**
 * Only used by the `sanity` CLI (datasets, tokens, CORS). The Studio itself is
 * served by Next at /studio, so there is no `sanity dev` or `sanity deploy`.
 */
export default defineCliConfig({
  api: { projectId, dataset },
});
