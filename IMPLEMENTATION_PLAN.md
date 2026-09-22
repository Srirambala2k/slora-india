# SLORA — Implementation Plan

v1.5 · 2026-09-22 · **Phase 0 complete · Phase 1 built · Phase 2 started (Sports, real Contact details, Instagram)**
Built from: `master_prompt.md` (all 55 sections), `photo/slora_logo.png`, `video/hero_portion.mp4`, `video/video_2.mp4`, the typography reference image (Mamenchisa specimen), web research (sources in Appendix B), and contact details supplied directly by SLORA on 2026-09-22.

Phase 0 (foundations) and Phase 1 (the first complete experience) are built and verified; Phase 2 has started (Sports, and now real Contact/About content). See the plain-English progress report just below. The rest of Phases 2–4 have not started.

**Reference convention:** `P§n` = section *n* of `master_prompt.md`; plain `§n` = a section of this plan.

---

# Progress report (in plain English)

*Written for anyone, no technical knowledge needed. Everything after this section is the detailed technical plan.*

## Update: buttons are gold by default now, not just on hover; and the "FOOTBALL"/"MULTI-SPORT" text no longer runs into the line below it

Two fixes from your screenshots.

**Every button is gold all the time, not only when you point at it.** Until now, buttons like the round chat button, "BUILD WITH SLORA," the card-deck arrows, "🗺️ CONTACT US" and the Instagram icon were a plain dark outline by default and only turned solid gold when a mouse hovered over them — invisible-by-default on a touchscreen, which has no hover. They are now gold all the time. The secondary buttons that sit next to a main one (WhatsApp/Enquire next to Contact us, Call next to WhatsApp) now carry a permanent soft gold tint too, so they read as "also a button" without competing with the main gold one next to them. Plain text links (the menu, "CONTACT →", the row of names under the surface cards) are unchanged on purpose — gold is still used sparingly there, as an accent, per the site's own rule.

