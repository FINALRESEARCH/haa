"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type * as ThreeNS from "three";
import type { VariantProps } from "@/variants/types";

/**
 * The city as a splat field: `content.image` is sampled pixel by pixel into a
 * few hundred thousand sprites, each one drawn as the diagonal stroke from the
 * HAA mark. Brightness pushes a particle forward, so the skyline and the
 * traffic stand in relief off the dark water, and the whole cloud sways and
 * breathes on its own clock. Hovering a landmark opens a note about it.
 *
 * Ported from the `x` effect in sessions/press — the sprite shader, the pixel
 * sampler and the depth-of-field falloff are its ideas, with the two crossed
 * arms reduced to the mark's single stroke.
 */

type ColorMode = "photo" | "tinted" | "brand" | "ink";

/**
 * Every dial the look hangs off. `color` is the one to change once the palette
 * is settled; the rest were tuned against the placeholder plate and will want a
 * pass when the real one lands.
 */
const LOOK = {
  color: "tinted" as ColorMode,
  brand: "#fe3619",
  /**
   * The field the cloud sits on. Left as the theme token so the section tracks
   * `--background` instead of drifting from it; any CSS colour works here.
   */
  field: "var(--background)",

  /** Sprite count. Capped by the plate's pixel count and by the device below. */
  particles: 170_000,
  /**
   * Sprite size in world units, before the per-sprite 0.5–1.5 spread. `press`
   * ran at 0.04 against a camera ten units out; this camera sits much closer to
   * fit the plate to the viewport, so the two have to be read together.
   */
  baseSize: 0.058,
  size: 1.0,
  /** Stroke width across each sprite. Lower reads finer and more like type. */
  strokeWidth: 0.17,
  /** Random ± rotation per sprite, radians. 0 makes every stroke parallel. */
  strokeScatter: 0.12,

  /** Brightness → depth. The lit city stands forward of the water. */
  relief: 0.9,
  reliefJitter: 0.06,

  /**
   * "sway" rocks the cloud through ±amplitude radians; "orbit" turns it all the
   * way round. A relief plane goes edge-on and vanishes twice per revolution,
   * so sway is the default — switch to orbit if you want the full turn anyway.
   */
  spin: { mode: "sway" as "sway" | "orbit", amplitude: 0.45, period: 24 },
  /** The breath: sprites drift apart and swell, then settle. */
  pulse: { drift: 0.09, size: 0.1, period: 8 },
  dof: 2.4,

  /**
   * How the plate is framed. `zoom` is a multiplier on a fit that exactly
   * covers the section: at 1 the plate stops level with the section's edges and
   * there is nothing to bleed, so values above 1 buy overhang for the dissolve
   * at the cost of showing less of the city. `offsetY` slides the framing up
   * (positive) to favour the sky over the skyline. Both were set against the
   * placeholder plate and want a pass once the real one is in.
   */
  framing: { zoom: 1.25, offsetY: 0.0 },

  /**
   * How far past the section's top and bottom the canvas runs, in `vh`. This
   * only has to be roomy enough for the dissolve to finish inside it; `zoom`
   * below is what decides how far the field actually reaches.
   */
  bleed: 26,
  /**
   * Where the dissolve starts, as a fraction of the plate's half-height. Below
   * this the field is at full strength; at the plate's own edge it is gone, so
   * the boundary can never be seen however the cloud is framed or turned.
   */
  fadeStart: 0.46,
};

/**
 * The mark's stroke, straight off the `d` in `public/mark.svg`: the slash runs
 * from (22.7519, 0) to (30.0953, 26.449), so it leans right as it descends
 * rather than sitting at a lazy 45°. `gl_PointCoord` is y-down, which is the
 * same handedness the SVG is authored in, so the vector carries over as-is.
 */
const SLASH = (() => {
  const dx = 30.0953 - 22.7519;
  const dy = 26.449;
  const len = Math.hypot(dx, dy);
  return [dx / len, dy / len] as const;
})();

/**
 * Placeholder notes, positioned in normalized coordinates on the source plate
 * (0,0 top-left). They were eyeballed against the stock comp currently in
 * `public/life/` — every `u`/`v` here needs re-placing against the real plate,
 * and the copy is a draft to react to rather than anything final.
 *
 * Keep anchors clear of the centre column below roughly `v` 0.6: that is where
 * the paragraphs sit, and a pin that lands there covers the words.
 */
