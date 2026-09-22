import type { Metadata } from "next";
import Image from "next/image";
import "@fontsource/shrikhand/latin-400.css";
import "@fontsource/bagel-fat-one/latin-400.css";
import { EditorialCard } from "@/components/cards/EditorialCard";
import { videos } from "@/data/media";
import { SURFACE_CARDS } from "@/data/surfaces";
import s from "./specimen.module.css";

export const metadata: Metadata = {
  title: "Type specimen",
  robots: { index: false, follow: false },
};

const PALETTE = [
  { name: "BLACK", hex: "#000000", role: "The base. The whole site sits on it." },
  { name: "OFF WHITE", hex: "#F5F5F3", role: "Type and light surfaces." },
  { name: "WHITE", hex: "#FFFFFF", role: "Highlights and small details." },
  {
    name: "SLORA GOLD",
    hex: "#D9A441",
    role: "Accent only: active states, CTAs, hairlines, key numbers.",
  },
  {
    name: "LOGO GOLD",
    hex: "#CBA968",
    role: "Sampled from the supplied logo file. Decide which gold is canonical.",
  },
] as const;

const WEIGHTS = [100, 200, 300, 400, 600, 900] as const;

function SectionLabel({
  id,
  n,
  title,
  note,
}: {
  id: string;
  n: string;
  title: string;
  note: string;
}) {
  return (
    <div className={s.label}>
      <span className={`${s.mono} ${s.labelN}`}>{n}</span>
      <h2 id={id} className={`${s.mono} ${s.labelTitle}`}>
        {title}
      </h2>
      <p className={s.labelNote}>{note}</p>
    </div>
  );
}

