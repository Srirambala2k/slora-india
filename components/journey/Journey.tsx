"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { SurfaceFallback } from "@/components/journey/SurfaceFallback";
import { VideoSlot } from "@/components/media/VideoSlot";
import { ContactPopover } from "@/components/contact/ContactPopover";
import { InstagramLink } from "@/components/contact/InstagramLink";
import { LAYERS } from "@/data/turf";
import { frameUrls } from "@/data/sequences";
import { useCapability } from "@/lib/device/capability";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { useMediaQuery, useReducedMotion } from "@/lib/hooks/useMediaQuery";
import {
  PHASES,
  descentProgress,
  gaugeOpacity,
  groundLineOpacity,
  headlineExit,
  labelReveal,
  layerOpacities,
  ramp,
  statementOpacity,
  turfProgress,
  type JourneyMode,
} from "@/lib/journey/phases";
import { createFrameSequence } from "@/lib/media/frameSequence";
import { cuePosition } from "@/lib/media/watermark";
import { useStage, useWarm } from "@/lib/stage";
import styles from "./Journey.module.css";

// The 3D turf is heavy, so it is only downloaded when the intro reaches its quiet moment
// (or when the page is ready) — never at load.
const TurfCanvas = dynamic(() => import("@/three/TurfCanvas"), { ssr: false });

/**
 * The scroll journey (master prompt P§7–9): on desktop screens the hero stays pinned while
 * scrolling takes the camera down through the footage to the grass fibres and, where the
 * computer has a graphics card, on into a 3D turf that opens into a cross-section. Phones,
 * reduced-motion visitors and data-savers get the same story without the heavy parts.
 */
export function Journey() {
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 900px)");
  const tier = useCapability();
  const mode: JourneyMode | null =
    !reduced && wide && tier !== "simple" ? (tier === "full" ? "full" : "video") : null;

  return (
    <>
      {/* key: switching mode remounts the stage, so no animation state is left behind */}
      <JourneyStage key={mode ?? "simple"} mode={mode} />
      {mode === null && <SurfaceFallback />}
      {mode === "video" && <SurfaceFallback id="surface-layers" />}
    </>
  );
}

/** Circumference of the progress ring drawn around the round button (radius 43). */
const RING_LENGTH = 2 * Math.PI * 43;

const idle = (fn: () => void) =>
  "requestIdleCallback" in window
    ? window.requestIdleCallback(fn, { timeout: 2500 })
    : setTimeout(fn, 1200);

