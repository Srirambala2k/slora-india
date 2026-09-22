"use client";

import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand/Brand";
import { NAV_ITEMS } from "@/data/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaQuery, useReducedMotion } from "@/lib/hooks/useMediaQuery";
import { openChat } from "@/lib/chat/store";
import { getLenis } from "@/lib/scroll/lenis";
import { useStage } from "@/lib/stage";
import styles from "./Header.module.css";

const SECTION_IDS = [
  "top",
  ...NAV_ITEMS.map((item) => item.id),
  "surface-cards",
  "contact",
] as const;

/** Sections that belong to a menu item without being that item's own anchor. */
const NAV_GROUP: Record<string, string> = {
  "surface-cards": "surfaces",
  "surface-layers": "surfaces",
};

/**
 * Which section is under the middle of the screen (for the gold indicator). Sections can
 * nest (the pinned journey contains the "Surfaces" anchor), so when several are active the
 * one that starts latest wins, i.e. the innermost.
 */
function useActiveSection(layoutKey: string): string {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const entries: Array<{ id: string; st: ScrollTrigger }> = [];
    const update = () => {
      const current = entries
        .filter((entry) => entry.st.isActive)
        .sort((a, b) => b.st.start - a.st.start)[0];
      if (current) setActive(NAV_GROUP[current.id] ?? current.id);
    };
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: update,
      });
      entries.push({ id, st });
    }
    update();
    return () => entries.forEach((entry) => entry.st.kill());
  }, [layoutKey]);
  return active;
}

export function Header() {
  const rootRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const stage = useStage();
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 900px)");
  // The sections on the page change shape when the layout mode does (and once the page is
  // ready), so the highlight tracking is re-created then.
  const active = useActiveSection(`${stage}-${wide}-${reduced}`);

  // The menu and buttons wait for the logo to dock, then fade in one after another.
  useGSAP(
    () => {
      if (reduced) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", rootRef.current);
      if (stage === "entering") gsap.set(items, { opacity: 0, y: -14 });
      else
        gsap.fromTo(
          items,
          { opacity: 0, y: -14 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, delay: 0.35, ease: "power3.out" },
        );
    },
    { scope: rootRef, dependencies: [stage, reduced] },
  );

  // Thin gold line along the bottom of the header showing how far down the page you are.
  useGSAP(
    () => {
      if (reduced) return;
      gsap.to("[data-progress]", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
      });
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  // Mobile menu: lock page scroll while open, close on Escape, return focus to the button.
  useEffect(() => {
    if (!menuOpen) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const button = menuButtonRef.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      button?.focus();
    };
  }, [menuOpen]);

  return (
    <header ref={rootRef} className={styles.header}>
      <Brand />

      <nav aria-label="Primary" className={styles.nav} data-reveal>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={styles.link}
                aria-current={active === item.id ? "true" : undefined}
              >
                <span className={styles.num}>{item.n}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.actions}>
        <a href="#contact" className={styles.contact} data-reveal>
          CONTACT →
        </a>
        <button type="button" className={styles.cta} onClick={() => openChat()} data-reveal>
          BUILD WITH SLORA →
        </button>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          data-reveal
        >
          {menuOpen ? "CLOSE" : "MENU"}
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className={styles.menu} role="dialog" aria-label="Menu">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={() => setMenuOpen(false)}>
                  <span className={styles.menuNum}>{item.n}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={styles.menuCta}
            onClick={() => {
              setMenuOpen(false);
              openChat();
            }}
          >
            BUILD WITH SLORA →
          </button>
        </div>
      )}

      <span className={styles.progress} data-progress aria-hidden="true" />
    </header>
  );
}
