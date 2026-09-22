"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";
import { setLenis } from "@/lib/scroll/lenis";
import { getStage, useStage } from "@/lib/stage";
import { getLenis } from "@/lib/scroll/lenis";

/**
 * Smooth scrolling (Lenis) driven by GSAP's ticker, so ScrollTrigger and Lenis share ONE
 * animation loop. Two loops is the classic cause of jittery scroll animations.
 * Off entirely for visitors who asked for reduced motion.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const stage = useStage();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.11 });
    setLenis(lenis);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);
    if (getStage() !== "ready") lenis.stop();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  // No scrolling while the opening sequence plays.
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (stage === "ready") lenis.start();
    else lenis.stop();
  }, [stage]);

  return null;
}
