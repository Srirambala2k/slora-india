"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { VideoSlot } from "@/components/media/VideoSlot";
import { WatermarkCover } from "@/components/media/WatermarkCover";
import type { SurfaceCard } from "@/data/surfaces";
import { askAboutCard } from "@/lib/cards/enquiry";
import { wordScale, wordScaleNarrow } from "@/lib/cards/carousel";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";
import styles from "./EditorialCard.module.css";

interface EditorialCardProps {
  card: SurfaceCard;
  /** Design-preview only: draw bracketed placeholders where verified data would go. */
  placeholders?: boolean;
  /** Load the picture now even though the card is off screen (cards waiting in the carousel). */
  eager?: boolean;
}

/**
 * An editorial surface card (master prompt P§13, plan FX-01/03/05/08):
 *
 *   hover → image expands → the giant word moves → a gold line draws → info reveals → CTA appears
 *
 * plus a gold light that follows the pointer along the card's edge, a cursor label that
 * follows the pointer, gentle depth movement, and a reveal as the card scrolls into view.
 * Pointer effects run only with a real mouse; touch screens see the finished state, and
 * reduced-motion visitors get no movement.
 */
const COURT_TONES = { blue: styles.courtBlue, teal: styles.courtTeal, clay: styles.courtClay };

export function EditorialCard({ card, placeholders = false, eager = false }: EditorialCardProps) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      if (reduced) {
        // `useReducedMotion` can briefly report `false` right after hydration before correcting
        // itself. If that happened, the fromTo()/from() below already rendered their "from"
        // values (a cropped clip-path, a zoomed-in picture) immediately, so undo that explicitly.
        gsap.set(root, { clearProps: "clipPath" });
        gsap.set("[data-media-in]", { clearProps: "transform" });
        return;
      }

      // FX-05: the card wipes open as it scrolls into view.
      gsap.fromTo(
        root,
        { clipPath: "inset(12% 5% 12% 5%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.3,
          ease: "expo.out",
          scrollTrigger: { trigger: root, start: "top 82%", once: true },
          onComplete: () => gsap.set(root, { clearProps: "clipPath" }),
        },
      );
      gsap.from("[data-media-in]", {
        scale: 1.28,
        duration: 1.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 82%", once: true },
      });

      // Everything below needs a real pointer (not touch).
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const cursor = root.querySelector<HTMLElement>("[data-cursor]");
        // Depth movement drives two plain-number CSS variables (--px / --py) that the stylesheet
        // turns into pixels for the separate `translate` property, so it never fights the hover transforms.
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", root).map((el) => ({
          depth: Number(el.dataset.depth),
          x: gsap.quickTo(el, "--px", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(el, "--py", { duration: 0.9, ease: "power3.out" }),
        }));
        const cx = cursor
          ? gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" })
          : null;
        const cy = cursor
          ? gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" })
          : null;
        let frame = 0;

        const onMove = (event: PointerEvent) => {
          const box = root.getBoundingClientRect();
          const x = event.clientX - box.left;
          const y = event.clientY - box.top;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            // FX-03: the gold edge light and the soft spotlight follow the pointer
            root.style.setProperty("--mx", `${x}px`);
            root.style.setProperty("--my", `${y}px`);
            // FX-08: the cursor label
            cx?.(x);
            cy?.(y);
            // depth: layers drift a little against the pointer, the nearest the most
            const nx = x / box.width - 0.5;
            const ny = y / box.height - 0.5;
            layers.forEach((l) => {
              l.x(-nx * l.depth);
              l.y(-ny * l.depth);
            });
          });
        };
        const onEnter = (event: PointerEvent) => {
          const box = root.getBoundingClientRect();
          if (cursor) gsap.set(cursor, { x: event.clientX - box.left, y: event.clientY - box.top });
          root.classList.add(styles.live);
        };
        const onLeave = () => {
          root.classList.remove(styles.live);
          layers.forEach((l) => {
            l.x(0);
            l.y(0);
          });
        };

        root.addEventListener("pointerenter", onEnter);
        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
        return () => {
          cancelAnimationFrame(frame);
          root.removeEventListener("pointerenter", onEnter);
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
          root.classList.remove(styles.live);
        };
      });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  const specText = card.spec?.value ?? (placeholders ? "[ VERIFIED SPEC ]" : null);
  const areaText = card.area?.value ?? (placeholders ? "[ AREA ]" : null);

  return (
    <article
      ref={rootRef}
      className={styles.card}
      style={
        {
          "--wordscale": wordScale(card.word),
          "--wordscale-narrow": wordScaleNarrow(card.word),
        } as CSSProperties
      }
    >
      <div className={styles.media} data-depth="10">
        <div className={styles.mediaIn} data-media-in>
          {card.video ? (
            <VideoSlot id={card.video} eager={eager} className={`h-full w-full ${styles.video}`}>
              {/* the ✦ mark baked into the stand-in footage; see lib/media/watermark.ts */}
              <WatermarkCover radius={17} className={styles.dot} />
            </VideoSlot>
          ) : (
            <Image
              src={card.image.src}
              alt=""
              fill
              sizes="(min-width: 1400px) 1400px, 100vw"
              loading={eager ? "eager" : "lazy"}
              className={styles.image}
            />
          )}
        </div>
      </div>
      <div className={styles.wash} aria-hidden="true" />
      <div className={styles.spot} aria-hidden="true" />

      <p className={`${styles.mono} ${styles.index}`}>{card.n}</p>
      {specText && <p className={`${styles.mono} ${styles.spec}`}>{specText}</p>}

      <div className={styles.word} aria-hidden="true" data-depth="18" data-word>
        <span>{card.word[0]}</span>
        <span>{card.word[1]}</span>
      </div>

      <div className={styles.shadow} aria-hidden="true" data-depth="30" />
      <div className={styles.slab} aria-hidden="true" data-depth="30" data-slab>
        {card.slab.kind === "turf" ? (
          <>
            <span className={styles.fibre}>
              <i>FIBRE</i>
            </span>
            <span className={styles.infill}>
              <i>INFILL</i>
            </span>
            <span className={styles.backing}>
              <i>BACKING</i>
            </span>
          </>
        ) : (
          <span className={`${styles.court} ${COURT_TONES[card.slab.tone]}`}>
            <i>SURFACE</i>
          </span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className="sr-only">{card.label}</h3>
        <p className={styles.thin}>
          {card.line[0]}
          <br />
          {card.line[1]}
        </p>
        <span className={styles.rule} />
        <p className={`${styles.mono} ${styles.info}`}>{card.info}</p>
        <span className={`${styles.mono} ${styles.cta}`} aria-hidden="true">
          → EXPLORE
        </span>
        <button type="button" className={styles.connect} onClick={() => askAboutCard(card)}>
          Connect with us
        </button>
      </div>
      {areaText && <p className={`${styles.mono} ${styles.area}`}>{areaText}</p>}

      <span className={styles.cursor} data-cursor aria-hidden="true">
        <span className={`${styles.mono} ${styles.bubble}`}>EXPLORE</span>
      </span>

      {/* the whole card is one link (also gives keyboard focus the hover state) */}
      <a href={card.href} className={styles.link} aria-label={`${card.label}: explore`} />
    </article>
  );
}
