"use client";

import { useEffect, useRef } from "react";
import type { Applicant } from "@/content/types";

/**
 * The full interview, with audio. Only ever mounted after a click, so the
 * homepage pays nothing for it until someone asks — and it plays the same mp4
 * static rendition the hero does, so there is no player library in the bundle.
 *
 * Rendered as a plain overlay rather than `<dialog>`: the close-on-Escape and
 * backdrop-click behaviour is the same, and this way the scrim can be animated
 * without fighting the top layer.
 */
export default function ApplicantModal({
  applicant,
  onClose,
}: {
  applicant: Applicant;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // The close button, not the video: autofocusing the video would make the
    // spacebar scrub instead of scrolling once the modal is dismissed.
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // The page behind must not scroll under the video.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  if (!applicant.video) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${applicant.name} — interview`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-10 backdrop-blur-sm"
    >
      <div
        // The scrim closes; the panel must not, or every click on the controls
        // would dismiss the video.
        onClick={(event) => event.stopPropagation()}
        className="relative w-[min(1100px,100%)]"
      >
        <video
          src={applicant.video.src}
          poster={applicant.video.poster}
          controls
          autoPlay
          playsInline
          className="max-h-[80vh] w-full rounded-xl bg-black object-contain"
        />

        <div className="mt-4 flex items-start justify-between gap-6">
          <div>
            <p className="text-[15px] font-medium text-white">{applicant.name}</p>
            {applicant.pursuit && (
              <p className="mt-0.5 text-[13px] text-white/60">{applicant.pursuit}</p>
            )}
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="label shrink-0 cursor-pointer text-white/70 transition-opacity duration-300 ease-in-out hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
