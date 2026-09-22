import { CardCarousel } from "@/components/cards/CardCarousel";
import { SURFACE_CARDS } from "@/data/surfaces";
import styles from "./SurfaceCards.module.css";

/**
 * The "Surfaces" cards that follow the scroll journey: Football first, then an arrow on the
 * right moves on through pickleball, shuttle court, park setup and basketball.
 */
export function SurfaceCards() {
  return (
    <section id="surface-cards" className={styles.section} aria-labelledby="surface-cards-h">
      <p className={styles.eyebrow}>01 · SURFACES</p>
      <h2 id="surface-cards-h" className={styles.title}>
        surfaces for every game
      </h2>
      <CardCarousel
        cards={SURFACE_CARDS}
        label="Surface cards"
        note="ILLUSTRATIVE PICTURES · TO BE REPLACED WITH SLORA'S OWN PHOTOS"
      />
    </section>
  );
}
