"use client";

import { useRef } from "react";
import { ArrowLink, useReveal } from "@/components/about/shared";
import { ApplyButton } from "@/components/closing/v1";
import type {
  Course,
  CurriculumContent,
  NetworkPerson,
  PartnerLogo,
} from "@/content/types";
import { Feature, type FeatureData } from "./features";

/**
 * "The HAA Experience". Set the way /about's document layout is — one measure
 * centred in the page, everything flush left, chapters divided by the site's
 * hairline — so the two long-read pages read as the same publication.
 *
 * The difference is that this page has to carry blocks as well as type: the
 * course grid, the week, the logo row. Those want more width than a column of
 * reading text does, so the section is the wide measure and the prose keeps
 * its own `max-w` inside it. Both start at the same left edge.
 *
 * The opening is a landing screen rather than the first paragraph of the
 * read — /network opens the same way — which is why its heading is the only
 * one on the page set above chapter size.
 */
export default function CurriculumV1({
  content,
  courses,
  speakers,
  mentors,
  partners,
}: {
  content: CurriculumContent;
  courses: Course[];
  speakers: NetworkPerson[];
  mentors: NetworkPerson[];
  partners: PartnerLogo[];
}) {
  const rootRef = useRef<HTMLElement>(null);
  useReveal(rootRef);

  const data: FeatureData = { content, courses, speakers, mentors, partners };

  return (
    <main
      ref={rootRef}
      id="top"
      className="relative flex min-h-screen flex-col items-center bg-background px-6 pt-[150px] sm:px-10 sm:pt-[20vh]"
    >
      {/* The opening holds the first screen on its own, the way /network's
          does: the top padding and this section's height come to about 80vh
          together, so the first chapter's rule sits just under the fold and
          reads as something to scroll to rather than the page starting twice.
          `svh` rather than `vh` — on a phone `vh` is the address bar's
          expanded height, which pushes the rule off the screen entirely. */}
      <section className="flex w-full max-w-[1100px] flex-col items-start justify-center pb-[10vh] sm:min-h-[60svh]">
        <p
          data-reveal
          className="label text-brand opacity-0 will-change-[opacity]"
        >
          {content.eyebrow}
        </p>

        {/* The one place on the page set larger than a chapter heading. Same
            scale as /network's title, so the two landing screens match. */}
        <h1
          data-reveal
          className="mt-8 max-w-[20ch] text-[clamp(2rem,4.4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.035em] opacity-0 will-change-[opacity]"
        >
          {content.heading}
        </h1>

        <div
          data-reveal
          className="mt-8 max-w-[56ch] space-y-5 text-[clamp(1.05rem,1.6vw,1.35rem)] leading-[1.45] tracking-[-0.02em] text-foreground/70 opacity-0 will-change-[opacity] sm:mt-10"
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
          className="flex w-full max-w-[1100px] flex-col items-start border-t border-rule py-[9vh] opacity-0 will-change-[opacity] lg:py-[11vh]"
        >
          <h2 className="max-w-[22ch] text-[clamp(1.55rem,3vw,2.7rem)] font-medium leading-[1.06] tracking-[-0.035em]">
            {chapter.heading}
          </h2>

          {chapter.lede && (
            <p className="mt-8 max-w-[46ch] text-[clamp(1.05rem,1.6vw,1.35rem)] leading-[1.4] tracking-[-0.02em]">
              {chapter.lede}
            </p>
          )}

          {chapter.paragraphs.length > 0 && (
            <div className="mt-6 max-w-[62ch] space-y-5 text-[clamp(0.98rem,1.25vw,1.1rem)] leading-[1.6] tracking-[-0.005em] text-foreground/80">
              {chapter.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          )}

          {chapter.points.length > 0 && (
            // Wider gaps than the paragraphs above get: each point is its own
            // small argument, and at paragraph spacing they run together into
            // one block of bolded lines.
            <div className="mt-14 flex w-full flex-col gap-12">
              {chapter.points.map((point) => (
                <div key={point.heading.slice(0, 32)}>
                  <h3 className="max-w-[34ch] text-[clamp(1.05rem,1.45vw,1.25rem)] font-medium leading-[1.3] tracking-[-0.02em]">
                    {point.heading}
                  </h3>

                  <div className="mt-4 max-w-[62ch] space-y-4 text-[clamp(0.98rem,1.25vw,1.1rem)] leading-[1.6] tracking-[-0.005em] text-foreground/80">
                    {point.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                  </div>

                  {point.features.map((name) => (
                    <div key={name} className="mt-10 w-full">
                      <Feature name={name} data={data} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {chapter.features.map((name) => (
            <div key={name} className="mt-14 w-full">
              <Feature name={name} data={data} />
            </div>
          ))}

          {chapter.links.length > 0 && (
            <div className="mt-12 flex flex-col items-start gap-x-10 gap-y-4 sm:flex-row sm:flex-wrap">
              {chapter.links.map((link) => (
                <ArrowLink key={link.href} cta={link} />
              ))}
            </div>
          )}
        </section>
      ))}

      <section
        data-reveal
        className="flex w-full max-w-[1100px] flex-col items-start gap-10 border-t border-rule py-[14vh] opacity-0 will-change-[opacity]"
      >
        <h2 className="max-w-[22ch] text-[clamp(1.55rem,3vw,2.7rem)] font-medium leading-[1.06] tracking-[-0.035em]">
          {content.closing.heading}
        </h2>

        <ApplyButton cta={content.closing.apply} />
      </section>
    </main>
  );
}
