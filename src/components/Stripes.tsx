export default function Stripes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -top-1/2 -bottom-1/2 right-[10%] w-[16vw] -rotate-[15deg] bg-brand" />
      <div className="absolute -top-1/2 -bottom-1/2 right-[-7%] w-[3.5vw] -rotate-[15deg] bg-brand" />
    </div>
  );
}
