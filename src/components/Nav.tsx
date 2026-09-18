"use client";

import { useEffect, useState } from "react";
import Mark from "./Mark";
import { sections } from "./sections";

export default function Nav() {
  const [openId, setOpenId] = useState<string | null>("curriculum");
  const [collapsed, setCollapsed] = useState(false);

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

  const open = sections.find((s) => s.id === openId) ?? null;

  return (
    <header className="fixed inset-x-0 top-4 z-30 flex justify-center px-4">
      <nav className="w-full max-w-[880px] overflow-hidden rounded-2xl bg-panel/80 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_40px_-24px_rgba(0,0,0,0.35)]">
        <div className="relative flex h-[52px] items-center justify-between px-5">
          <a href="#top" className="flex items-center" aria-label="HAA home">
            <Mark className="h-[22px] w-auto text-foreground" />
          </a>
          <span className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 text-[15px] tracking-[-0.01em] sm:block">
            The Horowitz Andreessen Academy
          </span>
          <a
            href="#apply"
            className="label rounded-full bg-white px-3.5 py-2 text-brand transition-colors hover:bg-white/70"
          >
            Apply Now
          </a>
        </div>

        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand menu"
            aria-expanded={false}
            className="flex w-full items-center justify-center border-t border-rule py-1.5 text-foreground/50 transition-colors hover:text-foreground"
          >
            <Chevron className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="flex border-t border-rule text-[13px]">
            {sections.map((section, i) => (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setOpenId((cur) => (cur === section.id ? null : section.id))
                }
                aria-expanded={openId === section.id}
                className={`flex-1 py-3 transition-colors ${
                  i > 0 ? "border-l border-rule" : ""
                } ${
                  openId === section.id
                    ? "bg-black/[0.06]"
                    : "hover:bg-black/[0.03]"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        )}

        {open && (
          <div className="grid gap-8 border-t border-rule p-7 md:grid-cols-[1fr_minmax(0,360px)]">
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
        )}
      </nav>
    </header>
  );
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
