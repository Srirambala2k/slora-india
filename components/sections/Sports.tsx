"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SPORT_PANELS, type SportPanel } from "@/data/sports";
import { useCapability, useRailOverride } from "@/lib/device/capability";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaQuery, useReducedMotion } from "@/lib/hooks/useMediaQuery";
import { getLenis } from "@/lib/scroll/lenis";
import { askAboutSport } from "@/lib/sports/enquiry";
import {
  activePanel,
  parallaxShift,
  progressForPanel,
  railDistance,
  railLayout,
  sectionHeight,
  skewFromVelocity,
  trackOffset,
} from "@/lib/sports/rail";
import styles from "./Sports.module.css";

const COUNT = SPORT_PANELS.length;
const NOTE = "ILLUSTRATIVE PICTURES · WORDING TO BE CONFIRMED BY SLORA";

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * SPORTS (master prompt P§14, plan FX-10): seven large panels, one per category.
 *
 * On a desktop with a graphics card the section is pinned and scrolling slides the panels
 * sideways, with a slight lean that follows scroll speed and a gold progress line. On phones,
 * tablets, computers without a graphics card and for reduced-motion visitors it is a plain row
 * of cards that you swipe (native scroll-snap), which the browser scrolls without any script.
 *
 * The pictures are illustrative stand-ins and no applications or technical details are shown
 * until SLORA supplies verified ones (`data/sports.ts`).
 */
export function Sports() {
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 900px)");
  const tier = useCapability();
  const override = useRailOverride();
  const pinned = railLayout({ reduced, wide, tier, override }) === "pinned";
  // key: switching mode remounts the section, so no animation state is left behind
  return <SportsStage key={pinned ? "pinned" : "swipe"} pinned={pinned} reduced={reduced} />;
}

