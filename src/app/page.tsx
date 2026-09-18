import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Network from "@/components/Network";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top" className="relative flex flex-col">
        <Hero />
        <Network />
      </main>
    </>
  );
}
