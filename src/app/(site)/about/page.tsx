import type { Metadata } from "next";
import { variants } from "@/components/about";
import VariantSwitcher from "@/components/VariantSwitcher";
import { getSiteContent } from "@/sanity/content";
import { variantsEnabled } from "@/variants/resolve";

/** Title from the menu, so the tab and the nav can't drift. */
export async function generateMetadata(): Promise<Metadata> {
  const { nav, about } = await getSiteContent();
  return {
    title: nav.find((panel) => panel.id === "about")?.label ?? "About",
    description: about.opening[0],
  };
}

/** Clamp a raw `?about=2` to a real variant index. */
function parseIndex(raw: string | string[] | undefined, fallback: number) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (!Number.isInteger(n)) return fallback;
  return n >= 1 && n <= variants.length ? n - 1 : fallback;
}

export default async function AboutPage({ searchParams }: PageProps<"/about">) {
  const { about } = await getSiteContent();
  const enabled = variantsEnabled();

  // The layout the Studio asked for, and the one the switcher measures its
  // picks against.
  const published = Math.max(
    variants.findIndex((variant) => variant.id === about.layout),
    0,
  );
  // Awaiting `searchParams` opts the route into dynamic rendering, which is
  // the cost of letting a layout be shared as a live URL.
  const index = enabled
    ? parseIndex((await searchParams).about, published)
    : published;

  const { Component } = variants[index];

  return (
    <>
      {/* Keyed on the variant so the reveal pass re-measures instead of
          inheriting the previous layout's opacities. */}
      <Component key={variants[index].id} content={about} />
      {enabled && (
        <VariantSwitcher
          basePath="/about"
          storageKey="haa:variants:about"
          selection={{ about: index }}
          defaults={{ about: published }}
          sections={[
            {
              key: "about",
              label: "About",
              anchorId: "top",
              variantLabels: variants.map((variant) => variant.label),
            },
          ]}
        />
      )}
    </>
  );
}
