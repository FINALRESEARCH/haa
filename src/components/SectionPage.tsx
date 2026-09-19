import type { Metadata } from "next";
import { getSiteContent } from "@/sanity/content";

/**
 * The shell every menu section's page renders for now: nav and footer come
 * from `(site)/layout.tsx`, so all this adds is the heading and the space
 * under the fixed nav. Each route keeps its own file so they can grow apart
 * once the real content arrives.
 */
export default async function SectionPage({ id }: { id: string }) {
  const { nav } = await getSiteContent();
  const panel = nav.find((p) => p.id === id);

  return (
    <main id="top" className="relative flex min-h-screen flex-col px-6 pt-[140px] sm:px-10">
      <h1 className="max-w-[18ch] text-[40px] font-medium leading-[1.05] tracking-[-0.02em]">
        {panel?.label ?? ""}
      </h1>
    </main>
  );
}

/** Keeps each page's tab title in step with its label in the Studio. */
export async function sectionMetadata(id: string): Promise<Metadata> {
  const { nav } = await getSiteContent();
  return { title: nav.find((p) => p.id === id)?.label ?? undefined };
}
