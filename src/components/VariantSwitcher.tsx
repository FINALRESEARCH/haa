"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { STORAGE_KEY, selectionToParams } from "@/variants/state";
import type { Selection } from "@/variants/types";

export type SwitcherSection = {
  key: string;
  label: string;
  anchorId: string;
  variantLabels: string[];
};

type Props = {
  sections: SwitcherSection[];
  selection: Selection;
  /** What Sanity publishes. Picks matching these stay out of the URL. */
  defaults: Selection;
};

export default function VariantSwitcher({
  sections,
  selection,
  defaults,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pendingScroll = useRef<string | null>(null);

  // A bare URL falls back to the last combo picked on this machine.
  useEffect(() => {
    if (window.location.search) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const params = selectionToParams(
        JSON.parse(saved) as Selection,
        defaults,
      );
      if (params.toString()) router.replace(`/?${params}`, { scroll: false });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [router, defaults]);

  // Scroll to the section only once its new variant has actually mounted.
  useEffect(() => {
    const target = pendingScroll.current;
    if (!target) return;
    pendingScroll.current = null;
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  }, [selection]);

  const choose = (section: SwitcherSection, index: number) => {
    if (selection[section.key] === index) return;
    const next = { ...selection, [section.key]: index };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    pendingScroll.current = section.anchorId;
    const params = selectionToParams(next, defaults);
    router.replace(params.toString() ? `/?${params}` : "/", { scroll: false });
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    router.replace("/", { scroll: false });
  };

  const active = sections.filter(
    (s) => (selection[s.key] ?? 0) !== (defaults[s.key] ?? 0),
  ).length;

  return (
    <div className="fixed right-4 bottom-4 z-50 font-mono text-[11px] text-white">
      {open && (
        <div className="mb-2 w-[232px] rounded-xl bg-neutral-900/95 p-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between pb-2 text-white/40">
            <span className="tracking-[0.08em] uppercase">Variants</span>
            <button
              type="button"
              onClick={reset}
              className="tracking-[0.08em] uppercase transition-colors hover:text-white"
            >
              Reset
            </button>
          </div>
          {sections.map((section) => (
            <div
              key={section.key}
              className="flex items-center justify-between gap-3 border-t border-white/10 py-1.5"
            >
              <span className="truncate text-white/80">{section.label}</span>
              <div className="flex shrink-0 gap-1">
                {section.variantLabels.map((label, index) => (
                  <button
                    key={label + index}
                    type="button"
                    title={label}
                    aria-pressed={(selection[section.key] ?? 0) === index}
                    onClick={() => choose(section, index)}
                    className={`h-6 w-6 rounded-md transition-colors ${
                      (selection[section.key] ?? 0) === index
                        ? "bg-white text-neutral-900"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-auto flex h-9 items-center gap-2 rounded-full bg-neutral-900/95 px-4 tracking-[0.08em] uppercase shadow-xl transition-colors hover:bg-neutral-800"
      >
        Variants
        {active > 0 && (
          <span className="rounded-full bg-white px-1.5 text-neutral-900">
            {active}
          </span>
        )}
      </button>
    </div>
  );
}
