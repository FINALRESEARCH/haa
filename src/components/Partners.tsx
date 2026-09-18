import Image from "next/image";

const LOGOS = Array.from(
  { length: 6 },
  (_, i) => `/partners/p-${String(i + 1).padStart(2, "0")}.png`,
);

function Row({ direction }: { direction: "left" | "right" }) {
  // The list is rendered twice so the loop can wrap seamlessly.
  const marks = [...LOGOS, ...LOGOS];
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max items-center gap-[10vw] ${
          direction === "left" ? "marquee-left" : "marquee-right"
        }`}
      >
        {marks.map((src, i) => (
          <Image
            key={`${src}-${i}`}
            src={src}
            alt=""
            width={140}
            height={68}
            className="h-[clamp(26px,3.2vw,46px)] w-auto object-contain"
          />
        ))}
      </div>
    </div>
  );
}

/** Partner logos drifting in opposite directions around the headline. */
export default function Partners() {
  return (
    <section
      id="partners"
      className="relative flex flex-col justify-center gap-[12vh] overflow-hidden bg-background py-[16vh]"
    >
      <Row direction="left" />

      <h2 className="px-6 text-center text-[clamp(1.5rem,3.45vw,3.9rem)] leading-[1.05] font-medium tracking-[-0.035em]">
        Connected to the institutions shaping what comes next.
      </h2>

      <Row direction="right" />
    </section>
  );
}
