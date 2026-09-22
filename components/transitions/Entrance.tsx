"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getStage, requestWarmup, setStage, syncStageAttribute } from "@/lib/stage";
import styles from "./Entrance.module.css";

const SEEN_KEY = "slora:entrance-seen";

function readSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
function writeSeen(): void {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* private mode etc.: the intro simply plays again next time */
  }
}

/**
 * The SLORA entrance (master prompt §6).
 *
 *   1. Full black. Almost nothing.
 *   2. The logo appears at the centre and assembles: three bars, then the wordmark.
 *   3. The logo glides to the top-left and becomes the header logo.
 *   4. As it goes, the black retreats to the left, so the site arrives from the right.
 *
 * It is not a navbar fade: the SAME logo element that assembles in the middle is the one
 * that ends up in the header. Repeat visits in a session get a much shorter version, there
 * is a skip control, and reduced-motion visitors skip it entirely.
 */
export function Entrance() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;
    const hide = () => {
      curtain.style.display = "none";
    };
    const brand = document.querySelector<HTMLElement>("[data-brand]");
    // The header logo is hidden by CSS until it is positioned; this reveals it.
    const showBrand = () => brand?.setAttribute("data-shown", "");

    // Came back to the home page by in-app navigation: the intro already played.
    if (getStage() !== "entering") {
      showBrand();
      hide();
      return;
    }

    const layers = brand ? gsap.utils.toArray<HTMLElement>("[data-brand-layer]", brand) : [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !brand || layers.length !== 4) {
      showBrand();
      hide();
      setStage("ready");
      return;
    }

    syncStageAttribute(); // <html data-stage="entering"> locks scrolling in CSS
    const [bar1, bar2, bar3, wordmark] = layers;
    const finish = () => {
      hide();
      setStage("ready");
      writeSeen();
    };

    const timeline = gsap.timeline({ onComplete: finish });
    timelineRef.current = timeline;

    if (readSeen()) {
      // Short version for repeat visits: no logo assembly, just the wipe.
      showBrand();
      requestWarmup();
      timeline
        .add(() => setStage("revealing"), 0)
        .to(curtain, { clipPath: "inset(0 100% 0 0)", duration: 0.9, ease: "expo.inOut" }, 0);
      if (skipRef.current) skipRef.current.style.display = "none";
      return;
    }

    // Where the logo currently sits (its header position) → put it in the middle, large.
    gsap.set(brand, { clearProps: "transform" });
    const rect = brand.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(vw * (vw < 700 ? 0.66 : 0.34), 480);
    gsap.set(brand, {
      x: vw / 2 - (rect.left + rect.width / 2),
      y: vh / 2 - (rect.top + rect.height / 2),
      scale: width / rect.width,
    });

    // Layers start hidden and slightly displaced.
    gsap.set([bar1, bar3], { opacity: 0, x: -70 });
    gsap.set(bar2, { opacity: 0, x: 70 });
    gsap.set(wordmark, { opacity: 0, x: -18, clipPath: "inset(0 100% 0 0)" });
    showBrand();

    timeline
      .to(bar1, { opacity: 1, x: 0, duration: 0.95, ease: "power3.out" }, 0.45)
      .to(bar2, { opacity: 1, x: 0, duration: 0.95, ease: "power3.out" }, 0.62)
      .to(bar3, { opacity: 1, x: 0, duration: 0.95, ease: "power3.out" }, 0.79)
      .to(
        wordmark,
        { opacity: 1, x: 0, clipPath: "inset(0 0% 0 0)", duration: 1.15, ease: "power3.inOut" },
        1.2,
      )
      // The logo now HOLDS STILL for a moment. That is when the heavy 3D scene sets itself up,
      // so any brief pause it causes happens while nothing is moving (not while scrolling).
      .add(() => requestWarmup(), 2.4)
      .addLabel("dock", 3.4)
      // The logo travels to the header…
      .to(brand, { x: 0, y: 0, scale: 1, duration: 1.2, ease: "expo.inOut" }, "dock")
      // …while the black retreats leftwards, so the site appears from the right.
      .add(() => setStage("revealing"), "dock+=0.2")
      .to(
        curtain,
        { clipPath: "inset(0 100% 0 0)", duration: 1.3, ease: "expo.inOut" },
        "dock+=0.1",
      )
      .to(skipRef.current, { opacity: 0, duration: 0.3 }, "dock");
  }, []);

  // Skip control: keyboard (Esc) and button both fast-forward the sequence.
  useEffect(() => {
    const skip = () => timelineRef.current?.timeScale(6);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={curtainRef} className={styles.curtain} data-entrance>
      <button
        ref={skipRef}
        type="button"
        className={styles.skip}
        onClick={() => timelineRef.current?.timeScale(6)}
        aria-label="Skip the intro"
      >
        SKIP →
      </button>
    </div>
  );
}
