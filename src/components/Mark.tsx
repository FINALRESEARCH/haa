export default function Mark({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 53 27"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}
