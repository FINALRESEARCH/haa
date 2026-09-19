"use client";

import Link from "next/link";
import { useEffect, type RefObject } from "react";
import type { Cta } from "@/content/types";

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

/** An https:// destination leaves the site; anything else stays inside it. */
const isExternal = (href: string) => /^https?:\/\//.test(href);

/** The mono arrow links, used under a chapter and again at the foot. */
export function ArrowLink({ cta }: { cta: Cta }) {
  const className =
    "label inline-flex items-center gap-2 text-brand transition-opacity duration-300 ease-in-out hover:opacity-60";
  if (isExternal(cta.href)) {
    return (
      <a
        href={cta.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {cta.label} <span aria-hidden>→</span>
      </a>
    );
  }
  return (
    <Link href={cta.href} className={className}>
      {cta.label} <span aria-hidden>→</span>
    </Link>
  );
}

/**
 * Fades every `[data-reveal]` inside `ref` up as it clears the fold — the same
 * pass the program and closing screens run, so /about reads as part of the
 * same site. Under reduced motion everything is simply shown.
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const els = Array.from(
      ref.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [],
    );
    if (!els.length) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    const apply = () => {
      frame = 0;
      if (still.matches) {
        for (const el of els) el.style.opacity = "1";
        return;
      }
      const vh = window.innerHeight;
      for (const el of els) {
        const { top } = el.getBoundingClientRect();
        el.style.opacity = `${clamp((vh * 0.94 - top) / (vh * 0.12))}`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    still.addEventListener("change", apply);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      still.removeEventListener("change", apply);
    };
  }, [ref]);
}

/** 01, 02, … — the count is the page's, not the editor's. */
export const chapterNumber = (index: number) =>
  String(index + 1).padStart(2, "0");
