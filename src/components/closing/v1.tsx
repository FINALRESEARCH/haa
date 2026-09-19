"use client";

import { useEffect, useRef } from "react";
import type { Cta } from "@/content/types";
import type { VariantProps } from "@/variants/types";
import ArrowUpRight from "../ArrowUpRight";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/** An https:// destination leaves the site; anything else stays inside it. */
const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * The last screen: the question, the two lines that answer it, and the four
 * ways out. Nothing is pinned — after the Life screen's long hold the page
 * wants to be released, so this one simply scrolls up and each block fades in
 * as it clears the fold, the same reveal the program screen uses.
 */
export default function ClosingV1({ id, content }: VariantProps<"closing">) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = Array.from(
      sectionRef.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [],
    );
    if (!els.length) return;

    let frame = 0;
    const apply = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of els) {
        const { top } = el.getBoundingClientRect();
        el.style.opacity = `${clamp((vh * 0.92 - top) / (vh * 0.12))}`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="flex min-h-screen flex-col items-center justify-center gap-14 bg-background px-6 py-[16vh] text-center"
    >
      <h2
        data-reveal
        className="w-[min(1000px,90vw)] text-[clamp(2rem,5.4vw,5rem)] font-medium leading-[1.02] tracking-[-0.04em] opacity-0 will-change-[opacity]"
      >
        {content.heading}
      </h2>

      <div
        data-reveal
        className="w-[min(700px,88vw)] space-y-5 text-[clamp(0.95rem,1.35vw,1.2rem)] leading-[1.45] tracking-[-0.01em] opacity-0 will-change-[opacity]"
      >
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      <div
        data-reveal
        className="flex flex-col items-center gap-9 opacity-0 will-change-[opacity]"
      >
        <ApplyButton cta={content.apply} />

        <div className="flex flex-col items-center gap-x-10 gap-y-4 sm:flex-row">
          {content.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="label inline-flex items-center gap-2 text-brand transition-opacity duration-300 ease-in-out hover:opacity-60"
            >
              {link.label} <span aria-hidden>→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The one filled button on the page. The application form is a third-party
 * service, so an absolute URL opens in a new tab without needing a separate
 * "external" flag in the Studio.
 */
export function ApplyButton({
  cta,
  className = "",
}: {
  cta: Cta;
  className?: string;
}) {
  const external = isExternal(cta.href);
  return (
    <a
      href={cta.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`label label-button inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-4 text-white transition-opacity duration-300 ease-in-out hover:opacity-60 ${className}`}
    >
      {cta.label}
      <ArrowUpRight />
    </a>
  );
}
