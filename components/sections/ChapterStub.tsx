import styles from "./ChapterStub.module.css";

interface ChapterStubProps {
  id: string;
  n: string;
  label: string;
}

/**
 * A clearly-labelled placeholder for a chapter that is not built yet, so the menu has
 * somewhere to go and the page has its final rhythm. Replaced section by section.
 */
export function ChapterStub({ id, n, label }: ChapterStubProps) {
  return (
    <section id={id} className={styles.stub} aria-labelledby={`${id}-h`}>
      <p className={styles.n}>{n}</p>
      <h2 id={`${id}-h`} className={styles.word}>
        {label.toLowerCase()}
      </h2>
      <p className={styles.note}>IN BUILD · THIS CHAPTER COMES IN A LATER STEP</p>
    </section>
  );
}