const HOTSPOTS = [
  {
    u: 0.17,
    v: 0.37,
    label: "SoMa",
    body: "Twelve minutes from the residence. The reason HAA is residential is that the density of people here building consequential things is not reproducible anywhere else.",
  },
  {
    u: 0.44,
    v: 0.42,
    label: "The Financial District",
    body: "Students sit in on companies during an ordinary week, not on one annual field trip that everyone dresses up for.",
  },
  {
    u: 0.73,
    v: 0.47,
    label: "The Bay Bridge",
    body: "The eastern span carries the cohort to labs and shops across the water. The commute is part of the curriculum.",
  },
  {
    u: 0.53,
    v: 0.55,
    label: "The Bay",
    body: "Research boats, fabrication yards and a shoreline of half-finished ideas. Plenty of the work happens at the water's edge.",
  },
  {
    u: 0.12,
    v: 0.74,
    label: "The 80",
    body: "Light trails at four in the morning. The studios keep the same hours the freeway does.",
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [1, 1, 1];
  return [
    parseInt(m[1], 16) / 255,
    parseInt(m[2], 16) / 255,
    parseInt(m[3], 16) / 255,
  ];
}

/** Perceptual-ish luminance, used for both depth and the two flat colour modes. */
const luma = (r: number, g: number, b: number) =>
  0.2126 * r + 0.7152 * g + 0.0722 * b;

export default function LifeV3({ id, content }: VariantProps<"life">) {
  const sectionRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  /** Falls back to the flat plate if WebGL is missing or the plate won't decode. */
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!section || !host || !canvas) return;

    let disposed = false;
    let frame = 0;
    const cleanups: (() => void)[] = [];

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: ThreeNS.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        setFailed(true);
        return;
      }

      const img = new window.Image();
      img.decoding = "async";
      img.src = content.image.src;
      try {
        await img.decode();
      } catch {
        renderer.dispose();
        setFailed(true);
        return;
      }
      if (disposed) {
        renderer.dispose();
        return;
      }

      // Sample the plate once, off-screen, at its natural size.
      const sampler = document.createElement("canvas");
      sampler.width = img.naturalWidth;
      sampler.height = img.naturalHeight;
      const ctx = sampler.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        renderer.dispose();
        setFailed(true);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const { data: px } = ctx.getImageData(0, 0, sampler.width, sampler.height);

      const still = window.matchMedia("(prefers-reduced-motion: reduce)");
      const coarse = window.matchMedia("(pointer: coarse)");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Phones get a lighter cloud; the sprite count can never exceed the pixels
      // available to sample, so a small plate quietly caps itself.
      const total = sampler.width * sampler.height;
      const wanted = Math.min(
        LOOK.particles * (coarse.matches ? 0.4 : 1),
        total,
      );
      const step = Math.max(1, Math.floor(total / wanted));
      const count = Math.ceil(total / step);

      const positions = new Float32Array(count * 3);
      const jitters = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const rotations = new Float32Array(count);

      const aspect = sampler.height / sampler.width;
      const cloudW = 3;
      const cloudH = cloudW * aspect;

      const [bR, bG, bB] = hexToRgb(LOOK.brand);
      const mode = LOOK.color;

      // Depth is read back for the hotspot anchors so a note sits on the relief
      // rather than floating on the flat plane behind it.
      const depthAt = (u: number, v: number) => {
        const sx = Math.min(sampler.width - 1, Math.max(0, Math.round(u * sampler.width)));
        const sy = Math.min(sampler.height - 1, Math.max(0, Math.round(v * sampler.height)));
        const i = (sy * sampler.width + sx) * 4;
        return (luma(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255) - 0.5) * LOOK.relief;
      };

      let n = 0;
      for (let i = 0; i < total; i += step) {
        const sx = i % sampler.width;
        const sy = (i / sampler.width) | 0;
        const o = i * 4;
        const r = px[o] / 255;
        const g = px[o + 1] / 255;
        const b = px[o + 2] / 255;
        const l = luma(r, g, b);

        const p = n * 3;
        positions[p] = (sx / sampler.width - 0.5) * cloudW;
        positions[p + 1] = -(sy / sampler.height - 0.5) * cloudH;
        positions[p + 2] =
          (l - 0.5) * LOOK.relief + (Math.random() - 0.5) * LOOK.reliefJitter;

        // Where a sprite drifts to at the top of the breath.
        jitters[p] = (Math.random() - 0.5) * 0.6;
        jitters[p + 1] = (Math.random() - 0.5) * 0.6;
        jitters[p + 2] = (Math.random() - 0.5) * 1.0;

        if (mode === "brand") {
          const k = 0.35 + l * 0.9;
          colors[p] = bR * k;
          colors[p + 1] = bG * k;
          colors[p + 2] = bB * k;
        } else if (mode === "ink") {
          // Ink follows the plate's own tone: the skyline silhouette lays down
          // solid, the bright sky thins out to nearly bare paper. Inverting it
          // here would turn the largest, brightest area into the heaviest mass.
          const k = 0.05 + l * 0.85;
          colors[p] = k;
          colors[p + 1] = k;
          colors[p + 2] = k;
        } else if (mode === "tinted") {
          // Keep the photograph's own light, pulled a third of the way to brand.
          colors[p] = r + (bR - r) * 0.33;
          colors[p + 1] = g + (bG - g) * 0.33;
          colors[p + 2] = b + (bB - b) * 0.33;
        } else {
          colors[p] = r;
          colors[p + 1] = g;
          colors[p + 2] = b;
        }

        sizes[n] = LOOK.baseSize * (0.5 + Math.random());
        rotations[n] = (Math.random() - 0.5) * 2 * LOOK.strokeScatter;
        n += 1;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aJitter", new THREE.BufferAttribute(jitters, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("aRotation", new THREE.BufferAttribute(rotations, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uPixelRatio: { value: dpr },
          uSize: { value: LOOK.size },
          uDrift: { value: 0 },
          uDof: { value: LOOK.dof },
          uFocus: { value: 3 },
          uFitScale: { value: 1 },
          uFadeStart: { value: LOOK.fadeStart },
          uHalfH: { value: cloudH / 2 },
          uWidth: { value: LOOK.strokeWidth },
          uSlash: { value: new THREE.Vector2(SLASH[0], SLASH[1]) },
        },
        vertexShader: /* glsl */ `
          attribute vec3 aJitter;
          attribute float aSize;
          attribute float aRotation;

          varying vec3 vColor;
          varying float vAlpha;
          varying float vRotation;

          uniform float uPixelRatio;
          uniform float uSize;
          uniform float uDrift;
          uniform float uDof;
          uniform float uFocus;
          uniform float uFitScale;
          uniform float uFadeStart;
          uniform float uHalfH;

          void main() {
            vColor = color;
            vRotation = aRotation;

            // Dissolve toward the plate's own top and bottom edges. Measured
            // here rather than in clip space so alpha is already zero wherever
            // the plate ends — no framing or turn can bring an edge into view.
            float fy = abs(position.y) / uHalfH;
            float edge = 1.0 - smoothstep(uFadeStart, 1.0, fy);

            vec3 pos = position + aJitter * uDrift;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            float dist = -mv.z;

            // Circle of confusion off the focal plane: far sprites grow and
            // thin out, which reads as depth without a second render pass.
            float coc = abs(dist - uFocus) * uDof * 0.1;
            float blur = 1.0 + coc;
            vAlpha = clamp(0.95 / (blur * blur), 0.08, 0.95) * edge;

            gl_PointSize = min(
              aSize * uSize * uFitScale * blur * (300.0 / dist) * uPixelRatio,
              26.0
            );
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          varying float vRotation;

          uniform float uWidth;
          uniform vec2 uSlash;

          void main() {
            vec2 uv = gl_PointCoord - 0.5;

            float c = cos(vRotation);
            float s = sin(vRotation);
            uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);

            // Signed distance to the mark's stroke, split into how far across
            // the stroke we are and how far along it.
            float across = abs(uv.x * uSlash.y - uv.y * uSlash.x);
            float along = abs(uv.x * uSlash.x + uv.y * uSlash.y);

            float stroke = 1.0 - smoothstep(uWidth * 0.35, uWidth, across);
            float ends = 1.0 - smoothstep(0.34, 0.48, along);
            float shape = stroke * ends;
            if (shape < 0.01) discard;

            gl_FragColor = vec4(vColor, shape * vAlpha);
          }
        `,
        transparent: true,
        vertexColors: true,
        depthWrite: false,
      });

      const points = new THREE.Points(geometry, material);
      const group = new THREE.Group();
      group.add(points);

      const scene = new THREE.Scene();
      scene.add(group);

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);

      const fit = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        const sectionH = section.clientHeight;
        if (!w || !h || !sectionH) return;
        camera.aspect = w / h;
        const half = Math.tan((camera.fov * Math.PI) / 360);
        // Frame against the section, not the canvas: the canvas is deliberately
        // taller, and fitting to it would crop the city to buy overhang the
        // dissolve does not actually need. `zoom` then trades view for reach.
        const dist =
          Math.min(
            (cloudH * h) / (2 * half * sectionH),
            cloudW / (2 * half * camera.aspect),
          ) / LOOK.framing.zoom;
        const y = LOOK.framing.offsetY * cloudH;
        camera.position.set(0, y, dist);
        camera.lookAt(0, y, 0);
        camera.updateProjectionMatrix();
        material.uniforms.uFocus.value = camera.position.z;
        // Point size falls off with distance, so without this the strokes would
        // quietly change weight whenever the bleed or zoom is retuned.
        material.uniforms.uFitScale.value = camera.position.z / 2.2;
        renderer.setSize(w, h, false);
      };
      fit();

      const ro = new ResizeObserver(fit);
      ro.observe(host);
      ro.observe(section);
      cleanups.push(() => ro.disconnect());

      // A cloud this size has no business running while it is off screen.
      let onScreen = true;
      const io = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          if (onScreen && !frame) frame = requestAnimationFrame(tick);
        },
        { rootMargin: "120px" },
      );
      io.observe(host);
      cleanups.push(() => io.disconnect());

      // Anchors ride the same group as the cloud, so a note tracks its landmark
      // through the sway instead of sitting still over a moving city.
      const anchors = HOTSPOTS.map((spot) => {
        const v = new THREE.Vector3(
          (spot.u - 0.5) * cloudW,
          -(spot.v - 0.5) * cloudH,
          depthAt(spot.u, spot.v),
        );
        return v;
      });
      const projected = new THREE.Vector3();

      // `THREE.Clock` is deprecated as of r186 and `Timer` wants its own
      // per-frame update; elapsed seconds off the rAF stamp is all this needs.
      const started = performance.now();
      const tick = (now: number) => {
        frame = 0;
        if (disposed) return;

        const t = (now - started) / 1000;

        if (still.matches) {
          group.rotation.y = 0;
          material.uniforms.uDrift.value = 0;
          material.uniforms.uSize.value = LOOK.size;
        } else {
          group.rotation.y =
            LOOK.spin.mode === "orbit"
              ? (t / LOOK.spin.period) * Math.PI * 2
              : Math.sin((t / LOOK.spin.period) * Math.PI * 2) *
                LOOK.spin.amplitude;

          // One breath, shared by the drift and the sprite size.
          const breath = 0.5 - 0.5 * Math.cos((t / LOOK.pulse.period) * Math.PI * 2);
          material.uniforms.uDrift.value = breath * LOOK.pulse.drift;
          material.uniforms.uSize.value = LOOK.size * (1 + breath * LOOK.pulse.size);
        }

        const w = host.clientWidth;
        const h = host.clientHeight;
        // The relief faces +z; once the group turns past edge-on the notes are
        // pointing away from the reader and should not be hoverable.
        const facing = Math.cos(group.rotation.y);
        group.updateMatrixWorld();

        for (let i = 0; i < anchors.length; i++) {
          const pin = pinRefs.current[i];
          if (!pin) continue;
          projected.copy(anchors[i]).applyMatrix4(group.matrixWorld).project(camera);
          const x = (projected.x * 0.5 + 0.5) * w;
          const y = (-projected.y * 0.5 + 0.5) * h;
          pin.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          pin.style.opacity = facing > 0.12 ? "1" : "0";
          pin.style.pointerEvents = facing > 0.12 ? "auto" : "none";
          // Lets the note flip to the other side rather than leave the canvas.
          pin.dataset.side = x > w * 0.62 ? "left" : "right";
          pin.dataset.vside = y > h * 0.68 ? "up" : y < h * 0.22 ? "down" : "mid";
        }

        renderer.render(scene, camera);
        if (onScreen) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      still.addEventListener("change", () => {
        if (!frame) frame = requestAnimationFrame(tick);
      });

      cleanups.push(() => {
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      });
    })();

    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      cleanups.forEach((fn) => fn());
    };
  }, [content.image.src]);

  return (
    <section ref={sectionRef} id={id} className="relative min-h-screen w-full">
      {/* Runs past the section on both ends so the field dissolves over the
          neighbouring sections instead of stopping at a boundary. Pointer
          events stay off here; the pins switch themselves back on. */}
      <div
        ref={hostRef}
        className="pointer-events-none absolute inset-x-0 z-[1]"
        style={{ top: `-${LOOK.bleed}vh`, bottom: `-${LOOK.bleed}vh` }}
      >
        {failed ? (
          <Image
            src={content.image.src}
            alt={content.image.alt}
            fill
            sizes="100vw"
            className="object-cover opacity-80"
            style={{
              maskImage: `linear-gradient(to bottom, transparent 0%, #000 ${LOOK.bleed}%, #000 ${100 - LOOK.bleed}%, transparent 100%)`,
            }}
          />
        ) : (
          <>
            <canvas ref={canvasRef} className="block h-full w-full" />
            {/* Described once for anyone who will never see the cloud resolve. */}
            <p className="sr-only">{content.image.alt}</p>
          </>
        )}

        {!failed &&
          HOTSPOTS.map((spot, i) => (
            <div
              key={spot.label}
              ref={(el) => {
                pinRefs.current[i] = el;
              }}
              className="group absolute left-0 top-0 z-[8] opacity-0 transition-opacity duration-500 data-[side=left]:[--note-x:calc(-100%-18px)] data-[side=right]:[--note-x:18px] data-[vside=down]:[--note-y:12px] data-[vside=mid]:[--note-y:-50%] data-[vside=up]:[--note-y:calc(-100%-12px)]"
            >
              <button
                type="button"
                aria-expanded={active === i}
                aria-label={`About ${spot.label}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive((v) => (v === i ? null : v))}
                onFocus={() => setActive(i)}
                onBlur={() => setActive((v) => (v === i ? null : v))}
                className="-translate-x-1/2 -translate-y-1/2 block h-3.5 w-3.5 rounded-full border-2 border-background bg-brand shadow-[0_0_0_1px_rgba(17,17,17,0.3),0_2px_8px_rgba(17,17,17,0.3)] transition-transform duration-200 hover:scale-150 focus-visible:scale-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              />
              <div
                className="pointer-events-none absolute left-0 top-0 w-[min(19rem,60vw)]"
                style={{
                  transform:
                    "translate(var(--note-x, 18px), var(--note-y, -50%))",
                }}
              >
                <div
                  role="tooltip"
                  aria-hidden={active !== i}
                  className={`rounded-lg bg-foreground p-4 text-left text-background shadow-xl transition-all duration-200 ${
                    active === i
                      ? "translate-y-0 opacity-100"
                      : "translate-y-1 opacity-0"
                  }`}
                >
                  <span className="label block text-brand">{spot.label}</span>
                  <p className="mt-2 text-[0.85rem] leading-[1.45] tracking-[-0.01em]">
                    {spot.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* The cloud is busy everywhere, so the type gets its own bed. Both bands
          return to transparent at the section edges: a gradient that went
          opaque there would draw a hard line across the bleed. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[68vh]"
        style={{
          background: `linear-gradient(to top, transparent 0%, color-mix(in srgb, ${LOOK.field} 66%, transparent) 20%, color-mix(in srgb, ${LOOK.field} 66%, transparent) 58%, transparent 100%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[46vh]"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, color-mix(in srgb, ${LOOK.field} 58%, transparent) 26%, color-mix(in srgb, ${LOOK.field} 58%, transparent) 66%, transparent 100%)`,
        }}
      />

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-between px-6 pb-[9vh] pt-[19vh] sm:px-10">
        <h2 className="pointer-events-auto mx-auto w-[min(1100px,92vw)] text-center text-[clamp(2rem,6vw,5.5rem)] font-medium leading-[1] tracking-[-0.04em] text-foreground">
          {content.heading}
        </h2>

        <div className="pointer-events-auto mx-auto flex w-[min(760px,92vw)] flex-col items-center gap-7 text-foreground">
          <div className="space-y-4 text-center text-[clamp(0.95rem,1.35vw,1.2rem)] leading-[1.45] tracking-[-0.01em]">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <a
            href={content.cta.href}
            className="label inline-flex items-center gap-2 text-foreground transition-opacity duration-300 ease-out hover:opacity-60"
          >
            {content.cta.label} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
