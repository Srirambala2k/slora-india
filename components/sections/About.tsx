"use client";

import { useRef } from "react";
import {
  ABOUT_PARAGRAPHS,
  FOUNDED_YEAR,
  LEAD_LINE,
  PROJECTS_STAT,
  type TextRun,
} from "@/data/about";
import { InstagramLink } from "@/components/contact/InstagramLink";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/data/contact";
import { contactLinks } from "@/lib/contact";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";
import { openChat } from "@/lib/chat/store";
import styles from "./About.module.css";

function Runs({ runs }: { runs: readonly TextRun[] }) {
  return (
    <>
      {runs.map((run, i) => {
        if (run.brand) {
          return (
            <strong key={i} className={styles.brand}>
              {run.text}
            </strong>
          );
        }
        return run.strong ? <strong key={i}>{run.text}</strong> : <span key={i}>{run.text}</span>;
      })}
    </>
  );
}

/**
 * ABOUT: the founder story, supplied by SLORA (2026-09-22) — the first real (not illustrative)
 * content on the site, alongside Contact. Three ways to act on it: jump to Contact (address +
 * phone), message SLORA on WhatsApp directly, or open the enquiry chat to start a project.
 */
export function About() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const links = contactLinks();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (reduced) {
        // See the note in Engineering's history (plan): `useReducedMotion` can briefly report
        // `false` right after hydration before correcting itself. If that happened, the
        // animation below already rendered its "from" state (invisible), so undo that here too.
        gsap.set("[data-reveal-in]", { clearProps: "opacity,transform" });
        return;
      }
      gsap.from("[data-reveal-in]", {
        opacity: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <section id="about" ref={rootRef} className={styles.section} aria-labelledby="about-h">
      <div className={styles.grid}>
        <div className={styles.copy}>
          <p className={styles.eyebrow} data-reveal-in>
            06 · ABOUT
          </p>
          <h2 id="about-h" className={styles.heading} data-reveal-in>
            <span className={styles.thin}>New Name</span>
            <span className={styles.heavy}>PROVEN EXPERIENCE.</span>
          </h2>
          <p className={styles.lead} data-reveal-in>
            {LEAD_LINE}
          </p>
          {ABOUT_PARAGRAPHS.map((runs, i) => (
            <p className={styles.paragraph} data-reveal-in key={i}>
              <Runs runs={runs} />
            </p>
          ))}

          <div className={styles.actions} data-reveal-in>
            <a href="#contact" className={styles.primary}>
              Contact us →
            </a>
            {links.whatsappHref && (
              <a
                href={links.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondary}
              >
                WhatsApp
              </a>
            )}
            <button type="button" className={styles.secondary} onClick={() => openChat()}>
              Enquire
            </button>
          </div>

          <div className={styles.social} data-reveal-in>
            <InstagramLink />
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.handle}
            >
              {INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>

        <aside className={styles.stats} data-reveal-in aria-label="SLORA in numbers">
          <div className={styles.stat}>
            <p className={styles.statNumber}>{PROJECTS_STAT}</p>
            <p className={styles.statCaption}>Projects executed</p>
          </div>
          <span className={styles.statDivider} aria-hidden="true" />
          <div className={styles.stat}>
            <p className={styles.statNumber}>{FOUNDED_YEAR}</p>
            <p className={styles.statCaption}>Founded</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