function SportsStage({ pinned, reduced }: { pinned: boolean; reduced: boolean }) {
  const wrapRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [warm, setWarm] = useState(false);

  /* Once the section is close to the screen, fetch every panel's picture, so none pops in late
     (lazy loading measures distance from the screen, not from where the row will slide to). */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof IntersectionObserver === "undefined") return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setWarm(true);
        near.disconnect();
      },
      { rootMargin: "150% 0px" },
    );
    near.observe(wrap);
    return () => near.disconnect();
  }, []);

  /* Pinned (desktop): one progress value slides the row, drifts the pictures and fills the line. */
  useGSAP(
    () => {
      if (!pinned) return;
      const wrap = wrapRef.current;
      const rail = railRef.current;
      const track = trackRef.current;
      if (!wrap || !rail || !track) return;
      const stage = wrap.firstElementChild as HTMLElement;
      const panels = Array.from(track.children) as HTMLElement[];
      const shifts = panels.map((panel) => panel.querySelector<HTMLElement>("[data-shift]"));
      const fill = wrap.querySelector<HTMLElement>("[data-fill]");

      let distance = 0;
      let gutter = 0;
      let railWidth = 0; // measured once: reading it every frame would force a layout after each move
      let lefts: number[] = [];
      let widths: number[] = [];
      const state = { p: 0, index: -1, skew: 0, velocity: 0, lastY: 0, dirty: true };

      /** Measure the row and size the tall section to match (runs before every refresh). */
      const measure = () => {
        railWidth = rail.clientWidth;
        gutter = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        lefts = panels.map((panel) => panel.offsetLeft);
        widths = panels.map((panel) => panel.offsetWidth);
        const last = panels.length - 1;
        const trackWidth = lefts[last] + widths[last] + gutter;
        distance = railDistance(trackWidth, railWidth);
        wrap.style.height = `${sectionHeight(distance, stage.offsetHeight)}px`;
        state.dirty = true;
      };
      measure();
      ScrollTrigger.addEventListener("refreshInit", measure);

      const trigger = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          state.p = self.progress;
          state.dirty = true;
        },
        onRefresh: (self) => {
          state.p = self.progress;
          state.dirty = true;
        },
      });

      const apply = () => {
        const offset = trackOffset(state.p, distance);
        track.style.transform = `translate3d(${offset}px,0,0) skewX(${state.skew.toFixed(3)}deg)`;
        const middle = railWidth / 2;
        panels.forEach((_, i) => {
          const shift = shifts[i];
          if (!shift) return;
          const centre = lefts[i] + widths[i] / 2 + offset;
          const x = parallaxShift(centre - middle, widths[i] * 0.07);
          shift.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        });
        if (fill) fill.style.transform = `scaleX(${state.p.toFixed(4)})`;
        const index = activePanel(lefts, widths, offset, railWidth);
        if (index !== state.index) {
          state.index = index;
          setActive(index);
        }
      };

      /* Only while the section is on screen: ease the lean towards the scroll speed and redraw. */
      // (Lenis knows the scroll position without asking the page, which would force a layout)
      const scrollNow = () => getLenis()?.scroll ?? window.scrollY;
      const tick = (_time: number, deltaTime: number) => {
        const y = scrollNow();
        const seconds = Math.max(deltaTime, 1) / 1000;
        state.velocity += ((y - state.lastY) / seconds - state.velocity) * 0.2;
        state.lastY = y;
        const target = skewFromVelocity(state.velocity);
        const next = state.skew + (target - state.skew) * 0.15;
        if (Math.abs(next - state.skew) > 0.002 || Math.abs(next) > 0.002) state.dirty = true;
        state.skew = Math.abs(next) < 0.002 ? 0 : next;
        if (!state.dirty) return;
        state.dirty = false;
        apply();
      };
      const visibility = ScrollTrigger.create({
        trigger: wrap,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          if (self.isActive) {
            state.lastY = scrollNow();
            gsap.ticker.add(tick);
          } else {
            gsap.ticker.remove(tick);
          }
        },
      });

      /* Keyboard: focusing a button on a panel that is off screen brings that panel into view. */
      const onFocusIn = (event: FocusEvent) => {
        const index = panels.findIndex((panel) => panel.contains(event.target as Node));
        if (index < 0) return;
        const box = panels[index].getBoundingClientRect();
        if (box.left >= 0 && box.right <= window.innerWidth) return; // already in view
        const p = progressForPanel(lefts[index], distance, gutter);
        const y = trigger.start + p * (trigger.end - trigger.start);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { duration: 0.9 });
        else window.scrollTo(0, y);
      };
      track.addEventListener("focusin", onFocusIn);

      apply();
      const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(refresh);
        track.removeEventListener("focusin", onFocusIn);
        ScrollTrigger.removeEventListener("refreshInit", measure);
        gsap.ticker.remove(tick);
        trigger.kill();
        visibility.kill();
      };
    },
    { scope: wrapRef, dependencies: [pinned] },
  );

  /* Swipe (phones, tablets, reduced motion): the browser scrolls; we only report where it is. */
  useGSAP(
    () => {
      if (pinned) return;
      const rail = railRef.current;
      const track = trackRef.current;
      const wrap = wrapRef.current;
      if (!rail || !track || !wrap) return;
      const fill = wrap.querySelector<HTMLElement>("[data-fill]");
      const panels = Array.from(track.children) as HTMLElement[];
      let frame = 0;
      const report = () => {
        frame = 0;
        const lefts = panels.map((panel) => panel.offsetLeft);
        const widths = panels.map((panel) => panel.offsetWidth);
        setActive(activePanel(lefts, widths, -rail.scrollLeft, rail.clientWidth));
        const room = rail.scrollWidth - rail.clientWidth;
        if (fill) fill.style.transform = `scaleX(${room > 0 ? rail.scrollLeft / room : 0})`;
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(report);
      };
      rail.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      report();
      return () => {
        cancelAnimationFrame(frame);
        rail.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    },
    { scope: wrapRef, dependencies: [pinned] },
  );

  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    const first = trackRef.current?.firstElementChild as HTMLElement | undefined;
    if (!rail || !first) return;
    const gap = parseFloat(getComputedStyle(trackRef.current!).columnGap) || 0;
    rail.scrollBy({
      left: direction * (first.offsetWidth + gap),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const current = SPORT_PANELS[Math.min(active, COUNT - 1)];

  return (
    <section
      id="sports"
      ref={wrapRef}
      className={pinned ? styles.tall : styles.swipe}
      aria-labelledby="sports-h"
    >
      <div className={styles.stage}>
        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>02 · SPORTS</p>
            <h2 id="sports-h" className={styles.title}>
              where every game is played
            </h2>
          </div>
          <p className={styles.note}>{NOTE}</p>
        </header>

        <div ref={railRef} className={styles.rail}>
          <ul ref={trackRef} className={styles.track}>
            {SPORT_PANELS.map((panel, i) => (
              <Panel key={panel.id} panel={panel} position={i} eager={warm} />
            ))}
          </ul>
        </div>

        <div className={styles.meter}>
          <p className={styles.count} aria-hidden="true">
            <b>{pad2(active + 1)}</b> / {pad2(COUNT)} · {current.name.toUpperCase()}
          </p>
          <span className={styles.hair} aria-hidden="true">
            <i className={styles.fill} data-fill />
          </span>
          {!pinned && (
            <div className={styles.arrows}>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => step(-1)}
                disabled={active === 0}
                aria-label="Previous sport"
              >
                <ArrowIcon back />
              </button>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => step(1)}
                disabled={active >= COUNT - 1}
                aria-label="Next sport"
              >
                <ArrowIcon />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Panel({
  panel,
  position,
  eager,
}: {
  panel: SportPanel;
  position: number;
  eager: boolean;
}) {
  const longest = Math.max(...panel.word.map((line) => line.length));
  const style = {
    "--len": longest,
    "--cap": panel.word.length === 1 ? 22 : 10,
  } as CSSProperties;
  return (
    <li
      className={styles.panel}
      style={style}
      aria-label={`${position + 1} of ${COUNT}: ${panel.name}`}
    >
      <div className={styles.media} aria-hidden="true">
        <div className={styles.mediaIn} data-shift>
          <Image
            src={panel.image.src}
            alt=""
            fill
            sizes="(min-width: 900px) 64vw, 84vw"
            loading={eager ? "eager" : "lazy"}
            className={styles.image}
            style={{
              objectPosition: panel.image.position,
              transform: panel.image.zoom ? `scale(${panel.image.zoom})` : undefined,
            }}
          />
        </div>
      </div>
      <div className={styles.wash} aria-hidden="true" />

      <p className={styles.index} aria-hidden="true">
        {panel.n}
      </p>
      <h3 className={styles.word} aria-label={panel.name}>
        {panel.word.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h3>

      <div className={styles.body}>
        <p className={styles.line}>{panel.line}</p>
        <span className={styles.rule} aria-hidden="true" />
        {panel.applications && (
          <p className={styles.fact}>APPLICATIONS · {panel.applications.value}</p>
        )}
        {panel.technical && <p className={styles.fact}>{panel.technical.value}</p>}
        <button
          type="button"
          className={styles.cta}
          onClick={() => askAboutSport(panel.requirement)}
        >
          Ask about {panel.name} <span aria-hidden="true">→</span>
        </button>
      </div>
    </li>
  );
}

function ArrowIcon({ back = false }: { back?: boolean }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={back ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M3 12h17M14 5.5 20.5 12 14 18.5" />
    </svg>
  );
}
