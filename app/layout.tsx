import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "@fontsource-variable/unbounded/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SLORA", template: "%s · SLORA" },
  description:
    "SLORA creates surfaces where people move, play and experience space — artificial turf, sports flooring and landscape surfaces.",
  // Keep the site out of search engines until launch (flip this in Phase 4).
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
