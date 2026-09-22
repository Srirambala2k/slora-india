import { INSTAGRAM_URL } from "@/data/contact";
import styles from "./InstagramLink.module.css";

/** SLORA's Instagram, as a small round icon link. Used in the hero and in About. */
export function InstagramLink({ className }: { className?: string }) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.link} ${className ?? ""}`}
      aria-label="SLORA on Instagram (opens in a new tab)"
    >
      <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    </a>
  );
}
