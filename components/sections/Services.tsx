"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { SERVICES, SERVICES_NOTE } from "@/data/services";
import { openChat } from "@/lib/chat/store";
import { contactLinks } from "@/lib/contact";
import { useCapability } from "@/lib/device/capability";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaQuery, useReducedMotion } from "@/lib/hooks/useMediaQuery";
import { servicePositions } from "@/lib/services/scroll";
import styles from "./Services.module.css";

/** How tall the pinned section is on desktop, in screen heights (a screen per service, plus one). */
const SCREENS = SERVICES.length + 1;

/** The WhatsApp link for one service, opening a chat that already names it (null with no number). */
const whatsappHref = (title: string) =>
  contactLinks(undefined, `Hi SLORA, I'd like to know more about: ${title}.`).whatsappHref;

/**
 * SERVICES WE PROVIDE, step by step: the four services one after another. On a wide screen with a
 * real graphics card the section pins and scrolling crossfades the pictures (each drifting
 * slowly) while the words slide through; everywhere else it is four plain stacked cards. Only
 * opacity and transform change per frame, and the scroll value comes straight from ScrollTrigger
 * (which Lenis drives) with no extra smoothing on top. Same gating idea as the Sports rail.
 */
export function Services() {
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 900px)");
  const tier = useCapability();
  const pinned = !reduced && wide && tier === "full";
  return <ServiceStage key={pinned ? "pinned" : "stacked"} pinned={pinned} />;
}

function ServiceStage({ pinned }: { pinned: boolean }) {
  const wrapRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!pinned) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const q = gsap.utils.selector(wrap);
      const pictures = q("[data-picture]") as HTMLElement[];
      const words = q("[data-words]") as HTMLElement[];
      const bar = q("[data-bar]")[0] as HTMLElement;
      const state = { progress: 0, dirty: true, index: -1 };

      const trigger = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          state.progress = self.progress;
          state.dirty = true;
        },
        onRefresh: (self) => {
          state.progress = self.progress;
          state.dirty = true;
        },
      });

      const apply = (p: number) => {
        const { x, pictures: pic, words: txt } = servicePositions(p, SERVICES.length);
        pictures.forEach((el, i) => {
          el.style.opacity = String(pic[i].opacity);
          el.style.transform = `scale(${pic[i].scale})`;
        });
        words.forEach((el, i) => {
          el.style.opacity = String(txt[i].opacity);
          el.style.transform = `translate3d(0, ${txt[i].y}px, 0)`;
          el.style.visibility = txt[i].opacity > 0.01 ? "visible" : "hidden";
        });
        bar.style.transform = `scaleX(${p})`;
        const index = Math.round(x);
        if (index !== state.index) {
          state.index = index;
          setActive(index);
        }
      };

      const tick = () => {
        if (!state.dirty) return;
        state.dirty = false;
        apply(state.progress);
      };
      gsap.ticker.add(tick);
      const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(refresh);
        gsap.ticker.remove(tick);
        trigger.kill();
      };
    },
    { scope: wrapRef, dependencies: [pinned] },
  );

  return (
    <section
      id="process"
      ref={wrapRef}
      className={pinned ? styles.tall : styles.simple}
      style={pinned ? { height: `${SCREENS * 100}svh` } : undefined}
      aria-labelledby="services-h"
    >
      <div className={pinned ? styles.stage : styles.simpleStage}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>04 · PROCESS</p>
          <h2 id="services-h" className={styles.sr}>
            Our services, step by step
          </h2>
        </header>

        {pinned && (
          <div className={styles.pictures} aria-hidden="true">
            {SERVICES.map((service, i) => (
              <div key={service.id} className={styles.picture} data-picture style={{ zIndex: i }}>
                <Image
                  src={service.image.src}
                  alt=""
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className={styles.img}
                />
              </div>
            ))}
            <div className={styles.veil} />
          </div>
        )}

        <ol className={styles.steps}>
          {SERVICES.map((service, i) => (
            <li
              key={service.id}
              className={styles.step}
              data-words
              aria-current={pinned && i === active ? "step" : undefined}
            >
              {!pinned && (
                <div className={styles.cardPicture}>
                  <Image
                    src={service.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 600px) 44rem, 100vw"
                    className={styles.img}
                  />
                </div>
              )}
              <div className={styles.words}>
                <span className={styles.num}>{service.n}</span>
                <h3 className={styles.title}>{service.title}</h3>
                <span className={styles.rule} aria-hidden="true" />
                <p className={styles.text}>{service.text}</p>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => openChat(service.title)}
                  >
                    Enquire
                  </button>
                  {whatsappHref(service.title) && (
                    <a
                      href={whatsappHref(service.title) ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.secondary}
                    >
                      Connect on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {pinned && (
          <div className={styles.progress} aria-hidden="true">
            <span className={styles.count}>
              {String(active + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
            </span>
            <span className={styles.track}>
              <i className={styles.bar} data-bar />
            </span>
          </div>
        )}
        <p className={styles.note}>{SERVICES_NOTE}</p>
      </div>
    </section>
  );
}
