import ApplicantRow from "@/components/ApplicantRow";
import type { VariantProps } from "@/variants/types";

/**
 * The student section: one title, a short block of copy, and the applicant
 * row under it. This is the merge of what used to be two consecutive screens —
 * "never been good at waiting" and "meet the kind of people we're looking
 * for" — so the videos are the section's only visual; the workbench plate and
 * the second heading are both gone.
 *
 * Deliberately in normal page flow. The row animates in when it is scrolled to
 * and then drifts on its own clock, so there is nothing for a pinned screen to
 * buy: it would cost a second viewport of scroll and move no faster.
 */
export default function AdmissionsV1({ id, content }: VariantProps<"admissions">) {
  return (
    <section
      id={id}
      className="flex flex-col items-center gap-[9vh] overflow-hidden bg-background py-[16vh]"
    >
      <div className="w-[min(1000px,92vw)] px-6 text-center">
        <h2 className="text-[clamp(1.75rem,3.45vw,3.9rem)] leading-[1.05] font-medium tracking-[-0.035em]">
          {content.heading}
        </h2>
        <div className="mx-auto mt-6 max-w-[62ch] space-y-5 text-[clamp(0.95rem,1.2vw,1.15rem)] leading-[1.5] tracking-[-0.01em] text-foreground/75">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </div>

      <ApplicantRow applicants={content.applicants} />

      <a
        href={content.cta.href}
        className="label inline-flex items-center gap-2 text-brand transition-opacity duration-300 ease-in-out hover:opacity-60"
      >
        {content.cta.label} <span aria-hidden>→</span>
      </a>
    </section>
  );
}