export default function SpecimenPage() {
  return (
    <main className={s.page}>
      <header className={s.header}>
        <h1 className={s.mono}>SLORA · TYPE &amp; TOKEN SPECIMEN</h1>
        <p className={s.mono}>PHASE 0 · FOR SIGN-OFF · NOT THE FINAL SITE</p>
      </header>

      {/* 01 ─ HERO ─────────────────────────────────────────────────────────── */}
      <section className={s.section} aria-labelledby="hero-h">
        <SectionLabel
          id="hero-h"
          n="01"
          title="HERO COMPOSITION"
          note="The footage stays dominant; the type covers well under half the frame. The dark patch lower-right quiets the small ✦ mark that is baked into the stand-in footage."
        />
        <div className={s.hero}>
          <Image
            src={videos["hero-loop"].poster}
            alt=""
            fill
            priority
            sizes="(min-width: 1400px) 1400px, 100vw"
            className={s.heroImg}
          />
          <div className={s.heroShade} />
          <p className={`${s.mono} ${s.heroMetaTop}`}>
            01 SURFACES · 02 SPORTS · 03 LANDSCAPE · 04 PROJECTS · 05 PROCESS · 06 CONTACT
          </p>
          <div className={s.heroType} role="img" aria-label="We build the ground you move on.">
            <span className={s.heroHeavy}>We build</span>
            <span className={s.heroThin}>the ground</span>
            <span className={s.heroHeavy}>you move on.</span>
          </div>
          <p className={`${s.mono} ${s.heroMetaBottom}`}>SCROLL ↓</p>
        </div>
      </section>

      {/* 02 ─ DISPLAY FACE OPTIONS ─────────────────────────────────────────── */}
      <section className={s.section} aria-labelledby="faces-h">
        <SectionLabel
          id="faces-h"
          n="02"
          title="DISPLAY FACE · THREE OPEN-LICENCE OPTIONS"
          note="Your reference specimen uses Mamenchisa (Drizy Studio). Its free download is personal-use only, so it is not used here. It needs a commercial + web licence. Until that is decided, option A is the working placeholder."
        />
        <div className={s.faces}>
          <article className={s.face}>
            <p className={`${s.mono} ${s.faceTag}`}>A · CONTROLLED · UNBOUNDED 900 · IN USE</p>
            <p className={`${s.faceWord} ${s.faceA}`}>
              Foot
              <br />
              ball
            </p>
            <p className={`${s.faceSample} ${s.faceA}`}>
              Surfaces where people move, play and experience space.
            </p>
            <p className={s.faceNote}>
              Wide and heavy, so it echoes the extended SLORA wordmark. Also has thin weights. Most
              architectural.
            </p>
          </article>
          <article className={s.face}>
            <p className={`${s.mono} ${s.faceTag}`}>B · GROOVE · SHRIKHAND</p>
            <p className={`${s.faceWord} ${s.faceB}`}>
              Foot
              <br />
              ball
            </p>
            <p className={`${s.faceSample} ${s.faceB}`}>
              Surfaces where people move, play and experience space.
            </p>
            <p className={s.faceNote}>
              Closest to the 1970s feel of your reference. Most expressive; risks feeling retro next
              to the logo.
            </p>
          </article>
          <article className={s.face}>
            <p className={`${s.mono} ${s.faceTag}`}>C · CHUNK · BAGEL FAT ONE</p>
            <p className={`${s.faceWord} ${s.faceC}`}>
              Foot
              <br />
              ball
            </p>
            <p className={`${s.faceSample} ${s.faceC}`}>
              Surfaces where people move, play and experience space.
            </p>
            <p className={s.faceNote}>
              Soft, rounded, friendly. Reads playful, so it needs the most care to stay premium.
            </p>
          </article>
        </div>
        <p className={`${s.mono} ${s.rule}`}>
          RULE: EXPRESSIVE DISPLAY FACES ONLY FOR 1–2 BIG WORDS PER SCREEN. THE SMALL SAMPLE LINES
          ABOVE SHOW WHY.
        </p>
      </section>

      {/* 03 ─ HEAVY ↔ THIN ─────────────────────────────────────────────────── */}
      <section className={s.section} aria-labelledby="weight-h">
        <SectionLabel
          id="weight-h"
          n="03"
          title="HEAVY ↔ THIN · GEIST"
          note="The brief asks for strong contrast between heavy and thin. One variable family covers every step, so headlines can move between them."
        />
        <div className={s.ladder}>
          {WEIGHTS.map((w) => (
            <div key={w} className={s.ladderRow}>
              <span className={`${s.mono} ${s.ladderW}`}>{w}</span>
              <span className={s.ladderWord} style={{ fontWeight: w }}>
                the ground
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 04 ─ TECHNICAL LABELS ─────────────────────────────────────────────── */}
      <section className={s.section} aria-labelledby="mono-h">
        <SectionLabel
          id="mono-h"
          n="04"
          title="TECHNICAL LABELS · GEIST MONO"
          note="Format samples only. Real figures appear on the site only when SLORA supplies verified data."
        />
        <div className={s.chips}>
          <span className={s.chip}>00 MM</span>
          <span className={`${s.chip} ${s.chipGold}`}>00,000 SQ FT</span>
          <span className={s.chip}>[ VERIFIED SPEC ]</span>
          <span className={s.chip}>01 → 06</span>
          <span className={s.chip}>CHENNAI · BANGALORE</span>
        </div>
      </section>

      {/* 05 ─ PALETTE ──────────────────────────────────────────────────────── */}
      <section className={s.section} aria-labelledby="palette-h">
        <SectionLabel
          id="palette-h"
          n="05"
          title="COLOUR"
          note="Black, off-white and white carry the site. Gold stays a small accent."
        />
        <ul className={s.palette}>
          {PALETTE.map((c) => (
            <li key={c.name} className={s.swatch}>
              <span className={s.swatchChip} style={{ background: c.hex }} />
              <span className={`${s.mono} ${s.swatchName}`}>{c.name}</span>
              <span className={`${s.mono} ${s.swatchHex}`}>{c.hex}</span>
              <span className={s.swatchRole}>{c.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 06 ─ EDITORIAL CARD ───────────────────────────────────────────────── */}
      <section className={s.section} aria-labelledby="card-h">
        <SectionLabel
          id="card-h"
          n="06"
          title="EDITORIAL CARD · FOOTBALL TURF"
          note="Borrows the reference's devices: giant cropped type, an object laid across it with a shadow falling on the letters, corner metadata. Hover it: image expands → type moves → gold line draws → info reveals → CTA appears."
        />
        <EditorialCard card={SURFACE_CARDS[0]} placeholders />
      </section>

      <footer className={`${s.mono} ${s.footer}`}>
        Fonts here: Geist &amp; Geist Mono, Unbounded, Shrikhand, Bagel Fat One (all open licence).
        Footage and stills are illustrative stand-ins. The layer colours in the card object are
        illustration only.
      </footer>
    </main>
  );
}
