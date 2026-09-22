# SLORA website

Interactive digital showroom + lead-generation site for SLORA (artificial turf, sports flooring, landscape surfaces).

- Brief: [master_prompt.md](master_prompt.md) · Plan and progress: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) (starts with a plain-English progress report)
- Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4. GSAP (+ SplitText, ScrollTrigger), Lenis, Three.js / React Three Fiber / drei.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000   (the site; design preview at /specimen)
```

Needs Node 20+ (developed on Node 24). `ffmpeg` is only needed to re-encode videos.

## Scripts

| Command                                       | What it does                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `npm run dev` / `build` / `start`             | Develop, build, serve the production build                                                                          |
| `npm run lint` · `typecheck` · `format:check` | ESLint · TypeScript · Prettier                                                                                      |
| `npm test`                                    | Unit tests (Vitest)                                                                                                 |
| `npm run e2e`                                 | Browser tests (Playwright; desktop + mobile). Reuses a running server on :3000                                      |
| `npm run assets:encode`                       | Re-create web-ready videos/posters in `public/videos` and the scroll frame sets in `public/sequences` from `/video` |
| `npm run assets:check`                        | Verify every encoded asset (and each frame set's count) is within its budget                                        |
| `npm run assets:logo`                         | Re-cut the interim logo layers from `photo/slora_logo.png`                                                          |

First Playwright run: `npx playwright install chromium`.

## Layout

```
app/            pages + route handlers (/api/leads), specimen at /specimen
components/     brand/ journey/ navigation/ transitions/(Entrance) providers/(SmoothScroll)
                sections/(SurfaceCards, Sports, HowWeBuild, About, Contact) cards/(EditorialCard, CardCarousel)
                chatbot/ contact/(ContactPopover, InstagramLink) media/(VideoSlot, WatermarkCover)
three/          the 3D turf (blades, cut-away block, camera rig) — loaded lazily
data/           media.ts — the ONLY place video/still paths live · sequences.ts (scroll frame sets) ·
                surfaces.ts (the five surface cards) · sports.ts (the seven Sports panels) ·
                contact.ts (SLORA's real address + Instagram)
lib/            leads/ (schema, store, pipeline, handler, draft) · telegram/ · email/ · whatsapp/ ·
                security/ · journey/ (scroll timing, camera path) · chat/ (questions, store) · hooks/ ·
                media/ (frameSequence: scroll-driven footage as still frames on a canvas) · cards/ ·
                sports/ (rail maths, the enquiry button) · device/ (capability tiers) ·
                contact.ts (phone/WhatsApp links, built on lib/whatsapp)
scripts/        encode-video.mjs
tests/          unit/ (Vitest) · e2e/ (Playwright)
video/ photo/   ORIGINAL supplied assets — never modified
public/videos   generated web derivatives (committed so the site works without ffmpeg)
public/sequences  generated scroll frame sets, 120 WebP frames each (also committed)
```

## The lead pipeline (`POST /api/leads`)

`validate → (duplicate? return the original) → STORE → Telegram ∥ Email → record statuses → WhatsApp link`

- The lead is saved **before** any notification is attempted; Telegram and email are independent, so an outage on either never loses an enquiry.
- Telegram is sent as plain text, email HTML is escaped, links must be `http(s)`, phone numbers are validated (India default) and stored as E.164.
- Bots hit a hidden `website` field and get a silent fake success. Rate-limited per IP; body size capped; no `GET` (leads are never readable through the API).
- Storage: dev writes `./.data/leads.json` (git-ignored, contains personal data); tests use memory. **A production build refuses to accept leads until a durable database adapter is configured** (plan §8 #12) — deliberately, so leads are never silently lost.
- Everything is dependency-injected, so failure modes are unit-tested without real credentials.

## Environment

Copy `.env.example` → `.env.local`. Secrets are server-only (only `NEXT_PUBLIC_WHATSAPP_NUMBER` is public). Missing credentials are reported as `skipped`, never as errors. **Do not invent values** for the WhatsApp number, Telegram bot or notification email; they must come from SLORA.

## Scroll journey tiers

The home page picks how much of the scroll journey to run for each visitor:

| Tier     | Who                                               | What                                                                     |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| `full`   | Desktop with **hardware** WebGL                   | Pinned hero → descent (still frames) → 3D turf cross-section             |
| `video`  | Desktop **without** a graphics card (software GL) | Pinned hero → descent (still frames), then a drawn version of the layers |
| `simple` | Phones, reduced motion, data-saver                | Hero, then a still picture and the drawn layers (no pinned scroll)       |

The descent and HOW WE BUILD are **still frames painted on a canvas** (`lib/media/frameSequence.ts`), not a scrubbed `<video>`: video seeks and decodes on every scroll step and stalls on slow decoders. Only the looping hero at the top is a `<video>`. Add `?journey=full`, `?journey=video` or `?journey=light` to the address to force a tier (used by the browser tests, which draw WebGL in software). The **Sports** section follows the same tiers: only `full` gets the pinned sideways rail (JavaScript moving big pictures every frame stalls without a graphics card), everyone else gets native swipe cards; `?sports=pinned` or `?sports=swipe` forces one for review (it never beats reduced motion or a narrow screen). **Review performance on the production build** (`npm run build && npm run start`), not `npm run dev`: dev mode is much heavier.

## Notes

- **Next.js 16 differs from older versions.** `AGENTS.md` points to the bundled docs in `node_modules/next/dist/docs/` — read the relevant guide before using an API.
- TypeScript is pinned to 5.9 (typescript-eslint does not support TS 7 yet) and ESLint to 9 (what `eslint-config-next` 16 targets; ESLint 9 prints a support notice — revisit when Next's template moves to 10).
- The site sends `noindex` until launch (`app/layout.tsx`). Flip it in Phase 4.
- Stand-in footage looks AI-generated and carries a small ✦ mark. It is tagged `illustrative` in `data/media.ts` and must not be presented as a specific SLORA project.