**"FOOTBALL" and "MULTI-SPORT" (the only two-line panel titles in Sports) no longer overlap the sentence underneath them.** This only showed up on a browser window that is wide enough for the desktop layout but not very tall — a common case on a laptop (a maximised low-height screen, or a browser window that isn't full-height) — because the giant title sizes itself from the window's height while the sentence below it stays roughly the same size regardless. We re-sized the two-line titles so there is always a clear gap, checked all the way down to a noticeably short window, and added an automatic check for it so it cannot silently come back.

**How we checked it.** We reproduced both exactly as reported (comparable before/after screenshots), then re-verified the fixed version renders correctly across a range of window heights (a very short one included) and on a phone-sized screen. The full checked suite passes.

## Update: "Every Game Begins with the Ground" now appears as you scroll from The Arena toward The Surface

You asked for this exact line to show in the background partway down the opening scroll. It is now in place: as you scroll past "THE ARENA" marker and head toward "THE SURFACE" one (the labels on the thin line down the left side), the line **"Every Game Begins with the Ground"** fades in over the footage, holds for a moment, then fades out again before the existing brand line ("SLORA creates surfaces where people move, play and experience space.") takes its turn further down. It only appears on a computer-sized screen, the same as the rest of that opening scroll sequence (on a phone the scroll works differently, without this pinned effect, so it does not apply there).

**How we checked it.** A new automatic check confirms the line appears and disappears at the right moments (after the headline has gone, well before "the surface" mark, and clear of the brand line further down) and we compared screenshots at the right scroll position on a computer-sized screen to make sure it does not overlap the gauge labels beside it.

## Update: every surface card now has a "Connect with us" button, the football card plays real video, and the header is no longer see-through

Four things since the last update, all from your feedback on screenshots.

**The header is now solid.** You saw the top bar staying partly see-through as you scrolled and words from the page behind it blending into the menu text. It is now a plain solid black bar, so nothing ever shows through it. (This also brings it in line with a rule we set ourselves at the start: glass panels are only used around "How we build" and the enquiry chat — nowhere else.)

**"How we build" now has its own Contact us / Enquire buttons**, next to its heading, matching the ones already on About: Contact scrolls to the Contact section, Enquire opens the chat.

**Every surface card (Football, Pickleball, Shuttle court, Park setup, Basketball) now has a "Connect with us" button**, and the Football card is shorter and plays real moving footage instead of a still picture:

- Click **Connect with us** on any card and the enquiry chat opens with a greeting naming that exact card — *"Thanks for showing interest in Pickleball court…"* and so on — so it is clear the chat knows what you clicked.
- The chat also **skips the "what are you looking to build?" question automatically, but only when the card is an exact match** to one of the real enquiry types (today, only Football Turf). For a card like Pickleball, which is not one of the listed enquiry types, the chat still asks rather than guessing — the same "never guess" rule already used on the Sports panels.
- The **Football card is shorter** (it was taking up more room than it needed) and now plays a **real looping video** in the background — reusing the same stand-in hero footage already on the site, so no new footage was needed. The other four cards are unchanged: still pictures, since there is no matching real footage for them yet.
- We also checked: clicking anywhere else on a card (its picture, its title) still does what it always did — takes you to the Sports section. Only the new button opens the chat.

**On the chat's closing message:** you asked for it to say your member will contact them "as soon as possible." We kept that wording, but it still only appears next to the existing "this is a preview, nothing has actually been sent" notice — because the enquiry chat still is not connected to anything real (no Telegram, email or database credentials yet; see items 5, 6 and 9 further down this document). Saying "our team will contact you" without that caveat, before it can really receive anything, would risk a promise the site can't yet keep. Once the real credentials are in and enquiries are actually being delivered, that caveat comes off automatically and the message stands on its own.

**A couple of things we found and fixed ourselves while testing this, worth mentioning honestly:**
- Reopening the chat for a *second* card (without a page refresh) was not updating its greeting — it kept showing the first card's greeting. This only showed up once we tested clicking "Connect with us" on two different cards in the same visit; fixed, and now covered by an automatic check.
- A fast, automated test (much faster than a person could type) could occasionally make the chat ask the same question twice in a row. Also fixed, with a safeguard so it cannot happen regardless of how quickly someone answers.

**How we checked it.** 241 automatic checks, and the full browser check suite (95 checks across a computer-sized and a phone-sized screen) — opening the chat from each of the five cards, checking the greeting names the right one, checking the exact-match skip only happens for Football, checking the video plays and the button is genuinely clickable (not just decoration), and checking the card's own shorter size — all pass on the production build.

## Update: the full address is in, and About now has a "New Name / Proven Experience" story

Two things since the last update.

**The address is now complete.** You sent the full address: **3, Anna St, Ranga Colony, Kamarajapuram, Sembakkam, Tambaram, Tamil Nadu 600073.** It now shows everywhere the address appears (the Contact section's map card and the "Open in Google Maps" link) — with the full PIN code, so item 13 on the "what we need" list below is done. We changed nothing else about how it works: it is still shown as one address, and the "Open in Google Maps" link still searches for it exactly.

**About now tells your founder story.** You sent Lohith Raghuraman's photo and the "New Name. Proven Experience." story, and asked for: the photo as the profile picture; the story styled to match the site; a Contact button, a WhatsApp button, and an Enquire button that opens the enquiry chat. All of that was built, then adjusted twice more as you reviewed it:

- The heading now reads **"New Name / PROVEN EXPERIENCE."** exactly as you asked (it briefly showed in lowercase, to match a pattern used elsewhere on the site, before you asked for it capitalised).
- **SLORA is highlighted in gold** everywhere it is named in the story, the same gold used for the brand elsewhere on the site.
- You then asked to **remove the caption under the photo, then to remove the photo itself.** Both are done. With the photo gone, the section had a large empty gap on wide screens; rather than leave it empty, the two real numbers in your story — **100+ projects executed** and **founded 2026** — now sit beside the story as a small sidebar, a common, tidy way to present numbers like these. Nothing was invented for it: both figures are exactly what you gave us, just also shown as a callout, and it fixed the layout looking unbalanced on a wide screen.
- The **Contact / WhatsApp / Enquire** buttons all work: Contact scrolls to the Contact section, WhatsApp opens a chat with your number, Enquire opens the enquiry form.

**How we checked it.** Automatic checks cover the new address text in every place it shows, the Google Maps link, and the About section's story, buttons and stat sidebar. All pass, on a computer-sized and a phone-sized screen.

## Update: the round SCROLL button was letting the watermark peek out on a big screen — fixed

You sent two screenshots: the hero's round "SCROLL" button, and the round chat button. We found and fixed a real bug behind the first one.

**What was wrong.** The stand-in footage has a small ✦ sparkle mark baked into it (see the "Honest notes" below); every round button that sits near it is specifically sized and placed to sit exactly over it and hide it. We measured the mark directly from the footage: its points reach about 2% of the video frame's width from its centre. The button covering it was capped at a fixed 44 pixels, however big the screen — so on a **big monitor**, once the video frame got wide enough, the fixed-size button became *smaller*, proportionally, than the mark it was supposed to hide, and a point of the sparkle started poking out past the edge of the button. That is exactly what your screenshot showed.

**The fix.** The button now keeps growing a little further on big screens before it stops, so it always stays bigger than the mark, checked all the way up to a 4K-sized window. This applies to **both** places this technique is used: the hero's round SCROLL button, and the round "EXPLORE" button in "How we build". We added an automatic check that a point of the mark can never fit outside the button, at any common screen width, so this specific mistake cannot silently come back.

**About the round chat button.** We looked closely and could not find anything wrong with it: it is genuinely fixed in place (it never moves, at the top of the page or the very bottom) and we found no watermark showing near it, on a large screen or otherwise, before or after the fix above. If you still see something with it after this update, a fresh screenshot **with a bit more of the page around it** (not just a tight crop) would help us find it fast — we cannot always tell one round button from another (there are several: SCROLL, EXPLORE, the chat button, and each card's own button) from a very close-up shot alone.

**How we checked it.** We re-measured the mark directly from the source footage (cropped and zoomed in on the actual picture) rather than guessing, then wrote an automatic test that checks the button stays bigger than the mark at six screen widths from a small laptop up to 4K, and it passes. We also compared before/after screenshots at a large screen size (1920×1080) and the mark no longer shows.

## Update: your real address, phone and Instagram are now on the site

You gave us SLORA's real address, phone number and Instagram. They are now live on the site (production build, http://localhost:3000) — this is the first **real, non-illustrative** content on the site.

**The hero (top of the page).** Two new buttons sit under the opening line:

- **🗺️ CONTACT US** — click it and a small menu opens with three ways to reach you: **WhatsApp**, **Call**, and **View on Google Maps**. Each goes straight to the real thing (WhatsApp opens a chat with a friendly opening message already typed in; Call dials the number; Maps opens your address).
- A round **Instagram** icon, linking straight to `instagram.com/sloraindia`, opening in a new tab so visitors never leave your site by accident.

**The Contact section**, near the bottom of the page, now shows:

- Your **address as a small map card** — a dark grid background with a gold pin marker over it, in the style of a map. Clicking anywhere on it opens Google Maps with your address already searched.
- Your **phone number**, printed clearly, with **two separate buttons**: **WhatsApp** and **Call**, exactly as you asked, so a visitor picks whichever they prefer.

**About** now shows the **Instagram icon and handle** too, while the rest of that section still waits on your story, team and photos (labelled honestly as "in build").

**One thing worth knowing (at the time): the address was shown exactly as first typed** ("4, Anna Street, Kamarajapuram, Chennai - 73") — we did not guess or expand the "- 73" into a full 6-digit PIN code. *(Superseded: you then sent the full, correct address — see the update above. It now shows in full, PIN code included.)*

**Where this lives, technically:** the phone/WhatsApp number is *configuration*, the same way it already was in the plan — stored in a private, not-committed-to-git file on this computer (`.env.local`), read from ONE place in the code, and reused by the "Call" button, the "WhatsApp" button and the hero's menu, so they can never disagree or drift apart. Nothing about the phone number is written into the source code itself.

**Two things you asked us to take down.** You saw two things on the site and asked us to remove them — done, immediately:
- An "Engineering / Process" section (headline "BEAUTY HAS STRUCTURE.") that we had built ahead of being asked, listing eight generic construction steps. Removed entirely.
- The "Landscape" and "Projects" placeholder chapters (the plain "in build" pages). Removed from the page; they will return once you can supply real photos and details for them (they need nothing else to come back — it is a one-line change).

**How we checked it.** **225 automatic checks** and **12 new browser checks** (opening the menu, checking every link's real destination, checking the menu closes on Escape and on an outside click, checking both Instagram links, checking the two contact buttons go to two *different* places) all pass, on both a computer-sized and a phone-sized screen.

## Update: the Sports section is built (Phase 2 has started)

The "Sports" placeholder is now a real section, the first piece of Phase 2. It shows the **seven categories from your brief, in your order: Football, Cricket, Hockey, Tennis, Padel, Multi-sport, Athletics**, each as a large panel in the same style as the surface cards (a giant word, a thin line under it, a gold rule that draws on hover).

**What you see**

- **On a computer with a graphics card:** the section pins to the screen and **scrolling slides the seven panels sideways**. The row leans very slightly with your scroll speed, each picture drifts a little against its panel for depth, and a **gold line at the bottom fills up** with a counter (*03 / 07 · HOCKEY*).
- **On a phone, a tablet, or with animations turned off:** a plain row of cards that you **swipe** (it snaps card to card), with a counter, a progress line and two small arrows.
- **Each panel has one button, "ASK ABOUT FOOTBALL →"** (and so on) that opens the enquiry chat. For **Football, Cricket and Multi-sport** the chat already knows what you are enquiring about and does not ask that question again. For **Hockey, Tennis, Padel and Athletics** the chat asks, because we would rather ask than guess wrong and record a Tennis enquiry as Football.
- With the keyboard, pressing Tab onto a panel's button slides that panel into view.

**Please read this part: the pictures and the wording are stand-ins.**

- We have no photographs of these sports, so the panels use frames cut from your AI footage (a running-track close-up, a dusk court, a blue multi-line court, a floodlit fenced court, grass fibres and the football pitch). **They are generic grounds, not the sport named on the panel.** The page says so at the top: *"ILLUSTRATIVE PICTURES · WORDING TO BE CONFIRMED BY SLORA"*.
- The one-line taglines (*"the beautiful game, underfoot."*, *"lanes, lines, records."* and so on) are **our placeholder wording** and need SLORA's approval.
- The panels show **no applications, sizes or technical details**, because none have been supplied. The place for them is built: they appear automatically once a panel is given verified details together with where they came from.

**A decision we made, and why.** We built the sideways rail, then measured it the way we measured the descent. **On a computer with a graphics card it is smooth** (on this laptop's own graphics card: no freezes at all, and the slowest frame took about 0.07 seconds; still no freezes with the processor made 4 times slower). **On a computer with no graphics card it was not**: about 130 freezes, some longer than a second, because the browser has to redraw big pictures on every frame and does it slowly without a graphics card. So, like the scroll journey, **computers with no graphics card get the swipe cards instead**, which the browser scrolls by itself and which measured smooth (a handful of very short pauses, none longer than 0.26 seconds). Nothing is lost except the sideways sliding. To compare, add `?sports=pinned` or `?sports=swipe` to the address.

**How we checked it.** We looked at the section at computer size and phone size and tuned what we saw (more space under the menu, keeping the progress line clear of the chat button, larger two-line words). **218 automatic checks** pass, and **53 browser checks** pass on computer-sized and phone-sized screens (another 21 are skipped on purpose, because each is meant for only one of the two sizes). They include: the row slides from Football to Athletics; Tab reaches an off-screen panel and slides it into view; the chat opens already knowing "Football" for the Football panel but still asks the question for Tennis; a computer without a graphics card gets the swipe cards; the phone version snaps card to card and its counter follows.

**An honest note about the test runs.** While running the browser checks, a different test failed on almost every run (9 failures in one run, then 1 or 2, always different ones), and one of them could be reproduced 1 time in 4. We did not assume "just flaky". We measured: loading the page 12 times gave steady start-up times (5.4 to 7.2 seconds, no stalls), so the site does not hang. The causes were in the **test set-up**: (1) recording a trace on every test made the frosted-glass chat 2 to 3 times slower when graphics are drawn in software, (2) two tests tried to click a button in the sliding row while the row was still gently swaying, and the test tool kept scrolling to chase it, and (3) a machine shared with other programs. We fixed the set-up (traces only when a test is repeated, the button is pressed like a person would, longer waits, one automatic repeat that is still reported as "flaky"). The final run: **0 failed, 0 flaky.** **Not done:** a real swipe on a phone, Safari and Firefox, and a person scrolling it on your machine.

## Update: the Football card is now a deck, with an arrow on the right

You asked for the same card as Football, with **an arrow on the right side that shows the pickleball court, the shuttle court, the park setup and the basketball court**. That is built. Under **"surfaces for every game"** there are now five cards in the same style:

| # | Card | Giant word | Line under it |
| --- | --- | --- | --- |
| 01 | Football turf | FOOT / BALL | built for the game. |
| 02 | Pickleball court | PICKLE / BALL | made for the rally. |
| 03 | Shuttle court | SHUTTLE / COURT | made for the smash. |
| 04 | Park setup | PARK / SETUP | made for open play. |
| 05 | Basketball court | BASKET / BALL | built for the bounce. |

**How it works**

- A **round arrow on the right edge** of the card moves to the next card. The card slides across, and the new giant word, the picture and the surface block glide in. After Basketball it goes back round to Football. The thin ring around the arrow fills up to show how far through the five cards you are.
- A **back arrow on the left** appears once you have moved on, so you can go back.
- **Underneath the card**, a row of names (*01 Football turf · 02 Pickleball court …*) lets you jump straight to any card, with the current one lit in gold. On a phone only the current name is spelled out.
- **Phones:** swipe left or right, or use the two arrows in the bottom-right corner. **Keyboards:** Tab to the arrow, then the left and right arrow keys work. Screen readers are told which card is showing ("Pickleball court, 2 of 5"), and only the card you can see can be tabbed to.
- Everything the Football card already did (the hover effects, the gold light that follows the mouse, the "EXPLORE" label) works on every card.

**Please read this part: the pictures are stand-ins.** We have no photographs of pickleball, shuttle, park or basketball projects, so each card uses a frame cut from the AI-made footage you supplied (a blue multi-line court, a floodlit fenced court at night, and a tree-lined ground). **They are generic courts, not the actual sport named on the card**, and the page says so under the deck: *"ILLUSTRATIVE PICTURES · TO BE REPLACED WITH SLORA'S OWN PHOTOS"*. The picture files are listed in one place (`data/media.ts`), so swapping in real photos is a small change.

**Two more honest choices**

- The tilted block on the **Football and Park** cards shows the three layers of an artificial-turf surface (fibre, infill, backing). On the three **court** cards it is a plain coloured court with its lines and the word *SURFACE*, with **no layer names**, because we do not know how SLORA builds a pickleball, shuttle or basketball court and we do not make that up.
- The cards show **no sizes, thicknesses, areas or prices**, because none have been supplied.

**How we checked it.** We looked at all five cards at computer size and at three of them (Football, Shuttle, Park) at phone size, and fixed what we saw: one long word (SHUTTLE) was cut off on a phone, the last letter of SETUP was hidden under the block on a computer, and the arrows sat on the block's edge. All fixed. **190 automatic checks** and **41 browser checks** (computer-sized and phone-sized screens) pass, including a check that the arrow goes Football → Pickleball → Shuttle → Park → Basketball → Football, that the keyboard never lands on a hidden card, and that all five pictures load. **Not yet done:** a real touch-swipe test on a phone (the swipe code is written, but the automatic checks only test the arrows and the name row), and Safari/Firefox.

## Update: the descent still felt like "buffering", so we changed how it is made

You told us again that **the hero video buffers when you scroll down**. The first fix (below) helped, but it was not enough, so we changed the approach instead of tuning it.

**Why a video keeps stalling.** While you scroll, a scroll-driven video has to jump to a new moment and **decode a frame, dozens of times a second**. A computer that decodes video slowly cannot keep up, so the picture freezes: that is the "buffering" you see. Better tuning cannot remove that; only not using a video can.

**What we did.** The descent (and the "How we build" section) is now made of **still pictures**, 12 for every second of footage (120 each), painted onto the page as you scroll. Painting a picture that is already loaded takes a fraction of a millisecond and cannot freeze. The pictures download quietly in the background (a spread-out set first, so scrolling works within moments, then the ones nearest to you), and only a small handful are kept ready in memory. Between two pictures the page blends them, so slow scrolling glides. The looping hero video at the top is unchanged.

**Then we measured, and found our own first version was still wrong.** We recorded exactly what the browser did while scrolling the whole page. Our first version made **whole-second freezes** (one of about 4 seconds, in a browser with no graphics card) because it redrew the picture many times per frame, and the graphics side could not keep up. We fixed that (draw at most once per screen refresh, never redraw an identical picture, draw one picture instead of two whenever we are very close to one, and never make the drawing surface bigger than the pictures). After the fix, in the same browser, the freezes were gone.

| Measured while scrolling the whole page | Before the fix | After the fix |
| --- | --- | --- |
| Freezes longer than 0.05 s (a browser with **no** graphics card, the worst case) | 13 to 32 per scroll, worst **5.3 seconds** | 2 to 5 per scroll, worst **0.16 seconds** (10 and 0.2 s with the processor made 4 times slower). With the pictures blocked entirely it is 3 to 5 and 0.18 s, so the pictures now add almost nothing |
| Real Microsoft Edge on **this laptop's own graphics card** | not measured | **no freezes at all**; the slowest frame gap was about 0.07 to 0.12 s |
| Same, with the processor made 4 times slower | not measured | **no freezes**; the slowest frame gap was about 0.07 s |
| Same, video-only tier (no 3D) | not measured | **no freezes**; not one slow frame in about 400 |

**What it costs.** The two picture sets total about **15 MB** (7.2 MB for the descent, 8.1 MB for "How we build"), roughly what the scroll videos they replace weighed on a big screen, and they load quietly in the background. Phones and reduced-motion visitors are unchanged (they never had the scroll-driven video).

**What we could not check.** We measured in an automated Edge on this laptop and in a no-graphics-card browser, **not with a person scrolling on your machine**, and **not in Safari, Firefox or on an iPhone**. Please review the production version at **http://localhost:3000** and tell us if any roughness is left, with the computer, browser and rough place in the scroll.

**One test failed once and we could not reproduce it.** In one full run, a test that checks the opening's SKIP button failed, then passed in five later runs (three on its own, two full runs). We suspect a timing problem when the computer is busy, but we did not find a cause.

## Update (first pass): the "buffering" and messy feel in the scroll descent

*(This is the earlier fix. It helped with the causes listed here, but the video itself still stalled on slower decoding, see the update above.)* You told us the scroll part felt full of "buffer" and looked messy. We did not guess: we **measured** it in a real browser and found real causes. Here is what was wrong and what changed.

| What you felt | The real cause we measured | What we did |
| --- | --- | --- |
| **A freeze right when the intro ends**, just as you start scrolling | The heavy 3D scene set itself up all at once at that exact moment. Measured: **the page froze for about 1.35 seconds.** | The 3D scene now prepares itself **during the intro, when the logo holds still**, and its graphics programs are compiled in the background. Measured after the fix: **no freeze longer than 0.1 second once the intro is over.** |
| **The picture lagging behind the scrollbar, then jerking** | Two layers of smoothing stacked on top of each other, and the video was asked for a new frame faster than it could deliver one. | One layer of smoothing only. The video is now asked for **one frame at a time** and always jumps to the latest position. Measured: **the picture now reaches its final frame before the scroll glide finishes** (no floaty tail). |
| **A soft, blurry picture** | A 720p video stretched over a big, scaled screen. | A **sharp 1080p** version is used on big or scaled screens (8.5 MB, fetched quietly during the intro). |
| **A dark "loading" moment** between the video and the 3D scene | Both faded out and in together, so the screen dipped to dark. | The 3D scene now fades in **over** the video, which stays until the 3D is complete. Tested: there is **never** a dark gap. |
| **A round button crashing into the chat button** | Both sat in the bottom-right corner on some window shapes. | The round button now **shrinks with the video** and stays clear. Tested on five common window shapes. |
| **Small text lingering** after scrolling right after the intro | Two animations fighting over the same fade. | Separated, and covered by an automatic test. |

**Computers without a graphics card.** The 3D scene needs a graphics card. On a computer without one, it would stutter no matter what we do, so the site now **detects that** and shows a smoother, shorter **video-only** version of the journey, followed by a drawn version of the layers. Nothing is lost except the 3D. (To compare, you can add `?journey=full`, `?journey=video` or `?journey=light` to the address.)

**Please review the production version.** The version you were probably looking at (started with `npm run dev`) is a **development** build, which is much heavier and slower than what visitors get. The **production** version is now running at **http://localhost:3000**.

**What we could not check:** we measured on a computer without a graphics card, using Microsoft Edge. On a normal computer with a graphics card it should be smoother still, but **we have not seen it on your machine**. If you still feel any roughness, tell us which computer and browser, and roughly where in the scroll.

## Update: Phase 1 is built. You can now scroll through the whole first version

Earlier the site showed only a plain page, then only the opening and the hero. **The rest of Phase 1 is now built**, so opening the site and scrolling from the top to the bottom shows the first complete version of the experience.

**What you see, in order, as you scroll**

1. **The opening.** A black screen. The SLORA logo assembles in the middle (three bars, then the name), glides to the top-left as the site's logo, and the homepage arrives from the right. There is a SKIP button, and a repeat visit takes about 1 second.
2. **The hero.** A full-screen video of the floodlit pitches, with **WE BUILD / *the ground* / YOU MOVE ON.** animating in, and the numbered menu (*Surfaces, Sports, Landscape, Projects, Process, About*) with the gold **BUILD WITH SLORA →** button.
3. **The descent.** As you start to scroll, the screen stays put while the camera *goes down* through your footage: the floodlit facility, a multi-sport court, a pitch, and finally a close-up of the grass fibres. A thin gauge on the left (*The arena, The surface, The fibre*) shows how far down you are, and halfway through, the line **"SLORA creates surfaces where people move, play and experience space."** fades in and out (those are the words from your brief). The round button in the corner becomes a gold progress ring.
4. **The 3D turf.** The close-up grass turns into a 3D scene: thousands of blades swaying, then the camera pulls back to reveal a **cut-away block showing the layers beneath**: grass fibres, infill, backing, base and drainage. Gold lines point to numbered labels, one after another. Moving the mouse tilts the view slightly. It is marked **"ILLUSTRATIVE · NOT TO SCALE"**: the colours and thicknesses are drawings, not real measurements.
5. **The first card: "surfaces for every game".** The Football Turf card: a giant cropped word with a turf-layer block laid across it and a shadow falling on the letters (the idea from your font reference). On a computer, hovering makes the picture grow, the word slide, a gold line draw, an info line appear, then "→ EXPLORE". A gold light follows the mouse along the card's edge and a round "EXPLORE" label follows the pointer.
6. **Sports** (placeholder for now).
7. **HOW WE BUILD.** Your installation video, with a **frosted-glass panel** floating over it that lists the seven stages the footage really shows: *base compaction, base levelling, turf roll-out, cutting & fitting, edge fixing, infill & brushing, completed surface*. As you scroll, the video plays and the current stage lights up in gold with a thin progress line. Nothing else on the site uses glass.
8. **Landscape, Projects, About, Contact** (placeholders for now).
9. **The chat window.** A round button in the bottom-right corner (and the *BUILD WITH SLORA* buttons) opens a frosted-glass chat. It says *"Hi. Let's build something with SLORA."* and asks the six questions one at a time (name, city, what you want to build, an optional project link, approximate area, phone number). Each answer is checked, with friendly messages if something looks wrong, and progress dots fill in gold. At the end it shows a summary. **It is a preview: nothing is sent anywhere yet, and the last screen says so plainly.**

**Phones, and people who turned animations off, get a lighter version.** The pinned scrolling and the 3D scene are computer-only. On a phone the descent becomes a still close-up with a drawn version of the layers, and "How we build" plays its video with the stage list following along. Reduced-motion visitors get stills and no movement.

**How heavy is it?** About **200 kB** of code loads before the opening finishes, with **no 3D in it**. The 3D scene (about 240 kB more) is fetched only after the page is ready, and the chat window's code (about 120 kB) only when someone first opens the chat. The 3D scene also **stops drawing when you scroll past it**, so it does not use the computer in the background.

**What is still temporary**

- **The logo** is cut from the small picture we were given, so it can look slightly soft; it needs the original vector file.
- **The videos** are the AI-made stand-ins. The small ✦ mark that came with them is hidden under the round buttons.
- **The stage names** under "How we build" describe what the footage shows and **need SLORA's approval**. Stages the footage does not show (site survey, drainage, line marking, quality check, handover) are deliberately not listed.
- **Sports, Landscape, Projects, About, Contact** are labelled placeholders.
- **The chat is not connected** to Telegram, email, WhatsApp or the AI. Those need the details listed below.

**How we checked it.** We watched the whole scroll in Microsoft Edge frame by frame, tested the chat by typing good and bad answers, and counted the 3D scene's drawing activity to prove it stops when out of view. **167 automatic checks** and **24 browser checks** (on a computer-sized and a phone-sized screen) all pass. Before building the scroll effect we also **measured** whether the video can follow the scroll bar smoothly in Chrome-based browsers: it can (jumps take about 0.015 seconds and about 9 in 10 animation steps show a fresh picture). **Safari and Firefox still need testing on real devices.**

**Problems we found and fixed while testing**

- The menu highlight code crashed the whole page at one point (caught immediately by looking at the page).
- The 3D scene kept drawing after you had scrolled far past it.
- If you stopped at the exact end of the 3D part, it froze before showing the labels.
- The skip button was invisible to screen readers and the keyboard (fixed earlier).

**Still to come.** *Phase 2:* the rest of it (Stadium, Landscape, Playground, Engineering, Project explorer and project pages) and the real photos and details for Sports, all of which need material from SLORA. *Phase 3:* the material library, project configurator, the working chat and live Telegram, email and WhatsApp. *Phase 4:* phone polish, speed testing on real devices, Google visibility, accessibility review and launch.

## Progress at a glance

| Phase | What it covers | Status |
| --- | --- | --- |
| 0 | Foundations, video preparation, design preview, enquiry system | **Done** |
| 1 | The first "wow" version: opening logo animation, menu, hero video, scroll descent into a 3D turf, first finished card, "How we build" video, chatbot window (look only) | **Done** (review with SLORA next) |
| 2 | Sports, stadium, landscape, playground, engineering process, project explorer, project pages | **Started:** Sports is built (stand-in pictures and wording); real Contact details and a first piece of About (Instagram) are also live; the rest not started |
| 3 | Material library, project configurator, working chatbot, live Telegram / email / WhatsApp | Not started |
| 4 | Phone polish, speed, Google visibility, accessibility, security, launch | Not started |

**Nothing is live on the internet yet.** Everything runs on a developer's computer.

## Phase 0 in short (the foundations, built first)

Before the homepage could be built we made the **foundations** of the website and the **behind-the-scenes system that catches customer enquiries**, plus a **design preview page** for choosing lettering and colours.

## The design preview page

A single **design preview page** (we call it the "type specimen") that shows how SLORA will look and feel:

1. **The top of the homepage, mocked up.** "WE BUILD / *the ground* / YOU MOVE ON." sitting over your night-stadium footage. The footage stays the star; the words cover well under half the picture.
2. **Three lettering options** for the big headline words (A, B and C). **Please choose one.**
3. **Heavy to thin lettering**, the contrast your brief asks for.
4. **The small technical-label style** (used later for sizes and specs).
5. **The colours:** black, off-white, white and SLORA gold.
6. **One sample "Football Turf" card.** On a computer, move the mouse over it: the photo grows, the big word slides, a gold line draws itself, an info line appears, then "→ EXPLORE" appears. The coloured block across the word is a simple illustration of turf layers (fibre, infill, backing). Anything in square brackets, like *[ AREA ]*, is a **placeholder**: there is no real data yet.

**How to open it** (someone with the project on their computer, about 2 minutes):

1. Open a terminal in the project folder and run `npm install` (first time only).
2. Run `npm run dev`, then open **http://localhost:3000** (the site) or **http://localhost:3000/specimen** (the design preview) in a web browser.

If that is not convenient, ask the developer to screen-share it or send screenshots.

## What was built

| # | Piece | In plain words | Why it matters |
| --- | --- | --- | --- |
| 1 | **The workshop** (project foundation) | The organised set-up every later piece is built in: the tools, the folders, and automatic checks that run whenever something changes. | Keeps quality steady and prevents expensive rework later. |
| 2 | **Video preparation** | Your two 10-second clips (about 10 MB each) were turned into **7 smaller video files and 4 still pictures**, each made for a different situation: computer or phone, playing by itself or following the scroll. The hero background a visitor downloads is about **1.4 MB** (about **0.6 MB** on phones) instead of 10 MB. (The larger scroll-following versions are only downloaded later, when needed.) The colours were nudged slightly so the footage sits well with black and gold. **Your original files were not touched.** | The site opens quickly, even on a phone. |
| 3 | **Design starter kit** | The colours, the three lettering options, the fine film-grain texture on the black, the sample card, and a **"video slot"** that only loads a video when the visitor gets near it, shows a picture first, and respects the "reduce motion" setting. All videos are listed in **one place**. | When real SLORA footage arrives, it replaces the stand-in in that one list, with no page redone. |
| 4 | **The enquiry engine** | What happens after a visitor sends an enquiry (see below). | This is the part that turns visitors into customers, and it must never lose one. |
| 5 | **The automatic safety net** | Now **167 automatic checks** (enquiry system, video list, scroll timing, 3D camera, chat questions, video seeking) plus **24 browser checks** on a computer-sized and a phone-sized screen. All pass. It also checks that every video stays within its size limit. | Problems are caught in seconds, before you ever see them. |

### The enquiry engine, step by step

When someone sends an enquiry (name, city, what they need, an optional link, approximate area, phone number):

1. **It checks the details are sensible.** Phone numbers are properly checked: Indian numbers work with or without +91, and nonsense is turned away with a friendly message. Only safe web links are accepted.
2. **It saves the enquiry first.** Before anyone is told anything, the enquiry is stored.
3. **It then tells the SLORA team by Telegram and by email, at the same time, independently.** If one is down, the other still goes out and the enquiry is still safe.
4. **It gives the visitor a "Continue on WhatsApp" link** with their details already typed in. This works **only once SLORA supplies the official number**. Until then it does not make one up.

Protection built in: a hidden trap that catches automated spam; a limit on how often one person can submit; the same enquiry sent twice (say, a double click) is saved only once; nobody can read stored enquiries through the website; passwords and keys are never sent to a visitor's browser; personal details are kept out of error logs.

**We tested it for real.** We sent a genuine test enquiry to the running system. It was accepted and saved with tidy formatting, an identical second submission was recognised as a repeat, and a nonsense enquiry was refused with clear messages. The test record was **deleted afterwards**.

**Important:** to run for real, the site needs a **database** (a safe place to keep enquiries). Until one is chosen, the live version is **deliberately set to refuse enquiries** rather than risk losing them silently. On a developer's own computer, enquiries are kept in a private file instead.

## What is NOT done yet

- **Real content for Sports, Stadium, Landscape, Playground, Engineering, Projects, About and Contact** (Phase 2). They are labelled placeholders, because they need real photos and details from SLORA.
- **The material library, the project configurator and a working chat** (Phase 3). The chat window asks the questions and checks the answers, but **nothing is connected to real Telegram, email, WhatsApp or the AI yet**. We do not have the details (see below). The enquiry system was built and tested with **simulated** versions, so it needs one live test once the real details arrive.
- There is **no database** yet, and **no real project photos or product specifications**.
- **Speed and phone testing on real devices** (Phase 4), including Safari and Firefox.
- The site is **hidden from Google** on purpose until launch.

## What we need from SLORA

| # | What | Why | Needed for |
| --- | --- | --- | --- |
| 1 | **Choose the headline lettering** (A, B or C on the preview page), **or** buy a licence for *Mamenchisa*, the font in your reference image. Its free download is for personal use only, so it cannot be used on a business website. | The look of every big word | Polish (the site works with stand-ins meanwhile) |
| 2 | **The original logo file** (a vector file such as SVG, AI or PDF) and which gold is correct: the brand gold `#D9A441` or the slightly paler gold in the logo file `#CBA968`. | The opening logo animation needs the logo in separate pieces; the file we have is too small | Polish (the site works with stand-ins meanwhile) |
| 3 | **Clean versions of the two videos without the small ✦ mark**, or real SLORA footage. | See the note below | Polish (the site works with stand-ins meanwhile) |
| 4 | ~~The official WhatsApp number~~ **Done (2026-09-22):** `+91 93847 46930`, now live on the hero button, the Contact section and the chat's "Continue on WhatsApp" step | The WhatsApp button everywhere on the site | — |
| 5 | **A Telegram bot and chat** for enquiry alerts (we can walk you through it) | Instant alerts to the team | Phase 3 |
| 6 | **The email address(es)** that should receive enquiries, plus an account with an email-sending service | Email copy of every enquiry | Phase 3 |
| 7 | **Where the website lives and where enquiries are stored** (hosting and database). Our suggestion: Vercel plus a managed database. | Safe storage of enquiries | Phase 3 |
| 8 | **Real project details and photos** (name, place, type, area, before / during / after, drone shots) | Projects, case studies, landscape and playground sections | Phase 2 |
| 9 | **Verified product details** (for example pile height) | The material library. Nothing is shown unless it is confirmed. | Phase 3 |
| 10 | **Approval of the wording** for the 8 build steps and the video chapter names | So we never claim something SLORA does not do | Phase 2 |
| 11 | **Privacy notice wording** for collecting phone numbers | Legal comfort. Please check with your adviser. | Phase 3 |
| 12 | **Real photographs for the four new cards** (pickleball court, shuttle court, park setup, basketball court) **and for the seven Sports panels** (football, cricket, hockey, tennis, padel, multi-sport, athletics), the applications and verified technical details for each sport, **approval of the one-line wording** on the panels, and confirmation that these are the right cards in the right order. Also tell us how SLORA builds a **court surface** (its layers), so the block on those cards can show real layer names instead of just "SURFACE". | The cards currently use generic stand-in pictures and show no layer names, so nothing is invented | Polish, then Phase 2 |
| 13 | ~~The full 6-digit PIN code for the address~~ **Done (2026-09-22):** the full address, with PIN code, is live everywhere the address shows | A complete, precise address | — |
| 14 | **Content for About** (SLORA's story, team, photos) and for **Landscape** and **Projects** (currently removed from the page rather than shown as empty placeholders) | So these chapters have something real to show | Phase 2 |

## Honest notes

- **The two videos look AI-generated.** Each has a small ✦ mark in the lower-right. On the site it is **hidden under the round buttons** (the SCROLL ring in the hero, the EXPLORE ring in "How we build"), but the marks are still in the files. The footage is fine as a stand-in, but it should be replaced with clean or real footage and **must not be presented as real SLORA projects**.
- **The lettering is a stand-in.** *Mamenchisa* (your reference) is not used because of its licence. Option A (Unbounded) is the working choice; changing it later touches one line.
- **The 3D turf and the drawn layers are illustrations.** The colours and thicknesses are for drawing only. They are labelled "ILLUSTRATIVE · NOT TO SCALE", and the site shows no measurements, pile heights or certifications, because SLORA has not supplied any.
- **The "How we build" stage names describe the footage** and need SLORA's approval. Stages the footage does not show are deliberately not listed.
- **The chat is a preview.** It asks the real questions and checks the answers with the real rules, but it does not send anything, and it says so on its last screen.
- **The menu highlight jumps around a little** while scrolling (Surfaces, then Sports, then Process, then Landscape…) because the page follows the order in your brief while the menu keeps the order you listed for it. Reordering the menu to match is a one-line change if you prefer.
- **Not yet checked:** speed scores (Lighthouse), real phones and tablets, Safari and Firefox. The 3D scene was only drawn on a computer without a graphics card during testing, so its real speed on a normal computer is expected to be better, but we have not measured it.
- **Rules we follow:** we never invent specifications, prices, certifications or contact details. Anything unknown stays a hidden placeholder until SLORA supplies it.

## What happens next

1. **Review Phase 1 together.** Scroll through it on a real computer and a real phone, and tell us what to change (timing, words, feel).
2. **Phase 2:** Sports (a sideways-scrolling row), the 3D stadium, Landscape, Playground, the engineering process, the project explorer and project pages. This is where **real photos and project details from SLORA** matter most.
3. **Phase 3:** the material library, the project configurator, the chat's brain, and live Telegram, email and WhatsApp. This needs the **credentials and hosting decisions** in the list above.
4. **Phase 4:** speed and phone polish, testing on real devices and browsers, Google visibility, accessibility review, security review and launch.

## Where things are

| Where | What |
| --- | --- |
| `IMPLEMENTATION_PLAN.md` (this file) | The plan and this report |
| `README.md` | Instructions for developers |
| `app/specimen/` | The design preview page |
| `components/journey/`, `three/` | The scroll journey and the 3D turf |
| `components/cards/`, `components/sections/` | The Football card and the "How we build" section |
| `components/chatbot/`, `lib/chat/` | The chat window and its questions |
| `public/videos/` | The prepared videos and pictures |
| `lib/leads/`, `lib/telegram/`, `lib/email/`, `lib/whatsapp/` | The enquiry engine |
| `video/`, `photo/` | Your original files, untouched |

## Mini glossary

- **Enquiry / lead:** a visitor's project details sent through the website.
- **Telegram bot:** an automatic sender that posts each new enquiry into a Telegram chat for the SLORA team.
- **Stand-in / placeholder:** temporary content that shows the design until the real thing is supplied.
- **Licence:** permission to use a font, photo or video commercially.
- **Database:** the safe place enquiries are stored.
- **Specimen:** a single page that shows the fonts, colours and a sample, used to agree the look.

---

## 0. The eight things that shape this plan

1. **The brief in one line.** *SLORA doesn't sell grass; it builds surfaces people move on.* One continuous black, cinematic, editorial experience, and underneath it a lead-generation system: EXPLORE → UNDERSTAND → CONFIGURE → ENQUIRE → WHATSAPP. Design first, Three.js second.
2. **The supplied assets are thinner than the prompt assumes.** We have one photo (the logo), two 10-second clips and one type reference. Missing: project/product photos, before/after, drone footage, GLB models, the Instagram style reference, verified specs, the project list, and every credential (WhatsApp, Telegram, email, AI). The Raguram Sports site could not be retrieved (no URL supplied and search returned nothing), so sports categories come from the prompt itself. The plan uses a **`verified` flag on every content record** so nothing invented can ship (§4.4).
3. **Both videos look AI-generated.** A translucent ✦ sparkle mark sits at about 90% across / 83% down in essentially every frame (≈ pixel 1740, 900 at 1080p, ~72 px wide), which is the mark Veo/Gemini-style generators add. Consequences: get clean exports, don't present the footage as real SLORA projects, and build every video through a swappable `VideoSlot` so real footage drops in later (§2.3).
4. **The hero clip is already a montage that descends the wrong way for us.** It runs *macro grass → pitch → multi-sport court → athletics track → dusk facility → night floodlit*. **Played in reverse it is exactly the "stadium → camera down → turf → macro grass" transition the prompt asks for (P§8)**, using only supplied footage. The macro frame even shows fibres above the black backing stitch line, which is the natural hand-off into the 3D cross-section.
5. **Video 2 is a genuine installation sequence, but it supports 7 stages, not the prompt's 8** (§2.2). It shows compaction, levelling, roll-out, cutting, edge fixing, infill/brushing and the finished pitch. It does **not** show site survey, drainage, line marking, quality check or handover, so under the prompt's "only display stages that are supported" rule those never appear as video chapters.
6. **The type reference is *Mamenchisa*** (Drizy Studio), a 1970s psychedelic display face. It is **not** free for commercial use in the version I found (demo, personal use only), and its personality fights the "premium, architectural, not childish" brief. Resolution: **"Controlled Groove"**, meaning we take the *composition devices* strongly and use the letterforms sparingly (§3).
7. **The lead engine is the business-critical path.** Build it as a deterministic state machine with the LLM as interpreter (never the decider), capture-before-notify, and pull a backend spike forward so it isn't left to Milestone 3 (§5.4).
8. **The prompt contradicts itself in five small places.** Resolutions are in §1.3.

---

## 1. The master prompt, distilled end to end

### 1.1 What gets built

| Layer | Prompt § | Content |
|---|---|---|
| Identity | 1–4 | Black `#000` · Off-white `#F5F5F3` · White · Gold `#D9A441` (accent only). Heavy/thin editorial type + mono for technical data. |
| Journey | 5, 33, 50 | ENTRY → HERO → SURFACE → SPORTS → HOW WE BUILD → ENGINEERING → STADIUM → LANDSCAPE → PLAY → PROJECT UNIVERSE → MATERIALS → BUILD WITH SLORA → ABOUT → CONTACT. Transitions are the product. |
| Signature moments | 6–12 | Logo-assemble entrance → hero video → hero→turf transition → 3D turf cross-section → glass "How We Build" video. |
| Content sections | 13–21 | Editorial cards, sports rail, stadium 3D, landscape, playground, project universe, case studies, engineering, material library. |
| Lead system | 22–32, 49 | AI chatbot (6 questions) ↔ configurator sharing one schema → validate → store → Telegram ∥ Email → WhatsApp CTA. |
| Platform | 35–42 | Next.js, React, TS, Tailwind, GSAP + ScrollTrigger, Lenis, R3F + Drei. Perf, mobile, a11y, SEO, security are first-class. |
| Delivery | 51–54 | Four milestones (mapped to phases in §6). |

### 1.2 Hard rules I will enforce in code, not just in review

- **Never invent** specs, pile height, area, certifications, prices, warranties, timelines, or project claims (P§12, 15, 21, 30). → `verified` + `source` on every record; unverified fields don't render in production.
- **Never lose a lead** (P§28, 49). → persist first, notify second, notifications independent.
- **No secrets in the browser** (P§25–27, 35, 37, 38). → all notification/AI calls in Route Handlers; `.env.example` only.
- **WhatsApp number in one place** (P§25) → `NEXT_PUBLIC_WHATSAPP_NUMBER` read by a single `lib/whatsapp` module.
- **Gold is an accent** (P§3), **glassmorphism only around the second video and the chatbot** (P§11, 22).
- **Do not copy Raguram Sports** (P§1).
- **Don't init every 3D scene at load** (P§39) → mount on intersection, unmount off-screen.

### 1.3 Contradictions in the prompt and how I resolve them

| # | Conflict | Resolution |
|---|---|---|
| 1 | P§5 order (…LANDSCAPE → ENGINEERING → PROJECTS) vs P§33/§50 (…HOW WE BUILD → ENGINEERING → STADIUM → LANDSCAPE…) | Use **P§33/§50**: they agree, and P§33 explicitly lets us adjust after analysing video 2. |
| 2 | Nav: P§6 shows 6 items ending CONTACT; P§34 shows 6 + `CONTACT →` with ABOUT | Use **P§34** (superset) plus the persistent `BUILD WITH SLORA →` CTA. The entrance shows the P§6 list and resolves into P§34. |
| 3 | P§12 lists 8 "How We Build" stages; the video supports 7 *different* ones | Video chapters follow the footage (§2.2). The 8-stage list lives in Engineering (P§20) as **SLORA's process copy, pending client approval**; unsupported stages get "photo pending" slots, not video. |
| 4 | M1 includes the chatbot *visual shell*, but chatbot logic is M3 | Build the shell against the **final lead schema types from day one** (P§32), driven by a mock flow, so M3 swaps the engine, not the UI. |
| 5 | P§53 orders the backend last; P§48 says leads are the business goal | Keep the milestone order for *UI* but **start a headless lead-pipeline spike in Phase 0/2** (§6, Phase 3 note). |

---

## 2. Asset analysis

### 2.1 Logo: `photo/slora_logo.png`

- **File:** 508 × 264 RGBA PNG, wordmark on black satin with soft specular folds. A slightly different blue-grey strip at the right edge (x ≳ 462) is a crop/screenshot artefact.
- **Mark:** three stacked, slanted, S-forming bars: white, white, **gold** (bottom, offset left). Wordmark: white, extended, geometric, angular terminals. The **A has no crossbar**; a small gold triangle fills its counter.
- **Gold in the logo** samples at ≈ `#CBA968`–`#D1A865`, a paler champagne than the brand token `#D9A441`. Decide which is canonical before we tune UI gold against the logo.
- **Unusable for the entrance as-is:** 508 px wide is far too low-res to render large, and the "logo assembles" animation needs **separated vector parts** (three bars, S-A-L-O-R-A letters, the A's triangle). Request the SVG/AI source.
- **Design ideas taken from it:**
  - The **three bars = three layers**, which is the same story as the turf cross-section (fibre / infill / base). Use the bars as the entrance assembly, as the loader, and as the section-transition motif.
  - The **black satin** is the reference for the ENTRY environment (soft folds, low-key sheen) and for the grain we lay over cards (§3).
  - The **gold triangle** can double as the small "active" glyph in nav and cursor states.

### 2.2 Videos (both 1920×1080 · 24 fps · 10.0 s · H.264 · ~7–8 Mbps · 9–10 MB · each has an AAC audio track)

**`hero_portion.mp4`** (a 6-shot montage; hard cuts at 6.0 s and 7.5 s, dissolves elsewhere)

| t (s) | Shot | Best use on the site |
|---|---|---|
| 0.0–1.5 | Macro, side-on: turf fibres above a black backing stitch line | Hand-off into 3D cross-section (SURFACE) |
| 1.5–3.0 | Low-angle football pitch, centre circle, goal in distance | FOOTBALL card / sports panel |
| 3.0–4.0 | Indoor multi-sport court (blue/green, multi-colour markings) | MULTI-SPORT card |
| 4.0–4.5 | Dissolve court → track | (transition) |
| 4.5–6.0 | Macro athletics track (red granules, white line) | ATHLETICS card |
| 6.0–7.5 | Dusk facility: fenced pitches, goals, building, floodlights | STADIUM entry |
| 7.5–10.0 | Night, wide, floodlights, slow forward camera | **HERO opener** |

**`video_2.mp4`** (7 chapters; the wording is footage-honest and SLORA must confirm terminology)

| t (s) | Shot | Chapter label (provisional) | Nearest prompt stage |
|---|---|---|---|
| 0.0–1.5 | Plate compactor over crushed-stone sub-base | 01 BASE COMPACTION | 04 Base construction |
| 1.5–3.0 | Raking / levelling the stone base | 02 BASE LEVELLING | 02 Ground preparation |
| 3.0–4.5 | Rolled turf edge revealing the backing | 03 TURF ROLL-OUT | 05 Surface installation |
| 4.5–6.0 | Trimming turf on its backing with a utility knife | 04 CUTTING & FITTING | 05 |
| 6.0–7.5 | Hammering / fixing at an edge or seam | 05 EDGE FIXING | 05 |
| 7.5–8.5 | Power-brush + infill spread | 06 INFILL & BRUSHING | 05 / finishing |
| 8.5–10.0 | Finished pitch beside an athletics track | 07 COMPLETED SURFACE | 08 Handover (visual only) |

**Not shown, so not claimed in video chapters:** site survey, drainage, line marking (lines exist in the final shot, but no marking is performed), quality check, handover.

### 2.3 Issues and how each is handled

| Issue | Handling |
|---|---|
| **✦ watermark** in every frame | 1) Ask for clean exports from the source tool/plan. 2) Interim: composition keeps a heavy corner vignette + gradient over the lower-right so the mark isn't a focal point. I'm deliberately *not* planning inpainting/removal tricks. |
| **Looks AI-generated** | Never caption it as a specific SLORA project; keep it out of Project Universe / Case Study; consider a small "illustrative footage" note until replaced. Every video goes through `VideoSlot` + `data/media.ts`, so real drone/installation clips replace it without touching components. |
| **Only 10 s each** | Hero = short ambient loop + scroll-scrubbed reverse (§6, 1F). Video 2 = scroll-scrubbed chapters, not a played-once clip. |
| **Colour** (saturated green/blue/red vs black + gold brand) | Bake a grade into the encode (lift blacks, −15% saturation, slight contrast, gold-leaning highlights) instead of runtime CSS filters, which are costly on mobile. Court/track colours stay natural (real product colours), framed by black vignettes. |
| **Audio present** (hero mean −17.5 dB; video 2 mean −25.7 dB) | Strip for web (`-an`), keep originals in `_source/`. Decide later whether the "How We Build" video gets a "sound on" toggle. |
| **Scrub reliability** | Scroll-scrubbing `<video>` is unreliable unless it's encoded with dense keyframes (reported: ≥ every 5 frames for Chrome/Safari, ~every 2 for Firefox). Plan: dense-keyframe MP4 first; fall back to a **canvas frame-sequence** (deterministic, frame N is frame N) if any target browser stutters. Decided by a short spike (1F). **Outcome (2026-09-21): the video approach was tried first and still stalled on the client's machine, so the frame-sequence is now what ships.** |

### 2.4 Web-encode recipes (Phase 0 script `scripts/encode-video.sh`)

```bash
# Ambient hero loop: night floodlit, 7.5–10 s, no audio, faststart
ffmpeg -ss 7.5 -t 2.5 -i hero_portion.mp4 -an -vf "scale=1920:-2" \
  -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart slora-hero-loop-1080.mp4

# Scrub file: REVERSED (stadium → macro grass), keyframe every 2 frames, 720p desktop
ffmpeg -i hero_portion.mp4 -an -vf "reverse,scale=1280:-2" \
  -c:v libx264 -crf 24 -g 2 -keyint_min 2 -pix_fmt yuv420p -movflags +faststart slora-hero-scrub-720.mp4

# Poster (LCP image)
ffmpeg -ss 8 -i hero_portion.mp4 -frames:v 1 -vf "scale=1920:-2" -c:v libwebp -quality 80 slora-hero-poster.webp
```

Budgets: hero loop ≤ 2.5 MB, scrub ≤ 8 MB (loaded after LCP), poster ≤ 120 KB, mobile variants at 540/720p, all with `+faststart`. Add WebM/AV1 only if the size win justifies the pipeline.

---

## 3. Typography reference: what it actually is, and how SLORA uses it

**Identified:** *Mamenchisa* by Drizy Studio, a 1970s psychedelic display face with ligatures (the specimen writes it "Mamenchis"). The Awwwards chrome (bookmark, share, "Visit Resource") is site UI, not part of the design; ignore it.

**Licence:** the version I found is the **demo, free for personal use only**. A commercial business site needs a **commercial licence, and specifically web-embedding rights** (a desktop licence usually doesn't cover `@font-face`). This is a purchase decision for SLORA, not a technicality.

### 3.1 What the specimen is doing

| The reference does… | Why it works | SLORA translation |
|---|---|---|
| Two words (FEELIN' GROOVY) at ~60% of frame height, **cropped by the frame edges** | Type becomes the *environment*, not a caption | Hero/card words (FOOTBALL, CRICKET…) run off the card edge; always ≥ 1 cropped letter |
| A **tilted object (≈ −35°) laid across the type**, long soft shadow cast onto the letters | Depth from layering: type → shadow → object. The product feels tangible | **Object-through-type:** a turf roll / ball / layered turf slab crossing the word, with a multiply-blended shadow on the letters (FX-02) |
| Heavy, flared, swelling strokes, curved terminals, all caps | Personality at scale | **1–2 words per viewport, ≥ 64 px only.** Never body copy, labels, nav, or forms |
| One family for everything, even the tiny labels | Cohesion; scale does the hierarchy | We deviate on purpose: tiny labels go to **mono**, supporting copy to a **thin sans** (this is the P§4 heavy-vs-thin contrast the reference lacks) |
| Flat saturated colour (yellow on teal) + paper/fabric **grain** | Flat + tactile | Off-white heavy type on black, gold as the *only* accent; same grain (echoes the logo's satin). **No yellow/teal.** |
| Rotated composition breaks the grid | Energy | Rotate **one object** per view (≤ 12–20° on cards), never the type |
| Micro-metadata pinned in corners (`TYPEFACE`, `DRIZY STUDIO`, `700ML`) | Anchors the giant type | Mono corner labels: `01`, `50 MM`, `18,000 SQ FT`. **Verified values only** |

### 3.2 The tension, and my recommendation

The specimen is playful and retro. The brief says *black, spatial, architectural, premium, not childish*, and the SLORA logo is sharp, extended and technical. A wavy '70s face beside that wordmark is a real brand-coherence risk.

**Recommendation: "Controlled Groove."** The logo is the *identity* layer (alone, in black space, never next to the display face at similar size). Mamenchisa, if licensed, is an *expression* layer used only for: the hero words, the 7 sport names, and section numerals. Everything else is disciplined. Keep it swappable via one CSS variable so the decision isn't load-bearing, and **show the client a one-page specimen in Phase 0 and get sign-off before building on it**.

### 3.3 Type system

| Role | Face | Notes |
|---|---|---|
| Display (oversized) | **Mamenchisa** (licensed) → *placeholder* heavy OFL display while unlicensed | `--font-display`; `clamp(4rem, 18vw, 24rem)`; tight leading (0.82–0.9) |
| Editorial thin ↔ heavy | **Geist** (variable, wght 100–900) | Heading weight can animate (FX-07); thin for supporting lines |
| Technical / metadata | **Geist Mono** | Uppercase, +0.08em tracking, gold for "important statistics" only |
| Logo | Asset only | Never re-typeset |

Colour tokens: the four brand colours + derived neutrals (`--surface #0B0B0B`, `--line rgba(245,245,243,.12)`, glass `rgba(255,255,255,.06)`). Gold `#D9A441` for active/selected/CTA/metadata/hairlines only.

---

## 4. Card effects (research + design)

### 4.1 Catalogue

| ID | Effect | What the visitor sees | Tech | Where |
|---|---|---|---|---|
| **FX-01** | **Editorial reveal** (the P§13 hover order) | Media expands → giant word shifts → gold hairline draws → info panel reveals → CTA slides in | One reversible GSAP timeline (`clip-path`, `transform`, `opacity`); pointer parallax ±6 px via `gsap.quickTo`; ≈ 0.9 s total | Every surface/service card |
| **FX-02** | **Object-through-type depth** (from the reference) | Cut-out object tilts across the giant word; its shadow lengthens on hover | 3 layers (type / shadow / cutout PNG or WebP), `mix-blend-mode: multiply` on the shadow, pointer-driven tilt | Hero + FOOTBALL card (needs transparent cut-outs) |
| **FX-03** | **Cursor spotlight + gold edge light** | Soft light follows the cursor; the card border glows gold near it | CSS `radial-gradient` + masked border ring driven by `--mx/--my`, rAF-throttled `pointermove` | Material cards, glass panels |
| **FX-04** | **Glass "thickening"** | On hover the panel gets slightly more opaque/blurred, as if it moved closer | `backdrop-filter` + alpha transition. **Cap: ≤ 2 backdrop-filter surfaces visible at once** | How-We-Build panel, chatbot |
| **FX-05** | **Clip-path scroll reveal + counter-scale** | Image wipes in while the inner image scales 1.3 → 1 | ScrollTrigger + `clip-path: inset()` | All large media |
| **FX-06** | **WebGL displacement / RGB-shift hover** | Subtle liquid warp on the hovered sports panel (gold-tinted, restrained) | **One shared full-page canvas**, planes synced to DOM rects (not a canvas per card); video textures | Sports rail (desktop only) |
| **FX-07** | **Weight-breathing headline** | Heading morphs thin ↔ heavy on hover or scroll (delivers P§4 contrast as motion) | Variable font `wght` via `fontVariationSettings`, GSAP | Section headings |
| **FX-08** | **Cursor label + magnetic CTA** | Cursor becomes a gold ring reading `EXPLORE` over cards; CTAs pull toward the pointer | `gsap.quickTo`; gated by `(hover:hover) and (pointer:fine)` | Desktop |
| **FX-09** | **Card → case-study expand** | The card grows into the project page ("camera travels into the project") | GSAP **Flip** (`Flip.getState` → change layout → `Flip.from`) + App Router transition | Project Universe → Case Study |
| **FX-10** | **Pinned horizontal rail + velocity skew** | Sports panels slide sideways; slight skew follows scroll speed; progress hairline in gold | ScrollTrigger pin + Lenis velocity. **Mobile:** native `scroll-snap` swipe | SPORTS |
| **FX-11** | **Fibre-edge divider** (signature micro-detail) | A hairline made of fine vertical "blades" that sway near the cursor | Tiny canvas/SVG strip | Card bottoms, section breaks |
| **FX-12** | **Grain + vignette film layer** | Tactile black; lifts flat surfaces off the screen | Static tiled noise PNG + CSS gradients (cheap; not a live shader) | Global |

### 4.2 Guardrails

- Animate **only** `transform`, `opacity`, `clip-path`. Toggle `will-change` on hover only.
- All pointer FX gated by `(hover: hover) and (pointer: fine)`. Touch gets tap states.
- `prefers-reduced-motion`: FX-01 → opacity-only reveal; FX-02/06/08/10/11 off; grain stays.
- FX-06 additionally gated by a GPU-tier check (Drei `PerformanceMonitor` + e.g. `detect-gpu`) and never runs on mobile.
- One card-motion module (`animations/cards.ts`) owns the timelines, so effects can't drift apart between sections.

### 4.3 Reference card (FOOTBALL), following P§13 + the specimen

```
┌───────────────────────────────────────────────┐
│ 01                        [ VERIFIED SPEC ]    │  ← mono metadata; renders only if verified
│                                                │
│  FOOT╲                     (rotated turf roll  │
│  BALL ╲  ← huge, cropped   crosses the word,   │
│  TURF     by card edge     shadow on letters)  │
│                                                │
│  built for                                     │  ← thin, Geist 200
│  the game.                                     │
│  ─────────  (gold hairline draws on hover)     │
│  → EXPLORE                     18,000 SQ FT*   │  ← *mono, verified only
└───────────────────────────────────────────────┘
```

### 4.4 Content-integrity rule ("never invent", made mechanical)

Every record in `data/*.ts` is validated by zod and must carry `verified: boolean` and, when `true`, a `source` string (e.g. "client brochure 2026-xx"). Components render specs, area, pile height, certifications and durations **only when `verified === true`**. A unit test fails the build if a spec is present without a `source`. Placeholders render as clearly styled "TO BE SUPPLIED" in dev and are **hidden in production builds**.

---

## 5. Architecture

### 5.1 Stack

Next.js (App Router) · React · TypeScript · Tailwind · GSAP (+ ScrollTrigger, SplitText, Flip; **all GSAP plugins are now free including commercial use**) · Lenis · Three.js · React Three Fiber · Drei · zod · Zustand (shared lead/scene state). Pin the current majors in Phase 0 and check the R3F / Drei / React compatibility matrix at install.

### 5.2 Structure (per P§44)

```
app/                    layout, page, /api/chat, /api/leads, sitemap, robots, opengraph
components/
  navigation/ hero/ typography/ cards/ surfaces/ sports/ stadium/ terrain/
  projects/ configurator/ chatbot/ contact/ transitions/ media/(VideoSlot)
three/                  TurfSurface Stadium Terrain ProjectUniverse MaterialViewer
animations/             hero cards transitions typography scroll chatbot
data/                   projects surfaces sports media leadSchema   (zod + verified flags)
lib/ ai/ telegram/ email/ whatsapp/ leads/  (+ ratelimit, security)
public/ images videos textures models fonts
scripts/                encode-video.sh, make-posters.sh
```

### 5.3 Motion and scroll spine

- **One RAF loop.** Lenis with `autoRaf: false`, driven from `gsap.ticker`; `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.lagSmoothing(0)`. Two loops is the classic cause of ScrollTrigger jitter.
- `ScrollTrigger.refresh()` after fonts and images settle (font load shifts positions).
- Reduced motion: Lenis off, scrub timelines replaced by simple reveals.
- **3D contexts:** per-section `<Canvas>` mounted by IntersectionObserver and **unmounted off-screen**, at most one active, plus (desktop only) the single shared FX-06 canvas. `frameloop="demand"` where nothing animates; `dpr` capped (≈ 1 on mobile); instancing for blades/nodes.
- **Procedural over GLB** for turf and stadium: instanced blades with a vertex-shader wind (≈ 40–80 k desktop, ≈ 8 k mobile, or skip 3D on mobile), and a dark, wireframe-and-gold architectural stadium (no GLB was supplied; commissioning one is optional).

### 5.4 Lead pipeline

```
Chatbot / Configurator ──► Zustand lead draft (shared zod schema)
                                   │
                          POST /api/leads
   validate (zod + libphonenumber-js) → honeypot → rate-limit → idempotency key
                                   │
                         PERSIST (status: pending)   ◄── lead is safe HERE
                                   │
              Promise.allSettled([ telegram.send, email.send ])
                                   │
             update telegramStatus / emailStatus (sent | failed | skipped)
                                   │
        respond { id, whatsappUrl }  →  WhatsApp CTA ALWAYS shown
                                   │
        failed notifications → retry queue (cron / lazy retry), lead never dropped
```

- **Chatbot = state machine first.** The six fields (name, city, requirementType, projectLink?, squareFeet, phoneNumber) and their validators are the source of truth; `/api/chat` sends `{messages, collected, nextField}` to the LLM and gets back `{reply, extracted, intent}` (structured output). The server **re-validates** extracted values; the LLM never marks a lead complete. User text is treated as data (prompt-injection safe); the system prompt's only knowledge source is `data/` records with `verified: true`, and the fallback line is the prompt's: *"I can collect your project details and have the SLORA team get back to you."*
- **Prefill (P§32):** configurator selections write into the same draft; the bot skips answered fields ("Great. Which city is the project in?").
- **AI down (P§49):** two consecutive failures/timeouts → same schema rendered as a structured form.
- **Provider abstractions:** `aiService`, `telegramService`, `emailService`, `leadService`, `whatsapp`. Suggested defaults: a fast Claude model for extraction (e.g. Haiku 4.5), Resend-style email API, managed Postgres for leads. All swappable; **hosting and DB are open decisions** (serverless has no writable disk).
- **Injection points to escape:** Telegram messages (use plain text or escape MarkdownV2/HTML), email HTML, and `projectLink` (accept `http(s)` only, length-capped).
- **WhatsApp:** `https://wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>?text=<encoded prefilled enquiry>`, built in one module. `whatsappClicked` is set via a PATCH carrying a signed per-lead token, so only that visitor can flip it. Missing number → show contact options (P§49), never a broken link.
- **Privacy:** leads never leave the server except as the visitor's own confirmation summary. Add a short consent/notice line in the chatbot (India's DPDP Act applies to collecting phone numbers; SLORA should confirm the wording with counsel).

### 5.5 Failure matrix (P§49)

| Failure | Behaviour |
|---|---|
| Telegram fails | Lead already stored; `telegramStatus=failed`; retry; user unaffected |
| Email fails | Same, independently |
| Both fail | Lead stored + alert to an ops channel; user still gets THANK YOU + WhatsApp |
| AI fails | Structured-form fallback, same schema |
| WhatsApp number unset | Show phone/email contact options |
| DB write fails | Retry once; then keep the draft client-side, show "we'll keep your details ready", and log loudly. This is the one path with no safe net, so it gets a health check and alerting |

---

## 6. Phase-by-phase build plan

Sizing is relative (S/M/L/XL), not calendar promises. Each phase ends with a review gate.

### Phase 0: Foundations & asset prep (S) — ✅ COMPLETE (2026-09-21)

**Do**
- [x] Resolve the decisions/inputs in §8. *These need SLORA, so defaults were applied instead:* placeholder display face, stand-in footage, no credentials. Still open: see §8.
- [x] Scaffold Next.js 16 + TypeScript 5.9 + Tailwind 4; ESLint 9 / Prettier; Vitest 5 + Playwright (desktop + mobile projects); CI workflow; `.env.example`; folder skeleton (§5.2); `README.md`; project rules in `CLAUDE.md`.
- [x] `scripts/encode-video.mjs` (§2.4) → 7 videos + 4 stills, all inside their byte budgets (`npm run assets:check`); `data/media.ts` manifest + `components/media/VideoSlot.tsx`.
- [x] **Type specimen** at `/specimen` (three open-licence display faces, heavy↔thin ladder, mono labels, palette, hero mock-up, Football card with the §13 hover order). **Awaiting client sign-off.**
- [x] **Backend spike (headless):** zod lead schema, phone validation (libphonenumber, India default, E.164), `LeadStore` interface + memory and dev-file adapters, `submitLead` pipeline, Telegram / email / WhatsApp services, honeypot + rate limit + body cap, `POST /api/leads` (no `GET`).

**Done when: results**

| Criterion | Result |
| --- | --- |
| `npm run dev` shows the specimen | ✅ `/specimen` renders on desktop and a 390 px phone; no console errors; all three display fonts load; no horizontal overflow |
| Encoded assets meet §2.4 budgets | ✅ 11 / 11 within budget (hero loop 1.38 MB, hero scrub 7.43 MB, hero poster 81 KB, video-2 scrub 6.58 MB, …) |
| Lead endpoint passes tests incl. "Telegram down → lead still stored" | ✅ 112 unit tests (Telegram down, email down, both down, a notifier that throws, storage retry, storage down, duplicate submit, hostile input, rate limit, honeypot, secret redaction) |
| Live check | ✅ Real `POST` to a running dev server: 201 + normalised record on disk; identical re-submit → same id, `duplicate: true`; hostile input → 400 with per-field messages; no credentials → both channels `skipped`, `whatsappUrl: null` (never invented) |

**Also verified:** `tsc --noEmit`, `eslint`, `prettier --check` clean · production build OK · 10 Playwright tests (5 × desktop + mobile) pass on the production build.

**Deviations from the plan, and why**
- The encode script is Node (`.mjs`), not bash, so it runs on Windows, macOS and Linux alike.
- **TypeScript is pinned to 5.9** (typescript-eslint does not support TS 7) and **ESLint to 9** (what `eslint-config-next` 16 targets; it prints a support notice, revisit later).
- `EMAIL_FROM` was added to `.env.example`; email providers refuse to send without a verified sender. `EMAIL_PROVIDER_API_KEY`, `LEAD_NOTIFICATION_EMAIL`, `TELEGRAM_*`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `AI_API_KEY` are unchanged from the prompt.
- **A production build refuses leads until a durable store is configured** (`LeadStorageNotConfiguredError` → 503). Dev uses `.data/leads.json` (git-ignored); tests use memory. This makes the "never lose a lead" rule fail loudly at deploy time.
- **Bug found by the browser tests and fixed:** the default store was resolved before validation, so bad input got 503 instead of 400. It is now resolved lazily (validation first), with unit tests.
- **Bug found by screenshots and fixed:** `aspect-ratio` + `min-height` widened the hero box on phones; fixed with an explicit `width: 100%`.
- The specimen uses three open-licence faces (Unbounded, Shrikhand, Bagel Fat One) in place of *Mamenchisa* (licence). Unbounded is the working default behind `--slora-font-display`.
- Response bodies from `/api/leads` deliberately omit per-channel delivery status and stored details (the WhatsApp link is the visitor's own message).

**Not built yet from the backend spike (Phase 3):** signed per-lead token + `PATCH` for `whatsappClicked`, retry queue for failed notifications, the production database adapter (blocked on §8 #12), shared/distributed rate limiter (the current one is per-instance), the `/api/chat` LLM route and the chatbot state machine.

**Carry-overs into Phase 1:** ~~the 2.5 s ambient hero loop needs a cross-fade at the seam~~ *(done in 1D: seamless 2 s loop)*; ~~the ✦ mark is only dimmed and still faintly visible~~ *(done in 1D: hidden under the round SCROLL button; still needs clean footage, §8 #3)*; scroll-scrub technique still to be chosen by the 1F spike; the gold token (`#D9A441` vs the logo's ≈ `#CBA968`) is still undecided (§8 #2).

### Phase 1: Milestone 1, "It already feels premium" (XL) — prompt P§51 — ✅ BUILT (2026-09-21), review gate pending

**Verification (current, after the frame-sequence change, the card deck, Sports and the real Contact/About content):** `tsc`, `eslint`, `prettier` clean; **225 unit tests**; **65 Playwright checks passed, 21 skipped by design, 0 failed** (each project skips tests that only apply to the other one) on the production build. Occasional flakes happen on this shared, software-rendering machine (2 in one earlier run) and always pass on the automatic retry — see the Sports section's test-infrastructure note. Earlier, the whole scroll was watched frame-by-frame in real Edge, the chat was driven with good and bad answers, and the 3D scene's WebGL draw calls were counted (0 before the 3D phase, 15 in 1.5 s while visible in a software renderer, 0 after scrolling past).

| Step | Status | What exists / what is left |
|---|---|---|
| 1A Design system | ✅ (cursor layer only inside the card) | Tokens, grain, GSAP registration (`lib/gsap.ts`), Lenis on GSAP's ticker, stage store (`lib/stage.ts`), `useReducedMotion`, `VideoSlot`, shared `WatermarkCover`. FX-08 cursor label lives in `EditorialCard`; a site-wide cursor layer is not built |
| 1B Entrance | ✅ (interim raster logo) | `components/transitions/Entrance.tsx`; replace `components/brand/Brand.tsx` when the vector logo arrives (§8 #2) |
| 1C Navigation | ✅ | `components/navigation/Header.tsx`. Active section via nested-aware ScrollTriggers; `BUILD WITH SLORA →` opens the chat (`lib/chat/store.ts`) |
| 1D/1E Hero + type | ✅ | Seamless 2 s loop; SplitText reveal; headline exits by scroll progress inside the journey |
| **1F Hero → Surface** | ✅ | **Spike result:** in Edge/Chromium, dense-keyframe (`-g 2`) MP4 scrubbing seeks in a median 13–22 ms (p90 18–39 ms) and shows a new frame on ~88–90 % of animation ticks in both directions → *(originally `<video>` scrubbing was chosen. **Reversed 2026-09-21: the client still saw buffering on their machine, so the descent is now a canvas frame-sequence, see "Second smoothness pass" below.**)* Safari/Firefox/iOS **not yet tested (risk, Phase 4)**. `components/journey/Journey.tsx`: one tall pinned stage (8.5 screens), one progress value `P`, eased; timing lives in pure functions (`lib/journey/phases.ts`, unit-tested). Phase map: headline out 0–0.1 · loop→scrub 0.025–0.075 · scrub 0.075–0.5 · scrub→3D 0.46–0.54 · 3D path 0.5–1. Depth gauge, brand statement, ring-button (also covers the ✦ mark). **Revised 2026-09-22:** added a short line, **"Every Game Begins with the Ground"**, that fades in and out early in the descent — between the "THE ARENA" and "THE SURFACE" labels on the depth gauge, gone again before the brand statement takes its turn (`groundLineOpacity()` in `lib/journey/phases.ts`, same fade shape as the statement). It shares the statement's own on-screen spot (bottom-right) rather than the gauge's side, so it can never collide with the gauge's own labels. Desktop/wide-screen only, like the rest of the immersive journey. Tests: extended `tests/unit/journey.test.ts` |
| **1G 3D turf** | ✅ (desktop only) | `three/TurfSurface.tsx` (26 000 instanced blades, GPU wind, edge-aware bend), procedural speckle textures (no downloads), cut-away block: fibres/infill/backing/base/drainage/subgrade + 3 pipes, drei `<Html>` labels revealed by progress, mouse parallax, `PerformanceMonitor` drops DPR. Camera path in `lib/journey/camera.ts` (unit-tested). **Renders only while on screen** (own visibility trigger; end-of-pin edge case fixed). Layer names/order only, **no measurements**, drawn as "ILLUSTRATIVE · NOT TO SCALE" (`data/turf.ts`) |
| **1H First editorial card → surface-card deck** | ✅ | **Now five cards** (Football, Pickleball, Shuttle court, Park setup, Basketball) in `components/cards/CardCarousel.tsx`, opened from `components/sections/SurfaceCards.tsx`: right arrow (wraps round; ring shows progress), left arrow after the first card, a name row to jump to any card, swipe (touch/pen), ←/→ keys, `inert` on off-screen cards, an `aria-live` announcement, GSAP `xPercent` track with the incoming card's word lines / picture / slab animated on arrival (word *lines*, not the word box, because the box has CSS hover transforms). Card data in `data/surfaces.ts` (`label`, `slab`); giant-word sizing in `lib/cards/carousel.ts` (`wordScale`: lower line counts +0.5 letter because it sits by the slab; `wordScaleNarrow` for phones). Pictures are **illustrative stand-ins** cut by `scripts/encode-video.mjs` (`still()` helper) into `public/videos/slora-court-*.webp` and `slora-park-still.webp`, registered in `data/media.ts`; waiting cards' images are fetched once the deck is within 120 % of the viewport. Court cards' slab has **no layer names** (SLORA's court build-ups are unknown, never invented). Tests: `tests/unit/carousel.test.ts`, `tests/e2e/cards.spec.ts`. Card details: `components/cards/EditorialCard.tsx`: P§13 hover order, FX-03 gold edge light + spotlight, FX-05 clip-path reveal, FX-08 cursor label, depth movement via CSS `translate` variables (no clash with hover transforms). Metadata (`spec`, `area`) only renders when verified data exists (`data/surfaces.ts`); the specimen reuses the same card with placeholders. **Revised 2026-09-22:** every card got a **"Connect with us"** button (`lib/cards/enquiry.ts`'s `askAboutCard`, mirroring `lib/sports/enquiry.ts`) that opens the chat with the card's name as its `interest` and pre-fills `requirementType` only on an exact match (`data/surfaces.ts`'s new optional `requirement` field — today only Football → `"Football Turf"`); switching to a non-matching card takes back a stale prefill, same as Sports. The Football card also got an optional `video` field (`VideoId`, reusing `hero-loop` — the only card with real matching footage) rendered via `VideoSlot` (now accepts `children`, for `WatermarkCover`) instead of a still `Image`. `.card`'s aspect ratio went from 16∶10 to 16∶9.5 and its `min-height` down, to reduce how tall the deck was on request; the giant word's `clamp()` was reduced to match so it no longer overlaps the shorter card. The button sits inside `.body` (`pointer-events: none`, `z-index` raised above `.link`), with `pointer-events: auto` on the button itself only — the same click-through-container technique `Header.module.css` uses. Tests: `tests/unit/cardEnquiry.test.ts`, extended `tests/unit/carousel.test.ts`, extended `tests/e2e/cards.spec.ts` |
| **1I Glass video section** | ✅ | `components/sections/HowWeBuild.tsx`: pinned 6-screen stage, video 2 shown as a **frame sequence painted by scroll** (was a scrubbed `<video>`; see "Second smoothness pass"), glass panel (FX-04), 7 chapters that match the footage, gold marker + per-chapter progress line, panel drift, ring button. Phones: plays the video and the list follows `currentTime`. Names are provisional (`BUILD_NOTE`), §8 #7. **Revised 2026-09-22:** added Contact us / Enquire buttons next to the heading, matching About |
| **1J Chatbot shell** | ✅ (shell only) | `components/chatbot/*`, flow in `lib/chat/flow.ts` (uses the **real** lead schema for each answer, so accepted here = accepted by the server), shared draft store `lib/leads/draft.ts` (P§32: answered fields are skipped), typing indicator, chips + Skip, progress dots, full-screen on phones, Esc closes. **`CHAT_PREVIEW_MODE = true`**: the last screen says nothing was sent. Lazy-loaded panel (≈121 kB gz). **Revised 2026-09-22:** `lib/chat/store.ts` gained an `interest` field (`openChat(interest?)`, `useInterest()`) shown only in the greeting, never sent as data unless it also happens to be a real `requirementType`. The panel (`ChatPanel.tsx`) is downloaded once and then stays mounted for the rest of the visit (`ChatWidget.tsx`), so its "start the conversation" effect now re-runs on every **open transition** (not just the very first mount) and re-reads the live interest each time — the first version froze both at first mount and silently reused the first greeting on a later open with a different card, until a test opening the chat from two different cards caught it. A second, related race (a reply submitted before the first scheduled question even rendered could make `askNext()` run twice and ask the same question twice) is now guarded by a re-entrancy ref. The closing footnote's wording now leads with "our team will contact you as soon as possible", still conditioned on `CHAT_PREVIEW_MODE` so it never promises delivery before the enquiry can really be sent. Tests: extended `tests/unit/chat.test.ts`, extended `tests/e2e/foundations.spec.ts` |

**Smoothness pass (2026-09-21), after the client reported "a lot of buffer / messy" in the descent.** Measured first, in Edge on the production build (software WebGL, so absolute numbers are pessimistic, but the differences are real):

| Measurement | Before | After |
|---|---|---|
| Main-thread stalls ≥ 100 ms after `stage=ready` | **1 350 ms** (3D mount, right when scrolling starts) | **none** |
| Where the 3D set-up cost lands | at `ready`, during first scroll | in the intro's hold (t≈2.4 s), or not at all on no-GPU machines |
| Picture vs scroll after a wheel burst | two easing layers (Lenis 0.09 + own 0.14), seeks queued | one layer (Lenis 0.11); picture reaches its final frame ≈ 0.5 s **before** the scroll glide ends |
| Scroll-video sharpness | 720p everywhere | 1080p (g=3, 8.45 MB) on `(min-width:1500px), (min-width:1100px) and (min-resolution:1.25dppx)`; 720p / 540p otherwise |
| Video → 3D handover | both layers faded → dark dip | 3D fades in **over** the opaque video, video hidden only when 3D is complete (unit-tested: coverage ≥ 0.9999 at every P) |

Changes: `lib/media/scrubber.ts` (one seek in flight; remembers only the latest wish; 7 unit tests with a fake `<video>`); `PHASES` per `JourneyMode` (`full` 8.5 screens / `video` 5.5 screens) in `lib/journey/phases.ts`; **three capability tiers** in `Journey.tsx` — `full` (hardware WebGL), `video` (no GPU: detected with `failIfMajorPerformanceCaveat` **and** the renderer name, because Edge/Chrome with `--ignore-gpu-blocklist` hand out SwiftShader without a caveat), `simple` (phones, reduced motion, save-data); override with `?journey=full|video|light`. 3D: `compileAsync` before the first draw (`frameloop="never"` until compiled), `requestWarmup()` from the entrance hold (`lib/stage.ts`), camera easing 7 → 11. The round button sizes itself from the video frame (`cuePosition().radius`, originally 30–44 px) and is unit-tested not to touch the chat button on five window shapes. **Revised 2026-09-22:** the 44 px cap let the mark peek out on a big monitor (measured: the mark's own points reach ~2% of frame width; at large frame widths 44 px no longer covered that). Now 32–90 px, `COVER_RADIUS_PER_FRAME_WIDTH` raised from 0.0235 to 0.028, plus a unit test asserting `radius > frameWidth * 0.02` at widths up to 3840 px so the button can never again fall below the mark's real size. `WatermarkCover`'s own default radius (used by How We Build's "EXPLORE" ring) was raised to match, since it shares the same bug. Wrapper/inner split for tagline and button (scroll fade vs entrance fade) with a regression test. HowWeBuild got the same scrubber and single-smoothing fixes, and now declares `media` on its `<source>`s (without it the 1080p file would have been sent to every device).

**Lessons:** (1) the double smoothing was my mistake — Lenis already smooths the scroll; (2) `<video>` seeks must be coalesced or the decoder never finishes a frame; (3) detect software rendering by renderer name, not only by the context flag; (4) measure on the production build — dev mode is far heavier. **Still not measured:** Lighthouse, Safari/Firefox/iOS. *(Everything about `lib/media/scrubber.ts` above is historical: that file was deleted in the second pass.)*

**Second smoothness pass (2026-09-21), after the client still reported the hero video buffering when scrolling down.** Root cause: a scrubbed `<video>` must seek + decode on every scroll step; where decode is slow it stalls, and no amount of seek-coalescing removes that. **Decision: replace scroll-driven `<video>` with canvas-painted still frames** (the fallback the plan named in §2.3/1F).

- **Assets** (`scripts/encode-video.mjs`, `SEQUENCES`): `public/sequences/hero-descent/f001–f120.webp` (the hero footage **reversed**, 12 fps, 1440 wide, q58, **7.15 MB**) and `public/sequences/how-we-build/f001–f120.webp` (forwards, q50, **8.13 MB**). The colour grade is baked in as for the videos. `npm run assets:check` verifies frame counts and byte budgets. The old `*-scrub-*.mp4` files were removed (`how-we-build-scrub-540.mp4` stays: it is the phones' plain playback file).
- **Code:** `lib/media/frameMath.ts` (pure, 20 tests: `frameAt`, `coarseIndices`, `pickFrames`, `paintPlan`, `windowIndices`, `nextToFetch`), `lib/media/frameSequence.ts` (`createFrameSequence({canvas, urls, maxDpr, maxWidth, onReady}) → {start, draw, ready, destroy}`), `data/sequences.ts` (frame lists). Loading: 4 parallel fetches, spread-out "coarse" frames (every 10th) first, then nearest to the visitor; decode window of 3 behind / 8 ahead (direction-biased) as `ImageBitmap`s plus the coarse set, everything else closed; failed frames are skipped. Blending only between frames ≤ 2 apart (never a ghostly dissolve across a gap). `Journey.tsx` starts loading in `requestIdleCallback`; `HowWeBuild.tsx` when the section is within 300 % of the viewport. Reduced-motion/phones never used the scrubbed video, so they are unchanged.
- **The first version of the canvas code was itself wrong, found by tracing.** A Chrome trace of a wheel-scroll showed multi-second main-thread stalls that were **not** JavaScript: `CanvasRenderingContext2D::FinalizeFrame → SharedContextRateLimiter::Tick → GPU backpressure (RasterImplementation::Finish)`, i.e. Chrome blocks the page while the canvas' command queue drains. Cause: a repaint on **every decode completion** plus two full-canvas `drawImage`s each time. **Fix:** (1) repaint at most once per animation frame (`queuePaint`, rAF-coalesced; scroll-driven `draw()` is once per tick anyway); (2) never redraw an identical picture (`paintPlan` quantises the blend to 12 steps and returns a lone frame when within 1/24 of it, so a plan key can be compared); (3) canvas backing store capped at `maxWidth` 1440 (the frames' own width) and DPR ≤ 1.5.
- **Measured** (production build, wheel-scroll of the whole page with throwaway measurement scripts that are not committed; long tasks = PerformanceObserver `longtask`, gaps = rAF deltas): Playwright's Chromium with **software GL** (worst case), before → after the fix: long tasks 13–32 → 2–5 per scroll, longest 5.3 s → 0.16 s (frames blocked entirely: 3–5, 0.18 s); 4× CPU throttle: 10, 0.2 s. **Real Edge on this laptop's own GPU** (Qualcomm Adreno X1-45 via D3D11, Snapdragon X Plus): full tier **0 long tasks**, max rAF gap 67–117 ms, 7–9 of ~470 frames over 33 ms; 4× CPU throttle: 0 long tasks, max gap 67 ms; `?journey=video`: **0 of 396 frames over 33 ms**, max gap 33 ms. **Not measured:** a person scrolling in a visible window (one headed run was interrupted), Safari, Firefox, iOS, Lighthouse.
- **Tests:** `tests/e2e/foundations.spec.ts` now counts only the 3D canvas (`canvas:not([data-frames])`) and has two tests that scroll and check the canvas actually paints (non-black, opacity 1) and that the picture changes between two scroll positions, for the descent and for HOW WE BUILD; and that the only `<video>` on the desktop journey is the looping hero.
- **Removed:** `lib/media/scrubber.ts` and its test, `scrubTime()` (its tests now use `frameAt(descentProgress(p))`), the `hero-scrub` / `how-we-build-scrub` entries in `data/media.ts`.
- **Known flake:** the entrance test's "SKIP button visible" failed once in a full run and passed in 5 later runs; cause not found (the button is `display:none` on repeat visits, so a leaked `sessionStorage` "seen" flag or extreme load are the suspects).

**Weights (production build, gzip, measured in Chromium):** initial JS ≈ **201 kB** before the intro ends, no 3D in it (plan budget ≲ 200 kB); 3D chunk ≈ **237 kB** fetched only after `stage=ready`; chat + phone-number checker ≈ **121 kB** fetched on first open. **Not yet measured:** Lighthouse scores, real-device FPS (the 3D was only rendered in software here), Safari/Firefox behaviour.

**Deviations and lessons**
- The header's active-section logic first used IntersectionObserver; nested pinned sections made it unreliable, so it uses ScrollTrigger and picks the innermost active section.
- Bugs found by testing and fixed: a TDZ crash in the header (list used before creation), the 3D loop running while off-screen, the 3D loop stopping at the exact end of the pin, the skip button hidden from AT, hover/depth transform clash in the card (fixed by design before shipping), a React-StrictMode-only greeting bug in the chat.
- E2E now runs 2 workers with 60 s timeouts (software WebGL is slow) and ignores three.js's own "THREE.Clock deprecated" console notice from inside react-three-fiber.
- The page order follows the brief (P§33): surfaces → sports → **how we build** → landscape → projects → about → contact, while the menu keeps the P§34 order. The highlight therefore jumps 02 → 05 → 03 while scrolling; reordering the menu to match is a one-line change if SLORA prefers.

**Carry-overs:** the ✦ mark is covered but the footage still needs replacing (§8 #3); vector logo (§8 #2); Safari/Firefox/iOS testing of the frame-sequence canvas and the card deck's swipe; real photographs for the four new cards (§8); Lighthouse; a site-wide cursor layer; the chat CTA from cards (prefill).

**Original specification for each step** (unchanged):

| Step | Deliverable | Notes / acceptance |
|---|---|---|
| **1A Design system** | Tokens, type, grain/vignette (FX-12), Lenis+GSAP provider, motion presets, `useReducedMotion`, cursor layer, `VideoSlot`, `Section` transition primitive | One RAF loop verified; reduced-motion switches motion off |
| **1B Entrance** | Black → logo bars assemble → wordmark → logo travels left → environment arrives from the right; logo docks into nav | Uses vector logo parts. **Not** a navbar fade. Returning visitors (session) get a short version; skip control present. Hero poster preloaded behind the curtain so nothing pops in |
| **1C Navigation** | Docked logo, `01 SURFACES … 06 CONTACT`, persistent `BUILD WITH SLORA →`, gold active indicator, scroll progress hairline, mobile menu | Keyboard + focus states; P§34 not overloaded |
| **1D/1E Hero video + typography** | Video dominant; **WE BUILD / *the ground* / YOU MOVE ON.**, each layer animated independently (SplitText, clip-path, scale, parallax) | Text occupies ≲ 40% of frame; watermark de-emphasised by vignette; heavy/thin contrast visible |
| **1F Hero → Surface transition** | Scroll pins hero and scrubs the **reversed** clip (stadium → … → macro grass), crossfading to the R3F macro scene at the stitch-line frame | **Spike first (short):** dense-keyframe `<video>` scrub vs canvas frame-sequence. Pick by smoothness on Chrome, Safari, Firefox, iOS |
| **1G 3D turf prototype** | Instanced blades → camera dives → **cross-section**: GRASS FIBRES / INFILL / BACKING / BASE / DRAINAGE labels animate in; mouse parallax; scroll = camera progress | Architectural, not game-like. 60 fps on a mid laptop; desktop-only 3D, mobile gets macro video + CSS layers. Labels use *generic layer names* only, no measurements |
| **1H First editorial card** | FOOTBALL TURF card with FX-01, 03, 08, 11 (FX-02 if cut-outs exist) | Implements the exact P§13 hover order; touch + reduced-motion variants |
| **1I Glass video section** | Dark stage + large cinematic **video 2** + floating glass panel listing the **7 supported chapters**; scroll advances chapter, gold active marker, panel drifts slightly | Scrubbed with the same technique as 1F. Panel blur/opacity per FX-04. Mobile groups to 4 steps (PREPARE / LAY / FINISH / DELIVER) |
| **1J Chatbot visual shell** | Floating button; glass panel; message animation; typing indicator; quick options; `●──●──●──○──○` progress; full-screen on mobile | Mock flow over the **real** lead schema. No backend |

**Milestone 1 gate:** Lighthouse mobile perf ≥ 80 on the hero page (relaxed while 3D is prototype), LCP < 2.5 s desktop, no CLS from fonts, 3D lazy-mounted, visual review with the client.

### Phase 2: Milestone 2, "The world" (XL) — prompt P§52

Order chosen to reuse the most: **Sports → Engineering → Stadium → Landscape → Play → Project Universe → Case study.**

- **Sports (FX-10, optionally FX-06):** 7 panels (Football, Cricket, Hockey, Tennis, Padel, Multi-sport, Athletics). Football / multi-sport / athletics use the **sliced hero footage** (§2.2); the rest use stills, or `verified:false` placeholders until supplied. Mobile = swipe cards.
  - **Built 2026-09-21 (structure; content still stand-ins).** `components/sections/Sports.tsx` + `Sports.module.css`, data in `data/sports.ts` (`SPORT_PANELS`: name, one/two-line giant word, placeholder tagline, exact-match `requirement`, image with optional crop/zoom, optional verified `applications`/`technical` that render only when present). **Pinned rail** (graphics-card devices, ≥ 900 px, no reduced motion): tall section (`height` measured = distance + stage height, set in a `refreshInit` listener so ScrollTrigger sees it), `position: sticky` stage with `overflow: clip` (focus can never scroll it sideways), one progress value from ScrollTrigger → `translate3d` of the row, per-panel picture drift (`parallaxShift`), scroll-speed skew (`skewFromVelocity`, eased in a ticker that only runs while the section is on screen), gold progress line and counter, keyboard `focusin` scrolls an off-screen panel into view via Lenis. **Swipe row** (everything else): native `scroll-snap-type: x mandatory`, counter + progress line from the scroll position, prev/next buttons. Pure maths in `lib/sports/rail.ts` (`railDistance`, `sectionHeight`, `trackOffset`, `activePanel`, `progressForPanel`, `skewFromVelocity`, `parallaxShift`, `railLayout`), 18 unit tests in `tests/unit/sportsRail.test.ts`. The panel button calls `askAboutSport()` (`lib/sports/enquiry.ts`): `prefill({ requirementType })` **only** for an exact `REQUIREMENT_TYPES` match (Football Turf, Cricket Turf, Multi-Sport), otherwise nothing is guessed, and a value an earlier panel filled in is taken back out (never wiping one the visitor chose; 7 unit tests). Only *type* imports come from `lib/leads/schema` so the phone-number library stays out of the initial bundle. **FX-06 (WebGL displacement hover) was not built** (optional in the plan; not worth a shared canvas). **Revised 2026-09-22:** the giant word's height cap for a two-line title (`--cap` in `Panel`'s inline style) is sized from viewport *height* (`calc(var(--cap) * 1svh)`), while the tagline underneath it keeps a roughly fixed height — so on a window wide enough for the pinned rail but not very tall, "FOOTBALL"/"MULTI-SPORT" (the only two-line titles) ran into the sentence below them. Measured the real gap by `getBoundingClientRect()` at several viewport heights down to 600px and reduced the two-line cap from 17 to 10 so a clear gap survives even there (one-line titles, capped at 22, were never affected). Screenshot-verified at 600/650/700/800px and on a phone.
  - **Stand-in pictures:** two new stills cut by `scripts/encode-video.mjs` (`slora-athletics-still.webp` t=5.3 s, `slora-dusk-court-still.webp` t=6.6 s); the macro-grass still is now registered in `data/media.ts` as `macro-grass` (it was hard-coded in `SurfaceFallback`, against the "media paths only in `data/media.ts`" rule). Tennis/Padel reuse the blue-court and night-court stills with different `object-position`/zoom.
  - **Why the pinned rail is graphics-card-only (measured, production build, wheel-scroll through the section):** real Edge on this laptop's Adreno GPU: **0 long tasks, max rAF gap 67–150 ms** (4× CPU throttle: 0 long tasks, 84 ms). Software GL (no GPU): **114–141 long tasks, 31–34 s of main-thread stall, longest 1.6 s**. Isolation experiments (injected CSS): hiding the pictures removed every long task (0); parallax + skew off only halved it (66 tasks); picture opacity, oversize frame, `object-fit`, panel `overflow`/`isolation`, `will-change` made no difference; caching `rail.clientWidth` and reading Lenis' scroll instead of `window.scrollY` (removing forced layout) made no difference. Trace: main-thread `Layerize` (≈ 11 ms/frame), `PrePaint`, and style recalcs on every frame because JS moves the row, all made expensive by the pictures in software rendering; repeat passes over the same section cost the same, so it is a steady per-frame cost, not first-draw cost. The native swipe row in the same worst case: 3–12 short tasks, longest 0.08–0.26 s. **Decision:** `railLayout()` gives the pinned rail only to `tier === "full"` (shared detection moved to `lib/device/capability.ts`, used by `Journey` and `Sports`; `?sports=pinned|swipe` overrides for review but can never beat reduced motion or a narrow screen). The removed cost is the JS-driven moving of big pictures; if the rail is ever wanted on software rendering, a compositor-driven approach (CSS scroll-driven animations) is the only lead.
  - **Tests:** `tests/e2e/sports.spec.ts` (desktop: tall pinned stage, row slides, counter Football → Athletics, last panel ends inside the screen, seven headings with plain accessible names ("Multi-sport", not "Multisport"), no invented applications, chat opens pre-filled for Football but asks for Tennis, Tab to an off-screen panel brings it into view and the stage never scrolls sideways, menu highlight, no page-wide overflow, the word/tagline gap on a short window; no-GPU default is the swipe row; phone: snapping row, counter follows the arrows, no page overflow; reduced motion and the override). The chat tests use `test.slow()` and 30 s assertions because the frosted-glass chat is very slow to draw in software GL, and they press panel buttons with a real mouse click after the row has come to rest (`pressButton`), because Playwright's own click kept scrolling the page to bring the button into view and, in the pinned rail, 1 px of scroll moves the row 1 px, so it chased the button for minutes (1 failure in 4 runs; 6/6 after the change).
  - **Test-infrastructure findings (2026-09-21):** `playwright.config.ts` now uses `trace: "on-first-retry"` (recording a trace on every test made the software-drawn chat 2–3× slower: 2.6 → 6 s and 1.1 → 3.6 s per step in a like-for-like script), `timeout` 90 s, `expect.timeout` 15 s, `retries: 1` locally too (a pass-on-retry is reported as flaky), and the shared "page is ready" waits are 45 s. Twelve cold loads of the home page in software Chromium: time-to-ready 5.4–7.2 s, no hangs; each load has 10–25 short main-thread freezes in the first 10 s (longest 0.4–0.7 s, one 1.46 s) that are the same with the Sports section hidden, so they belong to the opening animation under software rendering and predate this work.
- **Contact details, hero button, Instagram (P§25, P§34) — built 2026-09-22, real data.** SLORA supplied their address, phone/WhatsApp number and Instagram directly; this is the first **real, non-illustrative** content on the site.
  - `data/contact.ts`: address written exactly as SLORA gave it (`CONTACT_ADDRESS_LINES`, not expanded into a guessed PIN code), `GOOGLE_MAPS_URL` (a plain `google.com/maps/search` query link, no API key needed), `INSTAGRAM_URL`/`INSTAGRAM_HANDLE`.
  - `lib/contact.ts` (`contactLinks()`): the phone number is read through the **existing** `getWhatsAppNumber()` (the one place `NEXT_PUBLIC_WHATSAPP_NUMBER` is read, per the CLAUDE.md rule) — SLORA confirmed it is the same number for calls and WhatsApp — and formatted for display with `libphonenumber-js`. Set in `.env.local` (git-ignored, real value: `919384746930`); `.env.example`'s comment updated to note the dual use. Returns `null` links (never a fabricated number) if unset.
  - `components/contact/ContactPopover.tsx`: the hero's "🗺️ CONTACT US" button; a small menu (WhatsApp / Call / Google Maps) that closes on Escape or an outside click, omits WhatsApp/Call if unconfigured, and opens **upward** in the hero (`openUpward`) because the pinned stage's `overflow: hidden` would clip a downward menu from a button that low on screen. `components/contact/InstagramLink.tsx`: a small reusable round icon link, used in both the hero and About.
  - Hero: both sit inside the *existing* `.taglineBox` wrapper in `Journey.tsx`, as a second `[data-meta]` row — this means they automatically get the entrance stagger-fade (the `meta` selector already picks up every `[data-meta]` element) and the scroll-away fade the tagline already had, with no new animation code.
  - `components/sections/Contact.tsx` (replaces the `ChapterStub`): the address as a small "map card" (a CSS grid-line background + a gold pin SVG) that is one big link to `GOOGLE_MAPS_URL`; the phone number with two separate, differently-styled buttons (WhatsApp filled gold, Call outlined) — two real destinations, not the same link twice.
  - `components/sections/About.tsx` (replaces its `ChapterStub`): kept the honest "IN BUILD" note (no real story/photos yet) but added the Instagram icon + handle, since that much is real.
  - **Tests:** `tests/unit/contact.test.ts` (7: link building, display formatting, graceful nulls, the address/maps/Instagram constants) and `tests/e2e/contact.spec.ts` (12: the hero menu's three links and their real hrefs/targets, Escape and outside-click close it, both Instagram links, the Contact section's address link and its two *different* phone buttons, no page overflow) — all pass, desktop and mobile.
  - **Not done (at the time):** the full 6-digit PIN code (plan §8 #13) and the rest of About's content (§8 #14).
  - **Address corrected/completed, 2026-09-22.** SLORA sent the full address: "3, Anna St, Ranga Colony, Kamarajapuram, Sembakkam, Tambaram, Tamil Nadu 600073". `CONTACT_ADDRESS_LINES` in `data/contact.ts` updated to three lines that, joined with `", "`, reconstruct that exact string (a property asserted in `tests/unit/contact.test.ts`, so a future edit can't silently corrupt it); `GOOGLE_MAPS_URL` follows automatically. §8 #13 is done.
  - **About rebuilt with the real founder story, 2026-09-22.** `data/about.ts` (new): `FOUNDER_NAME`, `FOUNDED_YEAR`/`SINCE` (derived, not duplicated), `PROJECTS_STAT`, `LEAD_LINE`, and `ABOUT_PARAGRAPHS` as arrays of `{text, strong?, brand?}` runs (`strong` = SLORA's own emphasis, bold; `brand` = the word "SLORA" itself, gold, wherever it is named — rendered by a small `Runs` component in `About.tsx`, never `dangerouslySetInnerHTML`). `components/sections/About.tsx` replaces its `ChapterStub`: heading, lead line, the three paragraphs, then Contact/WhatsApp/Enquire actions (`href="#contact"`, `contactLinks().whatsappHref`, `openChat()`) and the existing Instagram link. Reveal-on-scroll uses the same `if (reduced) { gsap.set(..., {clearProps}); return; }` guard as Engineering/SurfaceFallback/EditorialCard, for the same hydration-race reason (§ above).
    - **Iterated live with the client, same day:** (1) a founder photo (`public/images/team/lohith-raghuraman.webp`, cropped from a supplied 1206×1056 JPEG — the circle in the original already fit an ~800×800 square almost exactly, measured with a grid overlay, so `border-radius:50%` alone clips the leftover corners cleanly) was added as `stills["lohith-raghuraman"]` (`provenance:"real"`, the first non-`"illustrative"` entry in `data/media.ts`), (2) the heading briefly matched the site's usual lowercase-thin styling ("new name.") until the client asked for it capitalised ("New Name"), (3) "SLORA" was highlighted gold (`brand` run) on request, (4) the client then asked to remove the photo's caption, then the photo itself. Removing the photo left a large empty gap next to the (now short) copy column on wide screens — flagged by the client as looking unfinished. **Fix:** the two numbers already in the story (100+ projects, founded 2026) became a small stats sidebar (`aside`, a thin left border on desktop, a top border stacked below the copy on mobile) instead of sitting idle in the paragraph text alone — reuses real, already-supplied figures rather than filling the space with anything new.
    - **Tests:** `tests/unit/about.test.ts` (6: the three paragraphs reconstruct exactly to SLORA's given text once emphasis runs are joined; which phrases are `strong` vs `brand`; the removed photo's data is still marked `real`). `tests/e2e/contact.spec.ts`'s "About" tests updated alongside each visual change (currently: no `<img>` in the section; the stats sidebar's `aria-label="SLORA in numbers"` exposes "100+"/"Projects executed"/"2026"/"Founded"; Contact/WhatsApp/Enquire each checked against a real destination).
- **Engineering (P§20 "BEAUTY HAS STRUCTURE."):** the 8-step process scroll. Text is *pending client approval*; video only where the footage exists; "photo pending" slots elsewhere.
  - **Built, then removed (2026-09-22).** A first version was built as a plain scrolling list (not pinned): headline "beauty has structure.", the brief's 8 generic steps, a picture only for the 2 steps the installation footage plainly shows (ground preparation, surface installation — two new stills, `slora-engineering-ground-still.webp`/`slora-engineering-install-still.webp`), "PHOTO PENDING" for the other 6, a scroll-filled gold spine, sharing the nav's single "PROCESS" item with How We Build. **The client saw it and asked for it to be removed**, so it was taken out again in full: the component, its data file, its stills, and its tests. Building this also surfaced and fixed a **real, separate bug**: a hydration-timing race in `useReducedMotion()` (it can briefly report `false` right after hydration before correcting to `true`) combined with GSAP's `.from()` immediately rendering its "from" state could leave reduced-motion visitors with permanently invisible content. Fixed by explicitly clearing residual inline styles when `reduced` is true, in **Engineering (removed with it), `SurfaceFallback.tsx`, and `EditorialCard.tsx`** (the two still in use) — this fix stayed after the section that found it was removed.
- **Stadium 3D (P§15):** OUTSIDE → ENTRANCE → STANDS → FIELD → TURF, then `PERFORMANCE`. It shows **only verified project data** (else the section ends on the turf, with no numbers).
- **Landscape (P§16):** STADIUM → FIELD → GREEN → GARDEN → TERRACE → ROOFTOP → RESORT, headline **GREEN WITHOUT LIMITS.** Needs real project photography; otherwise stays behind a feature flag.
- **Playground (P§17):** architectural, safety-flooring focus, not childish. Photography-dependent.
- **Project Universe (P§18):** instanced nodes in a dark spatial scene; hover expands, click flies the camera into the project (FX-09 Flip for the DOM hand-off). Data-driven from `data/projects.ts`; **only real projects render in production**.
- **Case study template (P§19):** BEFORE / BUILD / AFTER, then LOCATION · APPLICATION · AREA · SURFACE · SCOPE · DURATION. Sections without assets collapse gracefully.

**Gate:** every section is data-driven with the integrity rule (§4.4); no unverified spec renders; scroll performance holds through the full page.

### Phase 3: Milestone 3, "The lead engine" (L) — prompt P§53

Order: **backend first**, because it de-risks the business goal (the Phase 0 spike is extended, not restarted).

1. Lead model + persistence (P§29), idempotency, retry queue, admin-only access.
2. Validation, rate limiting, spam protection, secure headers (P§38).
3. Telegram service (server-side; exact P§26 format) and email service (P§27 template) with real credentials.
4. WhatsApp module + prefilled message (P§25); `whatsappClicked` tracking.
5. Chatbot logic: state machine + `/api/chat` LLM interpreter, guardrails, structured-form fallback, completion screen (P§24).
6. Project configurator sharing the schema; "Build with SLORA" → chatbot hand-off with prefill (P§32).
7. **Material library (P§21):** SPORT / LANDSCAPE / PLAY / MULTI-SPORT; hover/select; spec panel shows **verified data only**.

**Gate:** Playwright covers full journey, Telegram-down, email-down, AI-down, WhatsApp-unset, duplicate submit, invalid phone, and hostile input; then a live test with real credentials.

### Phase 4: Milestone 4, Production (L) — prompt P§54

Mobile-specific behaviour (not shrunk desktop: video/image-sequence/CSS fallbacks for 3D) · performance pass (budgets below) · SEO (metadata, OG/Twitter, structured data, sitemap, robots, alt text, no keyword stuffing) · accessibility (semantic HTML, focus, ARIA, forms, contrast, reduced-motion) · analytics (funnel: section reach → configurator → chatbot start → each question → completion → WhatsApp click) · error boundaries + monitoring · security review (CSP, rate limits, secrets audit) · cross-browser (Chrome, Safari, Firefox, iOS Safari, low-end Android) · video optimisation · 3D fallback testing · launch checklist (real credentials, domain/DNS, email SPF/DKIM, privacy notice).

**Budgets:** LCP < 2.5 s (desktop) / < 3.5 s (mobile 4G); CLS < 0.1; initial JS ≲ 200 kB gz before lazy chunks; no 3D bundle in the initial load; ≥ 55 fps on the mid-tier device for scroll sequences.

---

## 7. Testing

| Level | Covers |
|---|---|
| Unit (Vitest) | zod schemas, phone parsing, chatbot state machine, content-integrity test, WhatsApp URL builder, escaping helpers |
| Integration | `/api/leads` with mocked failing Telegram/email/DB; rate limiting; idempotency |
| E2E (Playwright) | Entrance → hero → chatbot → completion; fallbacks; mobile viewport; reduced-motion |
| Perf/visual | Lighthouse CI, real-device checks, screenshot review per gate |

---

## 8. Decisions and inputs needed

| # | Need | Blocks | Default if missing |
|---|---|---|---|
| 1 | **Font route:** licence Mamenchisa (commercial + web) or choose an OFL stand-in | 1A | Placeholder display face behind `--font-display` |
| 2 | **Vector logo (SVG/AI)** + canonical gold (`#D9A441` vs logo's ≈ `#CBA968`) | 1B | Trace from the PNG (visibly worse) |
| 3 | **Clean video exports, or real footage** | 1D | Vignette mitigation + illustrative-footage note |
| 4 | Instagram style reference; Raguram Sports URL (couldn't retrieve) | 1H, Phase 2 | Categories from the prompt only |
| 5 | Real project list + verified data + photos (before/build/after, drone) | Phase 2 | Placeholders hidden in production |
| 6 | Verified product specs (pile height, etc.) | Phase 3 material library | Specs hidden |
| 7 | Approve the **8-stage process copy** and the 7 video chapter labels | Phase 2 | Chapters only |
| 8 | **WhatsApp number** | Phase 3 | Contact options shown |
| 9 | **Telegram bot token + chat id** | Phase 3 | Status `skipped` |
| 10 | **Notification email** + provider account/domain verification | Phase 3 | Status `skipped` |
| 11 | **LLM provider key/budget** | Phase 3 | Structured-form only |
| 12 | **Hosting + database** | Phase 0/3 | Vercel + managed Postgres |
| 13 | Stadium approach: procedural (default) vs commissioned GLB | Phase 2 | Procedural |
| 14 | Consent/privacy wording, domain, analytics tool | Phase 3/4 | Draft text for legal review |
| 15 | **Photos for the surface-card deck** (pickleball, shuttle, park setup, basketball) + SLORA's real court build-up for the court cards' slab | 1H | Illustrative stand-in stills (labelled on screen); slab shows "SURFACE" only |
| 16 | **Sports panel content:** real photos/video per sport, verified `applications` + `technical` (with a `source`), approval of the placeholder taglines, and the enquiry type each sport should pre-fill in the chat (only Football, Cricket and Multi-sport map exactly today) | Phase 2 Sports | Illustrative stand-in stills, placeholder taglines, no applications/technical shown, chat asks the question |

---

## 9. Top risks

| Risk | Mitigation |
|---|---|
| Animation-heavy page runs poorly on real phones | Mount-on-intersect, one active canvas, capped DPR, mobile fallbacks, budgets enforced in CI |
| Video scrub stutters on some browsers | **Happened; resolved** by replacing scroll-driven `<video>` with canvas frame-sequences. Remaining risk: canvas GPU backpressure on weak graphics (mitigated: one paint per frame, no identical repaints, capped canvas size); Safari/Firefox/iOS untested |
| Display face clashes with the logo / isn't licensed | Specimen sign-off in Phase 0; single CSS-variable swap |
| Thin assets → an empty-feeling site | Reuse hero footage slices; data-driven sections that collapse gracefully; content requests logged in §8 |
| AI-generated footage read as real SLORA work | Never captioned as projects; swappable slots; disclosure |
| Lead loss / hallucinated claims | Persist-first, state machine + server re-validation, `verified` rule, tests |
| Lenis + ScrollTrigger + Flip + route transitions interact badly | Single RAF loop, central `scroll.ts`, refresh discipline, an integration test page |
| Scope creep from "wow" effects | Every effect has an ID, a location and a budget (§4); anything else needs a reason |

---

## 10. Recommended next steps

Phase 0 is complete (see the report at the top).

1. **Review the specimen** (`npm run dev` → `/specimen`) and choose the display face (§3.2). It does not block starting Phase 1, because the face sits behind one CSS variable.
2. **Send SLORA the request list** in §8, starting with the items that gate Phase 1: the vector logo, clean (or real) footage, and the gold decision.
3. **Start Phase 1.** Steps that do not depend on those inputs can begin immediately: 1A design system, 1C navigation, 1D/1E hero type, the 1F scroll-scrub spike, 1G 3D turf prototype, 1H first card, 1I glass video section, 1J chatbot shell. The logo entrance (1B) waits for the vector logo.
4. In parallel, ask SLORA for the Phase 3 credentials (§8 #8–12) so the notification channels can be tested live as soon as Phase 3 begins.

---

## Appendix A: What each supplied asset is used for

| Asset | Used for |
|---|---|
| `slora_logo.png` | Identity; entrance assembly (once vectorised); the bars-as-layers motif; grain reference |
| `hero_portion.mp4` | Hero (loop + reversed scrub) and, sliced, the Football / Multi-sport / Athletics / Stadium visuals |
| `video_2.mp4` | The "How We Build" glass section: 7 scrub-driven chapters |
| Typography reference | Composition devices (crop, layering, shadow, grain, corner metadata) and, if licensed, the display face for a few big words |

## Appendix B: Sources (web research)

- Card / scroll effects: [GSAP Vault — effects library](https://gsapvault.com/effects) · [60+ ScrollTrigger examples](https://freefrontend.com/scroll-trigger-js/) · [Image reveal with ScrollTrigger (CodePen)](https://codepen.io/cameronknight/pen/pogQKwR)
- Glass / spotlight / glow: [CodeFronts — Spotlight card](https://codefronts.com/motion/css-card-hover-effects/spotlight/) · [CodeFronts — Glassmorphism hover](https://codefronts.com/motion/css-hover-effects/css-glassmorphism-card-hover-effect/) · [Glowing gradient glass borders](https://codefronts.com/motion/css-card-hover-effects/glowing-gradient-glassmorphic-borders/)
- WebGL hover: [Codrops — WebGL distortion hover](https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/) · [Interactive WebGL hover effects](https://tympanus.net/codrops/2020/04/14/interactive-webgl-hover-effects/) · [Gooey image hover](https://tympanus.net/codrops/2019/10/23/making-gooey-image-hover-effects-with-three-js/)
- GSAP Flip / transitions: [Flip docs](https://gsap.com/docs/v3/Plugins/Flip/) · [Page transitions, Next.js App Router (GSAP forum)](https://gsap.com/community/forums/topic/39460-page-transition-with-gsap-in-nextjs-app-router/)
- Lenis + GSAP: [Lenis](https://github.com/darkroomengineering/lenis) · [Next.js smooth scrolling with Lenis & GSAP](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap)
- GSAP licence: [Webflow makes GSAP 100% free](https://webflow.com/updates/gsap-becomes-free) · [Codrops — free GSAP plugins](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/)
- Video scrubbing: [Smooth scrubbing ffmpeg command](https://gist.github.com/jeffpamer/f3134c5145238d0fd4752221b2d75eb7) · [Scrubbing videos with JavaScript](https://muffinman.io/blog/scrubbing-videos-using-javascript/) · [GSAP forum: scrub video smoothly](https://gsap.com/community/forums/topic/25730-scrub-through-video-smoothly-scrolltrigger/) · [Scroll-scrubbed video, Next.js 15 + canvas](https://dev.to/pratham7711/how-i-made-a-scroll-scrubbed-video-portfolio-fast-nextjs-15-gsap-canvas-1mj6)
- R3F performance: [Scaling performance (R3F docs)](https://r3f.docs.pmnd.rs/advanced/scaling-performance) · [R3F scroll rig](https://www.npmjs.com/package/@14islands/r3f-scroll-rig)
- Font: [Mamenchisa, Befonts](https://befonts.com/mamenchisa-font.html) · [Mamenchisa review, Drizy](https://drizyfont.com/review-mamenchisa-best-psychedelic-display-font/) · [Mamenchisa on Envato](https://elements.envato.com/mamenchisa-VMVQXNP)
