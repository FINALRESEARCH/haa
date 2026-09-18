"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavPanel, SiteSettings } from "@/content/types";
import Mark from "./Mark";

// Desktop hover tunables. Dwell only gates the *first* panel — once one is
// open, moving along the row swaps instantly.
const PANEL_DWELL_MS = 150;
const LEAVE_GRACE_MS = 100;

type Props = {
  panels: NavPanel[];
  settings: SiteSettings;
};

export default function Nav({ panels, settings }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  // A clicked section is pinned: it survives pointer-leave until it is
  // clicked again, dismissed, or scrolled away.
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  // Hovering the collapsed card's bottom strip overrides the scroll state.
  const [hoverExpanded, setHoverExpanded] = useState(false);
  // Phones start with the menu closed; the chevron is the only way in.
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const dwellTimer = useRef<number | null>(null);
  const leaveTimer = useRef<number | null>(null);
  // The last panel stays mounted so it can collapse instead of vanishing.
  const [panel, setPanel] = useState<NavPanel | null>(null);

  const show = useCallback((id: string | null) => {
    setOpenId(id);
    const next = panels.find((p) => p.id === id);
    if (next) setPanel(next);
  }, [panels]);

  const clearDwell = useCallback(() => {
    if (dwellTimer.current !== null) {
      window.clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
  }, []);

  const clearLeave = useCallback(() => {
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearDwell();
    setPinnedId(null);
    setOpenId(null);
    setHoverExpanded(false);
  }, [clearDwell]);

  useEffect(() => () => {
    clearDwell();
    clearLeave();
  }, [clearDwell, clearLeave]);

  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (panels.some((p) => p.id === id)) show(id);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [panels, show]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 1.4) {
        setCollapsed(true);
        dismiss();
      } else {
        setCollapsed(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismiss]);

  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) dismiss();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openId, dismiss]);

  // Touch has no hover, so every handler below is a no-op unless a real
  // mouse drove the event. Tapping keeps the click-to-toggle behaviour.
  const isMouse = (e: React.PointerEvent) => e.pointerType === "mouse";

  const hoverSection = (e: React.PointerEvent, id: string) => {
    if (!isMouse(e)) return;
    clearDwell();
    if (openId) {
      show(id);
      return;
    }
    dwellTimer.current = window.setTimeout(() => show(id), PANEL_DWELL_MS);
  };

  const onNavEnter = (e: React.PointerEvent) => {
    if (!isMouse(e)) return;
    clearLeave();
  };

  const onNavLeave = (e: React.PointerEvent) => {
    if (!isMouse(e)) return;
    clearDwell();
    // A pinned panel is the user's explicit choice — leaving doesn't undo it.
    if (pinnedId) return;
    clearLeave();
    leaveTimer.current = window.setTimeout(() => {
      setOpenId(null);
      setHoverExpanded(false);
    }, LEAVE_GRACE_MS);
  };

  const togglePin = (id: string) => {
    clearDwell();
    if (pinnedId === id) {
      setPinnedId(null);
      show(null);
      return;
    }
    setPinnedId(id);
    show(id);
  };

  const open = panels.find((p) => p.id === openId) ?? null;
  // Hover and pinning both hold the card open against the scroll state.
  const barCollapsed = collapsed && !hoverExpanded && !pinnedId;

  return (
    <header className="fixed inset-x-0 top-4 z-30 flex justify-center px-4">
      <nav
        ref={navRef}
        onPointerEnter={onNavEnter}
        onPointerLeave={onNavLeave}
        className="relative w-full max-w-[880px] overflow-hidden rounded-2xl border border-black/[0.04] bg-[#EAEAEA]/75 backdrop-blur-xl"
      >
        <div className="relative flex h-[52px] items-center justify-between px-3">
          <a
            href="#top"
            className="flex items-center gap-2.5"
            aria-label="HAA home"
          >
            <Image
              src={settings.fullLogo}
              alt={settings.title}
              width={110}
              height={27}
              priority
              className="h-[27px] w-auto sm:hidden"
            />
            <Mark
              path={settings.markPath}
              className="hidden h-[22px] w-auto text-foreground sm:block"
            />
          </a>
          <Image
            src={settings.wordmark}
            alt={settings.title}
            width={274}
            height={16}
            priority
            className="pointer-events-none absolute left-1/2 hidden h-4 w-auto -translate-x-1/2 sm:block"
          />
          <a
            href={settings.applyCta.href}
            className="label rounded-lg border border-[#F2E7E5] bg-[#FFF4F2] px-3.5 py-2 text-brand transition-colors hover:bg-white"
          >
            {settings.applyCta.label}
          </a>
        </div>

        <Rule />

        {/* The whole bottom strip of the collapsed card opens the menu, not
            just the chevron. It sits inside the card's bounds so the
            re-collapse can never drag it back under a resting cursor. */}
        {barCollapsed && (
          <div
            aria-hidden
            onPointerEnter={(e) => {
              if (isMouse(e)) setHoverExpanded(true);
            }}
            className="absolute inset-x-0 bottom-0 z-10 hidden h-[34px] sm:block"
          />
        )}

        {/* The chevron row shrinks as the menu grows, so the card only ever
            slides one way. */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            mobileOpen ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
          } ${barCollapsed ? "sm:grid-rows-[1fr]" : "sm:grid-rows-[0fr]"}`}
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
          } ${barCollapsed ? "sm:grid-rows-[0fr]" : "sm:grid-rows-[1fr]"}`}
        >
          <div className="flex flex-col overflow-hidden px-3 text-[13px] sm:flex-row">
            {panels.map((section, i) => (
              <button
                key={section.id}
                type="button"
                onClick={() => togglePin(section.id)}
                onPointerEnter={(e) => hoverSection(e, section.id)}
                onPointerLeave={(e) => {
                  if (isMouse(e)) clearDwell();
                }}
                onFocus={() => show(section.id)}
                aria-expanded={openId === section.id}
                className={`relative flex-1 py-3.5 transition-colors sm:py-3 ${
                  i > 0
                    ? "before:absolute before:inset-x-2 before:top-0 before:h-px before:bg-rule before:content-[''] sm:before:inset-x-auto sm:before:inset-y-2 sm:before:left-0 sm:before:h-auto sm:before:w-px"
                    : ""
                } ${
                  openId === section.id
                    ? "bg-black/[0.06]"
                    : "hover:bg-black/[0.03]"
                }`}
              >
                {section.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                dismiss();
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
                    {panel.readMoreLabel} <span aria-hidden>→</span>
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
