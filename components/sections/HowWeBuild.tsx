"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { VideoSlot } from "@/components/media/VideoSlot";
import { WatermarkCover } from "@/components/media/WatermarkCover";
import { BUILD_CHAPTERS, BUILD_FOOTAGE_SECONDS, BUILD_NOTE } from "@/data/howWeBuild";
import { videos } from "@/data/media";
import { frameUrls } from "@/data/sequences";
import { openChat } from "@/lib/chat/store";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaQuery, useReducedMotion } from "@/lib/hooks/useMediaQuery";
import { chapterIndexAt, chapterProgress } from "@/lib/journey/chapters";
import { createFrameSequence } from "@/lib/media/frameSequence";
import styles from "./HowWeBuild.module.css";

/** How tall the pinned section is on desktop, in screen heights. */
const SCREENS = 6;

/** Circumference of the progress ring on the round button (radius 43). */
const RING_LENGTH = 2 * Math.PI * 43;

/**
 * HOW WE BUILD (master prompt P§10–12): the installation video as the narrative bridge
 * between what SLORA creates and how it is built. On desktop the video is pinned and follows
 * the scroll while a frosted-glass panel highlights the current stage in gold. On phones the
 * video simply plays and the panel follows it; with reduced motion nothing moves.
 * Glass is used ONLY here (and in the chatbot), never across the whole page (P§11).
 */
export function HowWeBuild() {
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 900px)");
  const immersive = !reduced && wide;
  return <HowStage key={immersive ? "pinned" : "simple"} immersive={immersive} reduced={reduced} />;
}

function HowStage({ immersive, reduced }: { immersive: boolean; reduced: boolean }) {
  const wrapRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);

  /* Pinned mode: scrolling moves through the footage (still frames on a canvas, so nothing
     has to seek or decode video while you scroll), and the stage list follows it. */
  useGSAP(
    () => {
      if (!immersive) return;
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas) return;
      const q = gsap.utils.selector(wrap);
      const panel = q("[data-panel]")[0] as HTMLElement;
      const bars = q("[data-bar]") as HTMLElement[];
      const ring = q("[data-ring]")[0] as unknown as SVGCircleElement;

      const state = { target: 0, dirty: true, index: -1 };
      const frames = createFrameSequence({
        canvas,
        urls: frameUrls("how-we-build"),
        onReady: () => {
          state.dirty = true;
        },
      });
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

      const apply = (p: number) => {
        const t = p * (BUILD_FOOTAGE_SECONDS - 0.05);
        if (frames.ready()) {
          canvas.style.opacity = "1";
          frames.draw(p);
        }

        const index = chapterIndexAt(BUILD_CHAPTERS, t);
        if (index !== state.index) {
          state.index = index;
          setActive(index);
        }
        const within = chapterProgress(BUILD_CHAPTERS, t);
        bars.forEach((bar, i) => {
          const done = i < index ? 1 : i === index ? within : 0;
          bar.style.transform = `scaleX(${done})`;
        });
        // the glass panel drifts a little as you scroll
        panel.style.transform = `translateY(${(0.5 - p) * 56}px)`;
        ring.style.strokeDashoffset = String(RING_LENGTH * (1 - p));
      };

      // Lenis already smooths the scroll, so the progress is used as it comes.
      const tick = () => {
        if (!state.dirty) return;
        state.dirty = false;
        apply(state.target);
      };
      gsap.ticker.add(tick);

      // only fetch the frames when the section is about to be reached (three screens away)
      const near = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          frames.start();
          near.disconnect();
        },
        { rootMargin: "300% 0px" },
      );
      near.observe(wrap);
      const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(refresh);
        near.disconnect();
        gsap.ticker.remove(tick);
        frames.destroy();
        trigger.kill();
      };
    },
    { scope: wrapRef, dependencies: [immersive] },
  );

  /* Simple mode: the video just plays; the list follows whatever it is showing. */
  useEffect(() => {
    if (immersive || reduced) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const timer = window.setInterval(() => {
      const video = wrap.querySelector("video");
      if (video && !video.paused) setActive(chapterIndexAt(BUILD_CHAPTERS, video.currentTime));
    }, 200);
    return () => window.clearInterval(timer);
  }, [immersive, reduced]);

  return (
    <section
      id="process"
      ref={wrapRef}
      className={immersive ? styles.tall : styles.simple}
      style={immersive ? { height: `${SCREENS * 100}svh` } : undefined}
      aria-labelledby="process-h"
    >
      <div className={immersive ? styles.stage : styles.simpleStage}>
        <div className={styles.media}>
          {immersive ? (
            <>
              <Image
                src={videos["how-we-build"].poster}
                alt=""
                fill
                sizes="100vw"
                className={styles.poster}
              />
              <canvas ref={canvasRef} className={styles.frames} data-frames aria-hidden="true" />
            </>
          ) : (
            <>
              <VideoSlot id="how-we-build" className="h-full w-full" />
              <WatermarkCover radius={17} className={styles.dot} />
            </>
          )}
        </div>
        <div className={styles.veil} aria-hidden="true" />

        <header className={styles.title}>
          <p className={styles.eyebrow}>05 · PROCESS</p>
          <h2 id="process-h" className={styles.heading}>
            <span className={styles.thin}>how we</span>
            <span className={styles.heavy}>build</span>
          </h2>
          <div className={styles.actions}>
            <a href="#contact" className={styles.primary}>
              Contact us →
            </a>
            <button type="button" className={styles.secondary} onClick={() => openChat()}>
              Enquire
            </button>
          </div>
        </header>

        <div className={styles.panel} data-panel>
          <ol className={styles.list}>
            {BUILD_CHAPTERS.map((chapter, i) => (
              <li
                key={chapter.id}
                className={styles.item}
                aria-current={i === active ? "step" : undefined}
              >
                <span className={styles.num}>{chapter.n}</span>
                <span className={styles.label}>{chapter.label}</span>
                <span className={styles.track} aria-hidden="true">
                  <i className={styles.bar} data-bar />
                </span>
              </li>
            ))}
          </ol>
          <p className={styles.note}>{BUILD_NOTE}</p>
        </div>

        {/* the round button also sits over the ✦ mark baked into the stand-in footage */}
        {immersive && (
          <WatermarkCover className={styles.cover}>
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
            <span>EXPLORE</span>
            <span aria-hidden="true">↓</span>
          </WatermarkCover>
        )}
      </div>
    </section>
  );
}
