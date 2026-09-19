"use client";

import { useRef } from "react";
import { ApplyButton } from "@/components/closing/v1";
import type { AboutContent } from "@/content/types";
import { ArrowLink, useReveal } from "./shared";

/**
 * The centred manifesto set flush left. Same stack as `v2` — one column down
 * the middle of the page — but every line hangs off one left edge instead of
 * being ragged on both sides, which reads as a document rather than a poster.
 *
 * The chapters are divided by `v1`'s hairline across the full measure rather
 * than `v2`'s short centred rule: a rule floating in the middle of a column
 * that is otherwise flush left is the one mark that would break the edge.
 *
 * `items-center` on the page keeps the column centred; `items-start` inside
 * each section is what turns the setting left. The two are doing different
 * jobs, so neither one can be dropped.
 */
export default function AboutV3({ content }: { content: AboutContent }) {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  return (
    <main
      ref={rootRef}
      id="top"
      className="relative flex min-h-screen flex-col items-center bg-background px-6 pt-[200px] sm:px-10 sm:pt-[240px]"
    >
      <section className="flex w-full max-w-[760px] flex-col items-start pb-[7vh] sm:pb-[9vh]">
        <p
          data-reveal
          className="label text-brand opacity-0 will-change-[opacity]"
        >
          {content.eyebrow}
        </p>

        <h1
          data-reveal
          className="mt-8 max-w-[22ch] text-[clamp(1.55rem,3vw,2.7rem)] font-medium leading-[1.06] tracking-[-0.035em] opacity-0 will-change-[opacity]"
        >
          {content.heading}
        </h1>

        <div
          data-reveal
          className="mt-8 max-w-[56ch] space-y-5 text-[clamp(0.98rem,1.25vw,1.15rem)] leading-[1.55] tracking-[-0.01em] text-foreground/80 opacity-0 will-change-[opacity] sm:mt-10"
        >
          {content.opening.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </section>

      {content.chapters.map((chapter) => (
        <section
          key={chapter.heading.slice(0, 32)}
          data-reveal
          className="flex w-full max-w-[760px] flex-col items-start border-t border-rule py-[9vh] opacity-0 will-change-[opacity] lg:py-[11vh]"
        >
          <h2 className="max-w-[22ch] text-[clamp(1.55rem,3vw,2.7rem)] font-medium leading-[1.06] tracking-[-0.035em]">
            {chapter.heading}
          </h2>

          <div className="mt-8 max-w-[56ch] space-y-5 text-[clamp(0.98rem,1.25vw,1.15rem)] leading-[1.55] tracking-[-0.01em] text-foreground/80">
            {chapter.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          {chapter.links.length > 0 && (
            <div className="mt-10 flex flex-col items-start gap-x-10 gap-y-4 sm:flex-row sm:flex-wrap">
              {chapter.links.map((link) => (
                <ArrowLink key={link.href} cta={link} />
              ))}
            </div>
          )}
        </section>
      ))}

      <section
        data-reveal
        className="flex w-full max-w-[760px] flex-col items-start gap-10 border-t border-rule py-[14vh] opacity-0 will-change-[opacity]"
      >
        <ApplyButton cta={content.closing.apply} />

        <div className="flex flex-col items-start gap-x-10 gap-y-4 sm:flex-row sm:flex-wrap">
          {content.closing.links.map((link) => (
            <ArrowLink key={link.href} cta={link} />
          ))}
        </div>
      </section>
    </main>
  );
}
