"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Mark from "./Mark";
import { sections } from "./sections";

export default function Nav() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (sections.some((s) => s.id === id)) setOpenId(id);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 64) {
        setCollapsed(true);
        setOpenId(null);
      } else {
        setCollapsed(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openId]);

  const open = sections.find((s) => s.id === openId) ?? null;

  return (
    <header className="fixed inset-x-0 top-4 z-30 flex justify-center px-4">
      <nav
        ref={navRef}
        className="w-full max-w-[880px] overflow-hidden rounded-2xl border border-black/[0.04] bg-[#EAEAEA]/75 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_40px_-24px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        <div className="relative flex h-[52px] items-center justify-between px-3">
          <a href="#top" className="flex items-center" aria-label="HAA home">
            <Mark className="h-[22px] w-auto text-foreground" />
          </a>
          <Image
            src="/wordmark.svg"
            alt="The Horowitz Andreessen Academy"
            width={274}
            height={16}
            priority
            className="pointer-events-none absolute left-1/2 hidden h-4 w-auto -translate-x-1/2 sm:block"
          />
          <a
            href="#apply"
            className="label rounded-lg border border-[#F2E7E5] bg-[#FFF4F2] px-3.5 py-2 text-brand transition-colors hover:bg-white"
          >
            Apply Now
          </a>
        </div>

        <Rule />

        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand menu"
            aria-expanded={false}
            className="flex w-full items-center justify-center py-1.5 text-foreground/50 transition-colors hover:text-foreground"
          >
            <Chevron className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="flex px-3 text-[13px]">
            {sections.map((section, i) => (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setOpenId((cur) => (cur === section.id ? null : section.id))
                }
                aria-expanded={openId === section.id}
                className={`relative flex-1 py-3 transition-colors ${
                  i > 0
                    ? "before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-rule before:content-['']"
                    : ""
                } ${
                  openId === section.id
                    ? "rounded-lg bg-black/[0.06]"
                    : "rounded-lg hover:bg-black/[0.03]"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        )}

        {open && (
          <>
            <Rule />
            <div className="grid gap-8 p-7 md:grid-cols-[1fr_minmax(0,360px)]">
              <div>
                <h2 className="max-w-[22ch] text-[28px] font-medium leading-[1.08] tracking-[-0.02em]">
                  {open.heading}
                </h2>
                <div className="mt-5 space-y-4 pl-1 text-[14px] leading-[1.55] text-foreground/85">
                  {open.body.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
                <a
                  href={`#${open.id}`}
                  className="label mt-6 inline-flex items-center gap-2 pl-1 text-brand"
                >
                  Read more <span aria-hidden>→</span>
                </a>
              </div>
              <div className="min-h-[220px] rounded-md bg-[linear-gradient(135deg,#dcd9d4,#c9c5bf)]" />
            </div>
          </>
        )}
      </nav>
    </header>
  );
}

function Rule() {
  return <div aria-hidden className="mx-3 h-px bg-rule" />;
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
