/** Primary navigation (master prompt §6 and §34). Section ids are the on-page anchors. */
export const NAV_ITEMS = [
  { id: "surfaces", n: "01", label: "SURFACES" },
  { id: "sports", n: "02", label: "SPORTS" },
  { id: "projects", n: "03", label: "PROJECTS" },
  { id: "process", n: "04", label: "PROCESS" },
  { id: "about", n: "05", label: "ABOUT" },
] as const;

export type NavId = (typeof NAV_ITEMS)[number]["id"];
