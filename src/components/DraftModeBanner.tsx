"use client";

import { useIsPresentationTool } from "next-sanity/hooks";

/**
 * A way out of a preview session opened straight from the Studio. Inside the
 * Presentation tool the toolbar already owns that, so this stays out of it.
 */
export default function DraftModeBanner() {
  const isPresentation = useIsPresentationTool();
  if (isPresentation !== false) return null;

  return (
    <a
      href="/api/draft-mode/disable"
      className="label fixed bottom-4 left-4 z-50 rounded-lg bg-foreground px-4 py-2.5 text-background"
    >
      Previewing drafts — exit
    </a>
  );
}
