"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Mark from "./Mark";
import { sections, type Section } from "./sections";

export default function Nav() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  // Phones start with the menu closed; the chevron is the only way in.
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  // The last panel stays mounted so it can collapse instead of vanishing.
  const [panel, setPanel] = useState<Section | null>(null);

  const show = useCallback((id: string | null) => {
    setOpenId(id);
    const next = sections.find((s) => s.id === id);
    if (next) setPanel(next);
  }, []);

  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (sections.some((s) => s.id === id)) show(id);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [show]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 1.4) {
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
        className="w-full max-w-[880px] overflow-hidden rounded-2xl border border-black/[0.04] bg-[#EAEAEA]/75 backdrop-blur-xl"
      >
        <div className="relative flex h-[52px] items-center justify-between px-3">
          <a
            href="#top"
            className="flex items-center gap-2.5"
            aria-label="HAA home"
          >
            <Image
              src="/full-logo.svg"
              alt="The Horowitz Andreessen Academy"
              width={110}
              height={27}
              priority
              className="h-[27px] w-auto sm:hidden"
            />
            <Mark className="hidden h-[22px] w-auto text-foreground sm:block" />
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

        {/* The chevron row shrinks as the menu grows, so the card only ever
            slides one way. */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            mobileOpen ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
          } ${collapsed ? "sm:grid-rows-[1fr]" : "sm:grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setCollapsed(false);
                setMobileOpen(true);
              }}
              aria-label="Open menu"
              aria-expanded={false}
              className="flex w-full items-center justify-center py-1.5 text-foreground/50 transition-colors hover:text-foreground"
            >
              <Chevron className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            mobileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          } ${collapsed ? "sm:grid-rows-[0fr]" : "sm:grid-rows-[1fr]"}`}
        >
          <div className="flex flex-col overflow-hidden px-3 text-[13px] sm:flex-row">
            {sections.map((section, i) => (
              <button
                key={section.id}
                type="button"
                onClick={() => show(openId === section.id ? null : section.id)}
                aria-expanded={openId === section.id}
                className={`relative flex-1 py-3.5 transition-colors sm:py-3 ${
                  i > 0
                    ? "before:absolute before:inset-x-2 before:top-0 before:h-px before:bg-rule before:content-[''] sm:before:inset-x-auto sm:before:inset-y-2 sm:before:left-0 sm:before:h-auto sm:before:w-px"
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
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                show(null);
              }}
              aria-label="Close menu"
              aria-expanded
              className="-mx-3 mt-1 flex items-center justify-center py-1.5 text-foreground/50 sm:hidden"
            >
              <Chevron className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-[350ms] ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <Rule />
            {panel && (
              <div
                className={`grid gap-8 p-7 transition-opacity duration-200 md:grid-cols-[1fr_minmax(0,360px)] ${
                  open ? "opacity-100 delay-[250ms]" : "opacity-0"
                }`}
              >
                <div>
                  <h2 className="max-w-[22ch] text-[28px] font-medium leading-[1.08] tracking-[-0.02em]">
                    {panel.heading}
                  </h2>
                  <div className="mt-5 space-y-4 pl-1 text-[14px] leading-[1.55] text-foreground/85">
                    {panel.body.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </div>
                  <a
                    href={`#${panel.id}`}
                    className="label mt-6 inline-flex items-center gap-2 pl-1 text-brand"
                  >
                    Read more <span aria-hidden>→</span>
                  </a>
                </div>
                <div className="min-h-[220px] rounded-md bg-[linear-gradient(135deg,#dcd9d4,#c9c5bf)]" />
              </div>
            )}
          </div>
        </div>
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
