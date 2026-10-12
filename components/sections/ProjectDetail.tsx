"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/data/projects";
import { PROJECTS_NOTE } from "@/data/projects";
import { openChat } from "@/lib/chat/store";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";
import { getLenis } from "@/lib/scroll/lenis";
import styles from "./ProjectDetail.module.css";

const FOCUSABLE = 'button, [href], video[controls], [tabindex]:not([tabindex="-1"])';

/**
 * The project detail view: the current clip in a big player, a strip of thumbnails to pick
 * another, and the project's text. It sits above the page (and the header) but below the chat,
 * so "Enquire" can open the chat without closing it. While open the page behind does not scroll,
 * Esc closes, ← → change clip, Tab stays inside, and focus returns to the card on close.
 */
export function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = project.clips.length;
  const clip = project.clips[index];

  const step = useCallback((by: number) => setIndex((i) => (i + by + count) % count), [count]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    getLenis()?.stop();
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "Tab" && dialogRef.current) {
        const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = overflow;
      getLenis()?.start();
      // back to the card that was clicked (the opener may be gone if the page was deep-linked)
      const card = document.querySelector<HTMLElement>(`[data-project="${project.id}"]`);
      (opener && opener !== document.body && document.contains(opener) ? opener : card)?.focus();
    };
  }, [onClose, step, project.id]);

  return (
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.name} project`}
        className={styles.dialog}
      >
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          CLOSE <span aria-hidden="true">✕</span>
        </button>

        <div className={styles.stage}>
          <div className={styles.player} data-portrait={clip.portrait || undefined}>
            <video
              key={clip.src}
              className={styles.video}
              src={clip.src}
              poster={clip.poster}
              autoPlay={!reduced}
              muted
              loop
              playsInline
              controls
              preload="metadata"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.prev}`}
                  aria-label="Previous clip"
                  onClick={() => step(-1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.next}`}
                  aria-label="Next clip"
                  onClick={() => step(1)}
                >
                  →
                </button>
              </>
            )}
          </div>

          {count > 1 && (
            <ul className={styles.thumbs} aria-label="Clips in this project">
              {project.clips.map((item, i) => (
                <li key={item.src}>
                  <button
                    type="button"
                    className={styles.thumb}
                    aria-label={`Clip ${i + 1} of ${count}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => setIndex(i)}
                  >
                    <Image
                      src={item.poster}
                      alt=""
                      fill
                      sizes="120px"
                      className={styles.thumbImg}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.eyebrow}>
            {project.n} · {project.kind}
          </p>
          <h3 className={styles.name}>{project.name}</h3>
          <p className={styles.summary}>{project.summary}</p>

          {project.facts.length > 0 && (
            <dl className={styles.facts}>
              {project.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className={styles.counter}>
            CLIP {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </p>
          <p className={styles.note}>{PROJECTS_NOTE}</p>

          <button type="button" className={styles.enquire} onClick={() => openChat(project.name)}>
            Enquire about a project like this
          </button>
        </div>
      </div>
    </div>
  );
}
