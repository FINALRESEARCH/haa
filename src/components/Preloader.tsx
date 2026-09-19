/**
 * The white card that sits over the site while the hero's assets arrive.
 *
 * Deliberately server-rendered and driven entirely by CSS (`.preloader-*` in
 * `globals.css`): it is in the first byte of HTML, so the page is white from
 * the very first paint rather than flashing the site's off-white `--background`
 * while React hydrates, and the timeline runs whether or not the JS ever
 * lands. The final keyframe hides it for good, so nothing has to unmount it.
 */
export default function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <p className="preloader-text w-[min(1100px,88vw)] text-center text-[clamp(1.75rem,7vw,4rem)] leading-[1.08] font-medium tracking-[-0.035em] sm:text-[clamp(2rem,4.2vw,4rem)]">
        Welcome to the Horowitz Andreessen Academy
      </p>
    </div>
  );
}
