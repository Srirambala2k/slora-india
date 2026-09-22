"use client";

import { useEffect, useRef, useState } from "react";
import { GOOGLE_MAPS_URL } from "@/data/contact";
import { contactLinks } from "@/lib/contact";
import styles from "./ContactPopover.module.css";

/**
 * The hero's "🗺️ CONTACT US" button: opens a small menu with the three ways to reach SLORA —
 * WhatsApp, a phone call, and the address on Google Maps. WhatsApp/Call are left out of the
 * menu if no number is configured (never a dead or fabricated link); the map link always works.
 */
interface ContactPopoverProps {
  className?: string;
  /** Open the menu above the button instead of below (for a trigger that sits low on screen,
   * where a downward menu would be clipped by a pinned section's `overflow: hidden`). */
  openUpward?: boolean;
}

export function ContactPopover({ className, openUpward = false }: ContactPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const links = contactLinks();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`${styles.root} ${className ?? ""}`}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🗺️</span> CONTACT US
      </button>
      {open && (
        <div className={`${styles.menu} ${openUpward ? styles.up : ""}`} role="menu">
          {links.whatsappHref && (
            <a href={links.whatsappHref} target="_blank" rel="noopener noreferrer" role="menuitem">
              WhatsApp
            </a>
          )}
          {links.telHref && (
            <a href={links.telHref} role="menuitem">
              Call {links.display}
            </a>
          )}
          <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" role="menuitem">
            View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
