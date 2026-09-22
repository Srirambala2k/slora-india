import Image from "next/image";
import styles from "./Brand.module.css";

/**
 * The four logo layers, stacked exactly where they sit in the original artwork so the
 * entrance can animate each one on its own: three bars of the "S" mark, then the wordmark.
 *
 * INTERIM: these are cut from a low-resolution raster. Replace with the official vector
 * logo when SLORA supplies it (plan §8 #2) — only this file needs to change.
 */
const LAYERS = [
  { key: "bar-1", src: "/images/logo/bar-1.webp" },
  { key: "bar-2", src: "/images/logo/bar-2.webp" },
  { key: "bar-3", src: "/images/logo/bar-3.webp" },
  { key: "wordmark", src: "/images/logo/wordmark.webp" },
] as const;

export function Brand() {
  return (
    <a href="#top" className={styles.brand} aria-label="SLORA, back to the top" data-brand>
      <span className={styles.box}>
        {LAYERS.map((layer) => (
          <Image
            key={layer.key}
            src={layer.src}
            alt=""
            width={960}
            height={368}
            priority
            unoptimized
            className={styles.layer}
            data-brand-layer={layer.key}
          />
        ))}
      </span>
    </a>
  );
}
