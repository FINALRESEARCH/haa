import Image from "next/image";

const portraits = Array.from({ length: 10 }, (_, i) =>
  `/portraits/portrait-${String(i + 1).padStart(2, "0")}.jpg`,
);

export default function Network() {
  return (
    <section
      id="faculty"
      className="relative flex min-h-screen flex-col items-center justify-center gap-12 px-6 py-24"
    >
      <h2 className="w-[min(1100px,92vw)] text-center text-[clamp(2rem,4.2vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]">
        Learn from people shaping the world.
      </h2>

      <div className="grid w-[min(1290px,92vw)] grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {portraits.map((src) => (
          <div
            key={src}
            className="relative aspect-square overflow-hidden rounded-[10px]"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-7 text-center">
        <p className="max-w-[54ch] text-[clamp(1rem,1.3vw,1.25rem)] leading-[1.5]">
          A rotating community of founders, scientists, engineers, investors,
          artists, and operators teach at HAA, speak with students, offer
          mentorship, and open doors to Silicon Valley and the world.
        </p>
        <a
          href="#network"
          className="label inline-flex items-center gap-2 text-brand"
        >
          Explore the network <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
}
