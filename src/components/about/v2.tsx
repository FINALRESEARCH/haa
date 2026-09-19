"use client";

import { useRef } from "react";
import { ApplyButton } from "@/components/closing/v1";
import type { AboutContent } from "@/content/types";
import { ArrowLink, chapterNumber, useReveal } from "./shared";

/**
 * The centred manifesto. Same words, stacked down the middle of the page the
 * way the program and closing screens are, so /about sits closer to the home
 * page's voice than the editorial split does.
 *
 * The chapters are divided by a short centred rule rather than a full-bleed
 * hairline: a rule that runs the whole width would cut the column in half and
 * make each chapter read as a separate page.
 */
export default function AboutV2({ content }: { content: AboutContent }) {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <main
      ref={rootRef}
      id="top"
      className="relative flex min-h-screen flex-col items-center bg-background px-6 pt-[200px] text-center sm:px-10 sm:pt-[240px]"
    >
      <section className="flex w-full max-w-[1000px] flex-col items-center pb-[7vh] sm:pb-[9vh]">
        <p
          data-reveal
          className="label text-brand opacity-0 will-change-[opacity]"
        >
          {content.eyebrow}
        </p>

        <h1
          data-reveal
          className="mt-8 max-w-[15ch] text-[clamp(2.25rem,5.6vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.04em] opacity-0 will-change-[opacity]"
        >
          {content.heading}
        </h1>

        <div
          data-reveal
          className="mt-10 max-w-[52ch] space-y-6 text-[clamp(1.02rem,1.55vw,1.35rem)] leading-[1.4] tracking-[-0.015em] opacity-0 will-change-[opacity] sm:mt-12"
        >
          {content.opening.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </section>

      {content.chapters.map((chapter, index) => (
        <section
          key={chapter.heading.slice(0, 32)}
          data-reveal
          className="flex w-full max-w-[760px] flex-col items-center py-[9vh] opacity-0 will-change-[opacity] lg:py-[11vh]"
        >
          <span aria-hidden className="block h-px w-12 bg-foreground/15" />

          <p className="label mt-10 text-foreground/40">
            {chapterNumber(index)}
          </p>

          <h2 className="mt-5 max-w-[22ch] text-[clamp(1.55rem,3vw,2.7rem)] font-medium leading-[1.06] tracking-[-0.035em]">
            {chapter.heading}
          </h2>

          <div className="mt-8 max-w-[56ch] space-y-5 text-[clamp(0.98rem,1.25vw,1.15rem)] leading-[1.55] tracking-[-0.01em] text-foreground/80">
            {chapter.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          {chapter.links.length > 0 && (
            <div className="mt-10 flex flex-col items-center gap-x-10 gap-y-4 sm:flex-row sm:flex-wrap sm:justify-center">
              {chapter.links.map((link) => (
                <ArrowLink key={link.href} cta={link} />
              ))}
            </div>
          )}
        </section>
      ))}

      <section
        data-reveal
        className="flex w-full max-w-[760px] flex-col items-center gap-10 border-t border-rule py-[14vh] opacity-0 will-change-[opacity]"
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
