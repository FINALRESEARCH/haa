import Nav from "@/components/Nav";
import Stripes from "@/components/Stripes";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top" className="relative flex min-h-screen flex-col">
        <Stripes />
        <section className="relative flex flex-1 items-center justify-center px-6 pt-40 pb-16">
          <h1 className="w-[min(1200px,92vw)] text-center text-[clamp(2.5rem,4.9vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.035em]">
            A two-year residential academy for unusually ambitious young people.
          </h1>
        </section>
        <section
          id="apply"
          className="relative flex flex-col items-center gap-6 px-6 pb-16 text-center"
        >
          <p className="max-w-[62ch] text-[14px] leading-[1.6] text-foreground/80">
            For students who would rather spend their time making,
            investigating, experimenting, and pursuing difficult questions than
            preparing for a life that starts later.
          </p>
          <a
            href="#apply"
            className="label rounded-lg border border-brand/15 bg-white px-8 py-3.5 text-brand transition-colors hover:bg-brand hover:text-white"
          >
            Apply to HAA
          </a>
        </section>
      </main>
    </>
  );
}
