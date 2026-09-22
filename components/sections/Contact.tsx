import { CONTACT_ADDRESS_LINES, GOOGLE_MAPS_URL } from "@/data/contact";
import { contactLinks } from "@/lib/contact";
import styles from "./Contact.module.css";

/**
 * CONTACT: SLORA's real address (as a small map card that opens Google Maps) and phone number,
 * with separate WhatsApp and Call buttons. Details supplied directly by SLORA (2026-09-22).
 */
export function Contact() {
  const links = contactLinks();

  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-h">
      <p className={styles.eyebrow}>07 · CONTACT</p>
      <h2 id="contact-h" className={styles.heading}>
        <span className={styles.thin}>get in</span>
        <span className={styles.heavy}>touch.</span>
      </h2>

      <div className={styles.grid}>
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapCard}
          aria-label={`Open SLORA's address in Google Maps: ${CONTACT_ADDRESS_LINES.join(", ")}`}
        >
          <span className={styles.mapGrid} aria-hidden="true" />
          <span className={styles.pin} aria-hidden="true">
            <svg viewBox="0 0 24 32" className={styles.pinIcon}>
              <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12Z" />
              <circle cx="12" cy="12" r="4.5" className={styles.pinDot} />
            </svg>
          </span>
          <address className={styles.address}>
            {CONTACT_ADDRESS_LINES.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <span className={styles.mapCta}>OPEN IN GOOGLE MAPS →</span>
        </a>

        <div className={styles.phoneCard}>
          <p className={styles.phoneLabel}>CALL OR MESSAGE US</p>
          <p className={styles.phoneNumber}>{links.display ?? "Number pending from SLORA"}</p>
          {(links.whatsappHref || links.telHref) && (
            <div className={styles.phoneActions}>
              {links.whatsappHref && (
                <a
                  href={links.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsapp}
                >
                  WhatsApp
                </a>
              )}
              {links.telHref && (
                <a href={links.telHref} className={styles.call}>
                  Call
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
