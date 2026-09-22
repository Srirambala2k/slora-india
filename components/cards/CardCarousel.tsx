"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { EditorialCard } from "@/components/cards/EditorialCard";
import type { SurfaceCard } from "@/data/surfaces";
import { directionBetween, nextIndex, prevIndex } from "@/lib/cards/carousel";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";
import styles from "./CardCarousel.module.css";

/** Circumference of the progress ring drawn around the arrow (radius 43). */
const RING_LENGTH = 2 * Math.PI * 43;

/** A swipe must travel this far sideways (and mostly sideways) to count. */
const SWIPE_PX = 48;

interface CardCarouselProps {
  cards: readonly SurfaceCard[];
  /** What the deck is called, for screen readers. */
  label: string;
  /** Said on screen under the deck, e.g. that the pictures are stand-ins. */
  note?: string;
}

/**
 * The surface cards as a deck: an arrow on the right side moves on to the next card (Football →
 * Pickleball → Shuttle court → Park setup → Basketball → back to Football), an arrow on the left
 * appears once there is somewhere to go back to, and a row of names underneath jumps straight to
 * any card. Touch screens can swipe and the keyboard's arrow keys work too.
 *
 * Every card is the full editorial card (all its hover effects intact); only the one in view can
 * be focused or read out (`inert` on the others).
 */
export function CardCarousel({ cards, label, note }: CardCarouselProps) {
  const reduced = useReducedMotion();
  const count = cards.length;
  const [index, setIndex] = useState(0);
  const [warm, setWarm] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef(0); // the card the track last moved to
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  const goTo = (to: number) => setIndex(Math.max(0, Math.min(count - 1, to)));
  const goNext = () => setIndex((i) => nextIndex(i, count));
  const goPrev = () => setIndex((i) => prevIndex(i, count));

  /* Once the deck is close to the screen, fetch the pictures of the cards waiting behind the
     first one, so a click never shows an empty card. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setWarm(true);
        near.disconnect();
      },
      { rootMargin: "120% 0px" },
    );
    near.observe(root);
    return () => near.disconnect();
  }, []);

  /* Move the track, and bring the newcomer's giant word, picture and slab in. */
  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const from = shownRef.current;
      shownRef.current = index;
      const target = -index * 100;
      if (reduced || from === index) {
        gsap.set(track, { xPercent: target });
        return;
      }

      const steps = Math.abs(index - from);
      const direction = directionBetween(from, index, count);
      gsap.to(track, {
        xPercent: target,
        duration: 0.9 + 0.12 * Math.min(steps, 4),
        ease: "expo.inOut",
        overwrite: true,
      });

      const slide = track.children[index] as HTMLElement | undefined;
      if (!slide) return;
      // (the two lines of the word are animated, not the word box: that box has hover
      // transforms of its own in the stylesheet)
      const lines = slide.querySelectorAll("[data-word] > span");
      const picture = slide.querySelector("[data-media-in]");
      const slab = slide.querySelector("[data-slab]");
      gsap.fromTo(
        lines,
        { xPercent: direction * 24 },
        {
          xPercent: 0,
          duration: 1.4,
          ease: "power4.out",
          stagger: 0.09,
          delay: 0.15,
          clearProps: "transform",
        },
      );
      if (picture)
        gsap.fromTo(picture, { scale: 1.16 }, { scale: 1, duration: 1.7, ease: "power3.out" });
      if (slab) gsap.fromTo(slab, { opacity: 0 }, { opacity: 1, duration: 0.9, delay: 0.35 });
    },
    { scope: rootRef, dependencies: [index, reduced] },
  );

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") goNext();
    else if (event.key === "ArrowLeft") goPrev();
  };

  /* Swiping is for touch and pen; a mouse has the arrows. */
  const onPointerDown = (event: PointerEvent) => {
    swipeRef.current =
      event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const upcoming = cards[nextIndex(index, count)];
  const ringOffset = RING_LENGTH * (1 - (index + 1) / count);

  return (
    <div
      ref={rootRef}
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage}>
        <div
          className={styles.viewport}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipeRef.current = null;
          }}
        >
          <div ref={trackRef} className={styles.track}>
            {cards.map((card, i) => (
              <div
                key={card.id}
                className={styles.slide}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}: ${card.label}`}
                inert={i !== index}
              >
                <EditorialCard card={card} eager={warm || i === 0} />
              </div>
            ))}
          </div>
        </div>

        {/* the back arrow only appears once there is a card to go back to */}
        <button
          type="button"
          className={`${styles.arrow} ${styles.prev}`}
          onClick={goPrev}
          disabled={index === 0}
          aria-hidden={index === 0 ? true : undefined}
          aria-label={index === 0 ? "Previous card" : `Previous: ${cards[index - 1].label}`}
        >
          <ArrowIcon back />
        </button>
        {/* the arrow on the right: on to the next card */}
        <button
          type="button"
          className={`${styles.arrow} ${styles.next}`}
          onClick={goNext}
          aria-label={`Next: ${upcoming.label}`}
        >
          <svg className={styles.ring} viewBox="0 0 88 88" aria-hidden="true">
            <circle
              className={styles.ringArc}
              cx="44"
              cy="44"
              r="43"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <ArrowIcon />
        </button>
      </div>

      <div className={styles.pager}>
        <ol className={styles.pips}>
          {cards.map((card, i) => (
            <li key={card.id}>
              <button
                type="button"
                className={styles.pip}
                onClick={() => goTo(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={`Show ${card.label}`}
              >
                <span className={styles.pipN}>{card.n}</span>
                <span className={styles.pipName}>{card.label}</span>
              </button>
            </li>
          ))}
        </ol>
        {note && <p className={styles.note}>{note}</p>}
      </div>

      {/* tells screen readers which card is showing after each move */}
      <p className="sr-only" aria-live="polite">
        {cards[index].label}, {index + 1} of {count}
      </p>
    </div>
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
