import type Lenis from "lenis";

/** The one smooth-scroll instance, so other components (e.g. the mobile menu) can pause it. */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}
