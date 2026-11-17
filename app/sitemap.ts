import type { MetadataRoute } from "next";

const BASE = "https://www.sloraindia.com";

// Single-page site: every section is an anchor on "/", so one entry covers it.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
  ];
}
