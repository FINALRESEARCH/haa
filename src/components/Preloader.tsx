/**
 * The white card that sits over the site while the hero's assets arrive.
 *
 * Deliberately server-rendered and driven entirely by CSS (`.preloader-*` in
 * `globals.css`): it is in the first byte of HTML, so the page is white from
 * the very first paint rather than flashing the site's off-white `--background`
 * while React hydrates, and the timeline runs whether or not the JS ever
 * lands. The final keyframe hides it for good, so nothing has to unmount it.
 *
 * The copy is the locked "Introducing" beat: it lives here, ahead of the video,
 * rather than as a panel further down the page.
 */
export default function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader-text w-[min(760px,86vw)] text-center">
        <p className="text-[clamp(0.875rem,1.4vw,1.25rem)] tracking-[-0.01em] text-[#9a9a9a]">
          Introducing
        </p>
        <p className="my-[0.3em] text-[clamp(2.25rem,6.4vw,5.25rem)] leading-[1.06] font-medium tracking-[-0.035em] text-black">
          The Horowitz Andreessen Academy
        </p>
        <p className="text-[clamp(0.875rem,1.4vw,1.25rem)] tracking-[-0.01em] text-[#8a8a8a]">
          San Francisco
        </p>
      </div>
    </div>
  );
}
