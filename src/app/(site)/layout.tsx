import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import DraftModeBanner from "@/components/DraftModeBanner";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Preloader from "@/components/Preloader";
import { getSiteContent } from "@/sanity/content";
import { SanityLive } from "@/sanity/live";

/**
 * Everything the marketing site needs and the Studio route does not: the
 * palette from Sanity, the live-content socket, and the editing overlays.
 */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { isEnabled: isDraft } = await draftMode();
  const { nav, settings } = await getSiteContent();
  const { theme } = settings;

  // Overrides the values `globals.css` declares, so `body` and every Tailwind
  // `*-brand`/`*-background` utility follow the Studio. The strings are
  // validated as colours in `src/sanity/content.ts` before they land here.
  const palette = [
    `--background:${theme.background}`,
    `--foreground:${theme.foreground}`,
    `--brand:${theme.brand}`,
    `--panel:${theme.panel}`,
    `--rule:${theme.rule}`,
  ].join(";");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root{${palette}}` }} />
      <Preloader />
      {/* Nav and footer wrap every page under `(site)`, so a new route only
          has to supply its own `main`. */}
      <Nav panels={nav} settings={settings} />
      <div className="flex min-h-full flex-col">{children}</div>
      <Footer />
      <SanityLive />
      {isDraft && (
        <>
          <VisualEditing />
          <DraftModeBanner />
        </>
      )}
    </>
  );
}
