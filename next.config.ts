import type { NextConfig } from "next";

/**
 * Baseline security headers. A full Content-Security-Policy is deferred to
 * Phase 4 (it has to be tuned around GSAP/R3F inline styles and any analytics).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false, // hides Next's dev-only corner badge so it cannot cover the design
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