function JourneyStage({ mode }: { mode: JourneyMode | null }) {
  const immersive = mode !== null;
  const reduced = useReducedMotion();
  const stage = useStage();
  const warm = useWarm();
  const wrapRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrubRef = useRef<HTMLCanvasElement>(null);
  const turfProgressRef = useRef(0);
  const [turfActive, setTurfActive] = useState(false);

  /* Keep the round SCROLL button sitting over the ✦ mark baked into the stand-in footage. */
  useEffect(() => {
    const root = wrapRef.current?.querySelector<HTMLElement>("[data-stage-box]");
    if (!root) return;
    const place = () => {
      const { x, y, radius } = cuePosition(root.clientWidth, root.clientHeight);
      root.style.setProperty("--cue-x", `${x}px`);
      root.style.setProperty("--cue-y", `${y}px`);
      root.style.setProperty("--cue-size", `${radius * 2}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  /* The headline arrives once the entrance has revealed the page. */
  useGSAP(
    () => {
      if (reduced) return;
      const root = wrapRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);

      const heavy1 = SplitText.create(q("[data-line='1']")[0], { type: "chars", mask: "chars" });
      const heavy3 = SplitText.create(q("[data-line='3']")[0], { type: "chars", mask: "chars" });
      const thin = q("[data-line='2']")[0];
      const meta = q("[data-meta]");

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => gsap.set(thin, { clearProps: "clipPath" }),
      });
      tl.fromTo(
        q("[data-hero-media]"),
        { scale: 1.14 },
        { scale: 1, duration: 2.8, ease: "power2.out" },
        0,
      )
        .from(
          heavy1.chars,
          { yPercent: 115, duration: 0.95, stagger: 0.035, ease: "power4.out" },
          0.1,
        )
        .fromTo(
          thin,
          { clipPath: "inset(0 100% 0 0)", x: -30 },
          { clipPath: "inset(0 0% 0 0)", x: 0, duration: 1.2, ease: "power3.inOut" },
          0.35,
        )
        .from(
          heavy3.chars,
          { yPercent: 115, duration: 0.95, stagger: 0.035, ease: "power4.out" },
          0.6,
        )
        .from(meta, { opacity: 0, y: 10, duration: 0.8, stagger: 0.12, ease: "power3.out" }, 1.2);
      timelineRef.current = tl;

      // Simple mode: scrolling away just drifts and dims the hero.
      if (!immersive) {
        const scrub = { trigger: root, start: "top top", end: "bottom top", scrub: true };
        gsap.to(q("[data-line='1']"), { yPercent: -10, ease: "none", scrollTrigger: scrub });
        gsap.to(thin, { yPercent: -24, ease: "none", scrollTrigger: scrub });
        gsap.to(q("[data-line='3']"), { yPercent: -40, ease: "none", scrollTrigger: scrub });
        gsap.to(q("[data-hero-dim]"), { opacity: 0.7, ease: "none", scrollTrigger: scrub });
      }
    },
    { scope: wrapRef, dependencies: [reduced] },
  );

  useEffect(() => {
    if (stage !== "entering") timelineRef.current?.play();
  }, [stage]);

  /* The journey itself: ONE scroll value (P) decides what is visible, which frame of the
     descent is painted and where the 3D camera sits. Lenis already smooths the scroll, so P is
     used as it comes (a second layer of easing here made everything feel floaty and late). */
  useGSAP(
    () => {
      if (!mode) return;
      const phases = PHASES[mode];
      const wrap = wrapRef.current;
      const canvas = scrubRef.current;
      if (!wrap || !canvas) return;
      const state = {
        target: 0,
        dirty: true,
        wasActive: false,
        inView: false,
        heroTouched: false,
        cueTouched: false,
      };
      // The descent is a run of still frames on a canvas (not a video that has to seek and
      // decode as you scroll). They download quietly once the browser is idle, well before
      // anyone scrolls, and nothing is painted until the first ones have arrived.
      const frames = createFrameSequence({
        canvas,
        urls: frameUrls("hero-descent"),
        onReady: () => {
          state.dirty = true;
        },
      });
      const handle = idle(() => frames.start());
      const q = gsap.utils.selector(wrap);
      const loop = q("[data-loop]")[0] as HTMLElement;
      const turfBox = q("[data-turf]")[0] as HTMLElement | undefined;
      const turfShade = q("[data-turf-shade]")[0] as HTMLElement | undefined;
      const note = q("[data-note]")[0] as HTMLElement | undefined;
      const headline = q("[data-headline]")[0] as HTMLElement;
      const cue = q("[data-cue]")[0] as HTMLElement;
      const tagline = q("[data-tagline]")[0] as HTMLElement;
      const ring = q("[data-ring]")[0] as unknown as SVGCircleElement;
      const label = q("[data-cue-label]")[0] as HTMLElement;
      const gauge = q("[data-gauge]")[0] as HTMLElement;
      const marker = q("[data-marker]")[0] as HTMLElement;
      const groundLine = q("[data-ground-line]")[0] as HTMLElement;
      const statement = q("[data-statement]")[0] as HTMLElement;
      const lines = [1, 2, 3].map((n) => q(`[data-line='${n}']`)[0]);
      const drift = [-10, -24, -40];

      const trigger = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          state.target = self.progress;
          state.dirty = true;
        },
        onRefresh: (self) => {
          state.target = self.progress;
          state.dirty = true;
        },
      });

      // Know when the journey is on screen (from the moment it starts to enter until it has
      // fully left, INCLUDING the exact end of the pin), so the 3D scene stops drawing once it
      // is off screen but never while you are looking at the finished cross-section.
      const visibility = ScrollTrigger.create({
        trigger: wrap,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          state.inView = self.isActive;
          state.dirty = true;
        },
      });

      const apply = (p: number) => {
        const o = layerOpacities(p, mode);
        const ready = frames.ready();
        loop.style.opacity = String(ready ? o.loop : Math.max(o.loop, 1 - Math.min(1, o.turf * 4)));
        canvas.style.opacity = String(ready ? o.scrub : 0);
        if (ready && o.scrub > 0) frames.draw(descentProgress(p, mode));

        // Only touch the headline while it is scrolled away (and once more on the way back), so
        // this never fights the intro animation that plays while the page is being revealed.
        const hp = headlineExit(p, mode);
        if (hp > 0 || state.heroTouched) {
          state.heroTouched = hp > 0;
          headline.style.opacity = String(1 - hp);
          tagline.style.opacity = String(1 - hp);
          lines.forEach((line, i) => gsap.set(line, { yPercent: drift[i] * hp }));
        }
        // The round button stays through the whole descent (it also covers the ✦ mark in the
        // footage): it turns into a progress ring, then steps aside for the 3D turf.
        if (hp > 0 || state.heroTouched || state.cueTouched) {
          state.cueTouched = hp > 0 || p > 0;
          const away = ramp(p, phases.toTurf[0], phases.toTurf[0] + 0.05);
          cue.style.opacity = String(1 - away);
          cue.style.pointerEvents = away > 0.5 ? "none" : "auto";
          ring.style.strokeDashoffset = String(RING_LENGTH * (1 - descentProgress(p, mode)));
          label.style.opacity = String(1 - Math.min(1, hp * 3));
        }

        gauge.style.opacity = String(gaugeOpacity(p, mode));
        marker.style.top = `${descentProgress(p, mode) * 100}%`;
        const go = groundLineOpacity(p, mode);
        groundLine.style.opacity = String(go);
        groundLine.style.transform = `translateY(${(1 - go) * 18}px)`;
        const so = statementOpacity(p, mode);
        statement.style.opacity = String(so);
        statement.style.transform = `translateY(${(1 - so) * 26}px)`;

        if (turfBox && turfShade && note) {
          const turfQ = turfProgress(p, mode);
          turfProgressRef.current = turfQ;
          turfBox.style.opacity = String(o.turf);
          turfBox.style.visibility = o.turf > 0.01 ? "visible" : "hidden";
          turfShade.style.opacity = String(1 - ramp(turfQ, 0, 0.32));
          note.style.opacity = String(labelReveal(turfQ, LAYERS.length - 1, LAYERS.length));
          const active = state.inView && p >= phases.turfActiveFrom;
          if (active !== state.wasActive) {
            state.wasActive = active;
            setTurfActive(active);
          }
        }
      };

      const tick = () => {
        if (!state.dirty) return;
        state.dirty = false;
        apply(state.target);
      };
      gsap.ticker.add(tick);
      // the tall layout has just appeared, so trigger positions need measuring again
      const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(refresh);
        if (typeof handle === "number" && "cancelIdleCallback" in window)
          window.cancelIdleCallback(handle);
        else clearTimeout(handle as ReturnType<typeof setTimeout>);
        gsap.ticker.remove(tick);
        frames.destroy();
        trigger.kill();
        visibility.kill();
      };
    },
    { scope: wrapRef, dependencies: [mode] },
  );

  const tall = mode ? { height: `${PHASES[mode].screens * 100}svh` } : undefined;

  return (
    <section
      id="top"
      ref={wrapRef}
      className={immersive ? styles.journey : undefined}
      style={tall}
      aria-label="SLORA"
    >
      <div className={immersive ? styles.stage : styles.simple} data-stage-box>
        {/* 1 · the looping hero video */}
        <div className={styles.layer} data-loop data-hero-media>
          <VideoSlot id="hero-loop" eager className="h-full w-full" />
        </div>

        {/* 2 · the scroll-driven descent (stadium → macro grass): the hero footage played
            backwards, as still frames painted onto a canvas */}
        {immersive && (
          <canvas ref={scrubRef} className={styles.scrub} data-frames aria-hidden="true" />
        )}

        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.dim} data-hero-dim aria-hidden="true" />

        {/* 3 · the 3D turf (only where the computer has a graphics card) */}
        {mode === "full" && (
          <div className={styles.turf} data-turf>
            {/* mounted in the intro's quiet moment ("warm"), so its set-up is never felt while scrolling */}
            {(warm || stage !== "entering") && (
              <TurfCanvas progress={turfProgressRef} active={turfActive} />
            )}
            <div className={styles.turfShade} data-turf-shade aria-hidden="true" />
            <p className={styles.note} data-note>
              ILLUSTRATIVE · NOT TO SCALE
            </p>
          </div>
        )}

        <h1 className={styles.headline} data-headline>
          <span className={styles.heavy} data-line="1">
            We build
          </span>
          <span className={styles.thin} data-line="2">
            the ground
          </span>
          <span className={styles.heavy} data-line="3">
            you move on.
          </span>
        </h1>

        {/* Each of these is a WRAPPER (faded by scrolling) around an inner element that the
            entrance animation fades in, so the two never fight over the same opacity. */}
        <div className={styles.taglineBox} data-tagline>
          <p className={styles.tagline} data-meta>
            ARTIFICIAL TURF · SPORTS FLOORING · LANDSCAPE SURFACES
          </p>
          <div className={styles.heroActions} data-meta>
            <ContactPopover openUpward />
            <InstagramLink />
          </div>
        </div>
        <div className={styles.cueBox} data-cue>
          <a href="#surfaces" className={styles.cue} aria-label="Scroll down" data-meta>
            <svg className={styles.ring} viewBox="0 0 88 88" aria-hidden="true">
              <circle
                className={styles.ringArc}
                data-ring
                cx="44"
                cy="44"
                r="43"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH}
              />
            </svg>
            <span data-cue-label>SCROLL</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        {immersive && (
          <>
            <div className={styles.gauge} data-gauge aria-hidden="true">
              <span className={styles.gaugeLabel} style={{ top: "0%" }}>
                THE ARENA
              </span>
              <span className={styles.gaugeLabel} style={{ top: "50%" }}>
                THE SURFACE
              </span>
              <span className={styles.gaugeLabel} style={{ top: "100%" }}>
                THE FIBRE
              </span>
              <span className={styles.gaugeTrack}>
                <span className={styles.gaugeMarker} data-marker />
              </span>
            </div>

            {/* A short line sharing the statement's slot, between "the arena" and "the surface"
                on the depth gauge — gone again well before the statement below appears */}
            <div className={styles.groundLine} data-ground-line>
              <p className={styles.groundLineText}>Every Game Begins with the Ground</p>
            </div>

            <div className={styles.statement} data-statement>
              <p className={styles.eyebrow}>SLORA</p>
              <p className={styles.statementText}>
                creates surfaces where people move, play and experience space.
              </p>
            </div>
          </>
        )}
      </div>

      {/* menu anchor for “Surfaces”: it starts where the descent starts */}
      {immersive && <div id="surfaces" className={styles.anchor} aria-hidden="true" />}
    </section>
  );
}
