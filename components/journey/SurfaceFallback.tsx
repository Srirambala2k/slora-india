"use client";

import Image from "next/image";
import { useRef } from "react";
import { stills } from "@/data/media";
import { LAYERS } from "@/data/turf";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";
import styles from "./SurfaceFallback.module.css";

/**
 * The "Surfaces" chapter for phones, reduced-motion visitors, data-savers and devices
 * without WebGL (master prompt P§40): a macro-grass still and a drawn cross-section of the
 * layers. Same story as the 3D version, at a fraction of the cost.
 *
 * ILLUSTRATIVE: layer names and order only, no measurements.
 */
export function SurfaceFallback({ id = "surfaces" }: { id?: string }) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) {
        // `useReducedMotion` can briefly report `false` right after hydration before correcting
        // itself. If that happened, gsap.from() below already rendered its "from" values
        // (opacity: 0) immediately, so make sure no band is left stuck invisible.
        gsap.set("[data-band]", { clearProps: "opacity,transform" });
        return;
      }
      gsap.from("[data-band]", {
        opacity: 0,
        x: -28,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: listRef.current, start: "top 82%" },
      });
    },
    { scope: listRef, dependencies: [reduced] },
  );

  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-h`}>
      <div className={styles.media} aria-hidden="true">
        <Image src={stills["macro-grass"].src} alt="" fill sizes="100vw" className={styles.image} />
      </div>
      <p className={styles.eyebrow}>01</p>
      <h2 id={`${id}-h`} className={styles.title}>
        the layers beneath
      </h2>
      <ol ref={listRef} className={styles.stack}>
        {LAYERS.map((layer) => (
          <li key={layer.id} className={`${styles.band} ${styles[layer.id]}`} data-band>
            <span className={styles.bandLabel}>
              <b>{layer.n}</b>
              {layer.label}
            </span>
          </li>
        ))}
      </ol>
      <p className={styles.note}>ILLUSTRATIVE · NOT TO SCALE</p>
    </section>
  );
}
