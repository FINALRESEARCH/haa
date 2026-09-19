"use client";

import { useRef } from "react";
import { ApplyButton } from "@/components/closing/v1";
import type { AboutContent } from "@/content/types";
import { ArrowLink, chapterNumber, useReveal } from "./shared";

/**
 * The editorial manifesto. A long read rather than a screen-by-screen scroll,
 * so it breaks from the home page's pinned sections: one measured column for
 * the opening statement, then the chapters in a two-column split — number and
 * heading left, argument right — divided by the site's hairline.
 *
 * The opening sits close to the first chapter on purpose. The page is meant
 * to be read straight through, and a full screen of air under the statement
 * would read as an ending rather than a first breath.
 */
export default function AboutV1({ content }: { content: AboutContent }) {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <main
      ref={rootRef}
      id="top"
      className="relative flex min-h-screen flex-col bg-background px-6 pt-[200px] sm:px-10 sm:pt-[240px]"
    >
      <section className="mx-auto flex w-full max-w-[1200px] flex-col pb-[7vh] sm:pb-[9vh]">
        <p
          data-reveal
          className="label text-brand opacity-0 will-change-[opacity]"
        >
          {content.eyebrow}
        </p>

        <h1
          data-reveal
          className="mt-8 max-w-[16ch] text-[clamp(2.25rem,6.4vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.04em] opacity-0 will-change-[opacity]"
        >
          {content.heading}
        </h1>

        <div
          data-reveal
          className="mt-10 max-w-[54ch] space-y-6 text-[clamp(1.05rem,1.75vw,1.5rem)] leading-[1.35] tracking-[-0.015em] opacity-0 will-change-[opacity] sm:mt-12"
        >
          {content.opening.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1200px]">
        {content.chapters.map((chapter, index) => (
          <section
            key={chapter.heading.slice(0, 32)}
            data-reveal
            className="grid grid-cols-1 gap-x-[6%] gap-y-8 border-t border-rule py-[10vh] opacity-0 will-change-[opacity] lg:grid-cols-12 lg:py-[12vh]"
          >
            <div className="lg:col-span-5">
              <p className="label text-foreground/40">{chapterNumber(index)}</p>
              <h2 className="mt-6 max-w-[20ch] text-[clamp(1.6rem,3.1vw,2.9rem)] font-medium leading-[1.06] tracking-[-0.035em]">
                {chapter.heading}
              </h2>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <div className="max-w-[58ch] space-y-5 text-[clamp(0.98rem,1.25vw,1.15rem)] leading-[1.55] tracking-[-0.01em] text-foreground/80">
                {chapter.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>

              {chapter.links.length > 0 && (
                <div className="mt-10 flex flex-col gap-x-10 gap-y-4 sm:flex-row sm:flex-wrap">
                  {chapter.links.map((link) => (
                    <ArrowLink key={link.href} cta={link} />
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <section
        data-reveal
        className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-10 border-t border-rule py-[14vh] text-center opacity-0 will-change-[opacity]"
      >
        <ApplyButton cta={content.closing.apply} />

        <div className="flex flex-col items-center gap-x-10 gap-y-4 sm:flex-row sm:flex-wrap sm:justify-center">
          {content.closing.links.map((link) => (
            <ArrowLink key={link.href} cta={link} />
          ))}
        </div>
      </section>
    </main>
  );
}
