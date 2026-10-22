"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback } from "react";
import { PROJECTS, projectById } from "@/data/projects";
import { goToCrossLink, projectHash, useCrossLinkTarget } from "@/lib/links/crossLink";
import styles from "./Projects.module.css";

/** The detail view (a video player and a thumbnail strip) only downloads once a card is opened. */
const ProjectDetail = dynamic(() => import("./ProjectDetail").then((m) => m.ProjectDetail), {
  ssr: false,
});

/**
 * PROJECTS ("our work"): one card per project, drawn from SLORA's own footage. A card opens a
 * detail view with every clip of the project. The address bar is the state (`#projects/<id>`,
 * the same scheme as the surface ↔ sport links in `lib/links/crossLink.ts`), so a project can
 * be shared, the back button closes it, and a fresh page load on that link opens it directly.
 */
export function Projects() {
  const openId = useCrossLinkTarget("projects");
  const open = openId ? projectById(openId) : undefined;

  const close = useCallback(() => {
    // Drop the id but stay on the section; `replaceState` fires no event, so announce it.
    window.history.replaceState(null, "", "#projects");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  return (
    <section id="projects" className={styles.section} aria-labelledby="projects-h">
      <p className={styles.eyebrow}>03 · PROJECTS</p>
      <h2 id="projects-h" className={styles.title}>
        our work
      </h2>

      <ul className={styles.grid}>
        {PROJECTS.map((project) => (
          <li key={project.id} className={styles.cell}>
            <button
              type="button"
              className={styles.card}
              data-project={project.id}
              aria-label={`${project.name}, ${project.kind.toLowerCase()}. Open project`}
              onClick={() => goToCrossLink(projectHash(project.id))}
            >
              <Image
                src={project.clips[0].poster}
                alt=""
                fill
                sizes="(min-width: 900px) 34vw, 100vw"
                className={styles.image}
              />
              <span className={styles.wash} aria-hidden="true" />
              <span className={styles.index}>{project.n}</span>
              <span className={styles.body}>
                <span className={styles.name}>{project.name}</span>
                <span className={styles.rule} aria-hidden="true" />
                <span className={styles.kind}>{project.kind}</span>
                <span className={styles.more}>
                  <span>▶ {project.clips.length} CLIPS</span>
                  <span aria-hidden="true">VIEW PROJECT →</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open && <ProjectDetail key={open.id} project={open} onClose={close} />}
    </section>
  );
}
