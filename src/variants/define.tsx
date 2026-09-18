import type { SectionKey } from "@/content/types";
import type { SectionDef, Variant } from "./types";

/**
 * Binds a section's key to its variants so the registry can stay a flat list.
 * `render` reads `content.sections[key]`, which TypeScript narrows to exactly
 * the shape this section's components accept.
 */
export function defineSection<K extends SectionKey>(def: {
  key: K;
  label: string;
  anchorId: string;
  variants: Variant<K>[];
}): SectionDef {
  return {
    key: def.key,
    label: def.label,
    anchorId: def.anchorId,
    variantIds: def.variants.map((variant) => variant.id),
    variantLabels: def.variants.map((variant) => variant.label),
    render: (index, content) => {
      const variant = def.variants[index] ?? def.variants[0];
      const { Component } = variant;
      // Keying on the variant forces a remount, so scroll-driven sections
      // re-measure instead of inheriting the previous layout's state.
      return (
        <Component
          key={`${def.key}:${variant.id}`}
          id={def.anchorId}
          content={content.sections[def.key]}
        />
      );
    },
  };
}
