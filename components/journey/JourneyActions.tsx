"use client";

import { openChat } from "@/lib/chat/store";
import { contactLinks } from "@/lib/contact";
import styles from "./JourneyActions.module.css";

/**
 * The "Enquire" + "Connect on WhatsApp" pair shown with the two lines of the opening scroll ("Every Game Begins with the Ground" and the SLORA statement), NOT with the hero headline.
 * Enquire opens the enquiry chat; WhatsApp opens a chat with SLORA's number (read in one place,
 * `lib/whatsapp`) with a greeting already typed. With no number configured only Enquire shows.
 * Solid gold + a lighter tinted partner, like the other button pairs on the site.
 */
export function JourneyActions() {
  const { whatsappHref } = contactLinks();
  return (
    <div className={styles.actions}>
      <button type="button" className={styles.primary} onClick={() => openChat()}>
        Enquire
      </button>
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondary}
        >
          Connect on WhatsApp
        </a>
      )}
    </div>
  );
}
