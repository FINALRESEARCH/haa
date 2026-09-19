/**
 * The arrow that rides along in every apply button: a 45° shaft to the
 * top-right corner with a matching head. Drawn rather than typed — the mono
 * face has no ↗ glyph, and `currentColor` lets each button keep its own
 * hover colours without a second rule here.
 */
export default function ArrowUpRight({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      className={`h-[0.85em] w-[0.85em] ${className}`}
    >
      <path d="M2.5 9.5 9.5 2.5" />
      <path d="M4 2.5h5.5V8" />
    </svg>
  );
}
