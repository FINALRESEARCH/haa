import Nav from "@/components/Nav";
import VariantSwitcher from "@/components/VariantSwitcher";
import { getSiteContent } from "@/sanity/content";
import { SECTIONS } from "@/variants/registry";
import {
  defaultSelection,
  selectionFromParams,
  variantsEnabled,
} from "@/variants/resolve";

export default async function Home({ searchParams }: PageProps<"/">) {
  const content = await getSiteContent();
  const enabled = variantsEnabled();
  const defaults = defaultSelection(content);
  // Awaiting `searchParams` opts the route into dynamic rendering, which is
  // the cost of letting a variant combination be shared as a live URL.
  const selection = enabled
    ? selectionFromParams(await searchParams, content)
    : defaults;

  return (
    <>
      <Nav panels={content.nav} settings={content.settings} />
      <main id="top" className="relative flex flex-col">
        {SECTIONS.map((section) =>
          section.render(selection[section.key] ?? 0, content),
        )}
      </main>
      {enabled && (
        <VariantSwitcher
          selection={selection}
          defaults={defaults}
          sections={SECTIONS.map((s) => ({
            key: s.key,
            label: s.label,
            anchorId: s.anchorId,
            variantLabels: s.variantLabels,
          }))}
        />
      )}
    </>
  );
}
