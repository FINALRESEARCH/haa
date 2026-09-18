import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * A CDN URL for a Sanity image, capped so `next/image` never has to pull the
 * full-resolution original. SVGs are handed back untouched: the transform API
 * rasterises them, which would throw away the crispness of the partner marks.
 */
export function imageUrl(
  source: SanityImageSource | undefined,
  width: number,
): string | undefined {
  if (!source) return undefined;
  const url = builder.image(source).url();
  if (!url || url.endsWith(".svg")) return url ?? undefined;
  return builder.image(source).width(width).auto("format").fit("max").url();
}
