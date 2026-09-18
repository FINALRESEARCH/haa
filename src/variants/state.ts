import type { Selection } from "./types";

export const STORAGE_KEY = "haa:variants";

/**
 * Client-safe on purpose: this module must not import the registry, or every
 * variant would be pulled into the browser bundle by the switcher.
 */
export function selectionToParams(
  selection: Selection,
  defaults: Selection,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, index] of Object.entries(selection)) {
    // Params are 1-based so the URL reads the way the switcher looks.
    // Only picks that differ from what Sanity publishes go in, so the URL
    // stays readable and an untouched page keeps a bare `/`.
    if (index !== (defaults[key] ?? 0)) params.set(key, String(index + 1));
  }
  return params;
}
