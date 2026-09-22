# SLORA — MASTER WEBSITE CREATION & PRODUCT ARCHITECTURE PROMPT

You are a senior creative director, award-winning digital experience designer, UX architect, motion designer, Three.js developer, AI product architect and senior frontend engineer.

Your task is to design and build a premium interactive website for **SLORA**, a company operating in:

* Artificial turf
* Artificial grass
* Sports flooring
* Football turf
* Cricket surfaces
* Multi-sport surfaces
* Landscape artificial grass
* Playground surfaces
* Stadium surfaces
* Sports infrastructure
* Turf installation
* Surface engineering
* Maintenance

The website must NOT feel like a conventional turf company website.

The central concept is:

> **SLORA is not selling grass. SLORA creates surfaces where people move, play and experience space.**

The website should feel like an **interactive digital landscape** rather than a conventional company website.

---

# 1. DESIGN REFERENCES

Use the supplied SLORA logo as the primary visual identity.

Use:

* supplied SLORA logo
* supplied typography reference
* SLORA Instagram style reference
* supplied project/product images
* supplied Hero Video
* supplied second video
* Raguram Sports website as a reference for information architecture, category organization and sports-related imagery

Raguram Sports is ONLY a structural/content reference.

Do NOT copy:

* layout
* text
* branding
* colour system
* components
* website structure
* visual design

SLORA must have its own premium identity.

---

# 2. CORE BRAND IDEA

The entire website should communicate:

SURFACE
MOVEMENT
SPORT
ENGINEERING
LANDSCAPE
CRAFT
PERFORMANCE

The visitor should feel like:

> "I am entering the SLORA world."

The website is a **digital showroom + interactive portfolio + lead-generation platform**.

---

# 3. VISUAL DNA

Primary colours:

BLACK
#000000

OFF WHITE
#F5F5F3

WHITE
#FFFFFF

SLORA GOLD
#D9A441

Gold must remain an accent.

Use gold for:

* active states
* selected elements
* CTA highlights
* important statistics
* navigation indicators
* interaction lines
* subtle motion trails
* project metadata
* hover states

Do not make the entire website gold.

---

# 4. TYPOGRAPHY

Use an editorial typography system inspired by the supplied SLORA reference.

The website should use strong contrast between:

HEAVY

and

THIN

Example:

WE BUILD

the ground

YOU MOVE ON.

Use huge typography as part of the visual composition.

Cards should use:

* oversized headings
* thin supporting typography
* small metadata
* strong whitespace
* editorial alignment

Technical information may use a monospace font.

Example:

50 MM
18,000 SQ FT
SPORTS GRADE
UV STABILIZED

Do not make every heading bold.

---

# 5. GLOBAL EXPERIENCE

The website must behave like one continuous experience.

Avoid:

Hero
↓
normal section
↓
normal cards
↓
normal footer

Instead:

ENTRY
↓
TRANSFORMATION
↓
DISCOVERY
↓
SURFACE
↓
SPORT
↓
LANDSCAPE
↓
ENGINEERING
↓
PROJECTS
↓
BUILD WITH SLORA
↓
CONTACT

Transitions between sections are extremely important.

---

# 6. SLORA ENTRANCE EXPERIENCE

Initial screen:

Full black.

Almost nothing visible.

SLORA logo appears.

Logo assembles with subtle motion.

Then the logo moves toward the left side.

The environment begins appearing from the right.

The logo should become part of the navigation experience.

Example:

SLORA

01 SURFACES
02 SPORTS
03 LANDSCAPE
04 PROJECTS
05 PROCESS
06 CONTACT

Do not use a generic navbar fade-in.

The visitor should feel that they are entering a physical/digital environment.

---

# 7. HERO VIDEO

Use the provided **Hero Video** as the primary hero background.

The hero must be:

* full viewport
* cinematic
* immersive
* high contrast
* minimal UI
* premium
* atmospheric

Possible typography sequence:

WE BUILD

the ground

YOU MOVE ON.

Each text layer should animate independently.

Use:

* GSAP
* ScrollTrigger
* clip-path
* scale
* opacity
* subtle parallax
* text movement

Do not cover the entire video with text.

The video must remain visually dominant.

---

# 8. HERO → SURFACE TRANSITION

When the user begins scrolling:

The hero video should gradually transition into a turf/surface environment.

Possible transition:

stadium footage
→ camera moves downward
→ turf texture
→ macro grass
→ 3D surface

This should feel like the visitor is physically entering the surface.

---

# 9. 3D TURF SURFACE

Create an interactive 3D turf environment using:

Three.js
React Three Fiber
Drei

The user should visually move through the turf.

The surface can transform into a technical cross-section.

Layers:

GRASS FIBRES

INFILL

BACKING

BASE

DRAINAGE

Labels animate into position.

Mouse movement controls subtle camera/parallax.

Scroll controls camera progression.

The visual style must be architectural and premium.

Do not make it look like a game.

---

# 10. SECOND VIDEO — "HOW WE BUILD"

The supplied second video must NOT simply be inserted as another ordinary video section.

Analyze the content of the video and position it where it provides the strongest narrative value.

The preferred location is:

AFTER THE SURFACE / SPORTS INTRODUCTION

and BEFORE the detailed engineering/process section.

The purpose of this video is to visually answer:

> **HOW DOES SLORA TURN AN EMPTY SPACE INTO A FINISHED SURFACE?**

Use it as the transition from:

WHAT SLORA CREATES

to

HOW SLORA BUILDS IT.

---

# 11. SECOND VIDEO GLASSMORPHISM DESIGN

The second video should appear inside a premium glassmorphism composition.

Do NOT make the entire page glassmorphic.

Use glassmorphism only as a focused visual layer around the video.

Structure:

dark background
+
large cinematic video
+
floating translucent glass panel
+
technical information
+
motion

Example:

---

```
    HOW WE BUILD

 [ CINEMATIC VIDEO ]

 ┌──────────────────────────┐
 │ 01 SITE SURVEY           │
 │ 02 BASE PREPARATION      │
 │ 03 INSTALLATION          │
 │ 04 FINISHING             │
 └──────────────────────────┘

         EXPLORE ↓
```

---

Glass panel characteristics:

* backdrop blur
* translucent black/white layer
* subtle border
* low opacity
* slight reflection
* very subtle shadow
* rounded corners, but not excessive
* gold active indicator

The video should remain clearly visible through/around the glass UI.

The glass panel may move slightly during scroll.

---

# 12. "HOW WE BUILD" INTERACTION

As the user scrolls through the video section:

01
SITE SURVEY

then:

02
GROUND PREPARATION

then:

03
DRAINAGE

then:

04
BASE CONSTRUCTION

then:

05
SURFACE INSTALLATION

then:

06
LINE MARKING

then:

07
QUALITY CHECK

then:

08
HANDOVER

The active stage should be highlighted with SLORA gold.

The video should remain the visual anchor while the information changes.

If the supplied video does not contain all these stages, only display stages that are supported by actual SLORA content.

Never invent project claims.

---

# 13. SERVICE / SURFACE CARDS

Do not use generic cards.

Create editorial cards.

Example:

01

FOOTBALL
TURF

BUILT FOR
THE GAME.

→ EXPLORE

Cards should contain:

* large image/video
* oversized typography
* small metadata
* gold accent
* hover movement

Hover:

image expands
→ typography moves
→ gold line appears
→ information reveals
→ CTA becomes visible

Use the typography treatment from the supplied SLORA reference.

---

# 14. SPORTS SECTION

Create:

SPORTS

with large visual panels.

Categories:

FOOTBALL
CRICKET
HOCKEY
TENNIS
PADEL
MULTI-SPORT
ATHLETICS

Each category can include:

* project imagery
* video
* application
* technical information
* CTA

On desktop:

horizontal movement.

On mobile:

swipeable cards.

---

# 15. STADIUM 3D EXPERIENCE

Create a premium 3D stadium environment.

Scroll sequence:

OUTSIDE STADIUM
↓
ENTRANCE
↓
STANDS
↓
FIELD
↓
TURF

At the pitch:

PERFORMANCE

appears.

Then show verified project information.

Never invent:

* pile height
* area
* certifications
* performance values
* installation time

Only display actual client/product data.

---

# 16. LANDSCAPE EXPERIENCE

Transition the sports environment into landscape.

Possible transformation:

STADIUM
↓
FIELD
↓
GREEN
↓
GARDEN
↓
TERRACE
↓
ROOFTOP
↓
RESORT

Headline:

GREEN
WITHOUT
LIMITS.

Use real SLORA project photography wherever possible.

---

# 17. PLAYGROUND

Create a premium playground section.

Show:

* playground surfaces
* safety flooring
* children’s play areas
* recreational spaces

The visual style must remain architectural and premium.

Do not make the section childish.

---

# 18. PROJECT UNIVERSE

Create an immersive project exploration environment.

Projects appear as nodes inside a dark spatial environment.

Example:

CHENNAI
BANGALORE
PONDICHERRY
COIMBATORE
HYDERABAD

Each project node contains:

PROJECT NAME
LOCATION
CATEGORY
AREA

Hover:

node expands.

Click:

camera travels into project.

This must feel like entering the project.

Do not make it a conventional gallery.

---

# 19. PROJECT CASE STUDY

Each project should contain:

BEFORE

BUILD

AFTER

Then:

LOCATION
APPLICATION
AREA
SURFACE
SCOPE
DURATION

Use:

* photographs
* video
* drone footage
* installation images
* close-ups

The case study should feel like an architectural presentation.

---

# 20. ENGINEERING / PROCESS

Headline:

BEAUTY
HAS
STRUCTURE.

Process:

01 SITE SURVEY
02 GROUND PREPARATION
03 DRAINAGE
04 BASE CONSTRUCTION
05 SURFACE INSTALLATION
06 LINE MARKING
07 QUALITY CHECK
08 HANDOVER

Animate through scroll.

Use real installation photographs and the supplied process video.

---

# 21. MATERIAL LIBRARY

Create a material exploration interface.

Categories:

SPORT
LANDSCAPE
PLAY
MULTI-SPORT

Users can select/hover materials.

Display:

surface image
texture
application
pile height
specifications

Only use verified product information.

---

# 22. AI LEAD-GENERATION CHATBOT

The website must include an AI-powered enquiry chatbot.

The chatbot should not behave like a generic customer-support chatbot.

Its primary purpose is:

> **Qualify a potential SLORA project enquiry and collect the required lead information.**

The chatbot should be available through:

* floating chatbot button
* Contact section
* project configurator
* "Build With SLORA" CTA

The chatbot must visually match the SLORA design.

Use:

* black
* white
* SLORA gold
* subtle glassmorphism
* editorial typography

---

# 23. CHATBOT CONVERSATION FLOW

The chatbot should ask questions progressively.

Do NOT ask everything in one giant form.

Start:

"Hi. Let's build something with SLORA."

Then ask:

### QUESTION 1

What is your name?

Capture:

name

---

### QUESTION 2

Which city is your project in?

Capture:

city

---

### QUESTION 3

What are you looking to build?

Options:

Football Turf
Cricket Turf
Sports Flooring
Landscape
Playground
Stadium
Multi-Sport
Other

Capture:

requirement_type

---

### QUESTION 4

Do you have a site/project link?

Optional.

Examples:

Google Maps link
Website
Property link
Other reference link

Capture:

project_link

If the user does not have one:

Allow:

"Skip"

---

### QUESTION 5

Approximate project area?

Capture:

square_feet

Allow:

numeric input.

Example:

10,000 sq ft

---

### QUESTION 6

What is your contact number?

Capture:

phone_number

Validate:

* country code where applicable
* reasonable phone length
* reject obviously invalid input

---

# 24. CHATBOT COMPLETION

After all required information is collected:

Show:

THANK YOU.

YOUR PROJECT DETAILS
HAVE BEEN RECEIVED.

Then summarize:

NAME
CITY
REQUIREMENT
PROJECT LINK
AREA
CONTACT NUMBER

Then:

> A SLORA representative will get in touch with you.

Do not claim a specific response time unless SLORA provides one.

---

# 25. WHATSAPP INTEGRATION

After enquiry completion, provide a:

**CONTINUE ON WHATSAPP →**

button.

This must redirect to the official SLORA WhatsApp number.

The WhatsApp number must NOT be hardcoded inside multiple components.

Store it in configuration/environment variables.

Example:

NEXT_PUBLIC_WHATSAPP_NUMBER

The WhatsApp message should be prefilled with the collected enquiry details.

Example structure:

Hello SLORA,

I would like to enquire about a project.

Name:
City:
Requirement:
Project Link:
Approx. Area:
Contact Number:

Please contact me regarding this project.

The actual production WhatsApp number must be supplied by the SLORA client/admin.

Do not invent a phone number.

---

# 26. TELEGRAM LEAD NOTIFICATION

Every completed chatbot enquiry must also generate a Telegram notification for the SLORA team.

Use a Telegram Bot.

Configuration should use environment variables:

TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID

Do NOT expose these values to the frontend.

The Telegram message should be formatted clearly.

Example:

━━━━━━━━━━━━━━━━━━━━
SLORA NEW ENQUIRY
━━━━━━━━━━━━━━━━━━━━

Name:
{{name}}

City:
{{city}}

Requirement:
{{requirement_type}}

Project Link:
{{project_link}}

Approx Area:
{{square_feet}} sq ft

Contact:
{{phone_number}}

Source:
Website AI Chatbot

━━━━━━━━━━━━━━━━━━━━

The Telegram notification should be sent server-side.

---

# 27. EMAIL NOTIFICATION

The exact same lead information must also be sent to the designated SLORA email address.

The email should contain:

SLORA — NEW WEBSITE ENQUIRY

Name
City
Requirement
Project Link
Approximate Area
Contact Number
Source
Timestamp

The email should be professionally formatted.

Use a server-side email provider/API.

Do not expose SMTP/API credentials in frontend code.

Configuration example:

LEAD_NOTIFICATION_EMAIL
EMAIL_PROVIDER_API_KEY

The final recipient email must be provided by the client/admin.

Do not invent it.

---

# 28. LEAD DATA FLOW

The complete flow should be:

USER

↓

SLORA AI CHATBOT

↓

COLLECT LEAD DATA

↓

VALIDATE

↓

STORE/PROCESS SERVER-SIDE

↓

┌─────────────────────┐
│                     │
▼                     ▼
TELEGRAM            EMAIL
│                     │
└─────────┬───────────┘
│
▼
WHATSAPP CTA

The system should attempt Telegram and email delivery independently.

If one notification provider fails, do not lose the lead.

The user should still receive the WhatsApp option.

---

# 29. LEAD STORAGE

Create a structured lead model.

Example:

{
id,
name,
city,
requirementType,
projectLink,
squareFeet,
phoneNumber,
source,
createdAt,
whatsappClicked,
telegramStatus,
emailStatus
}

Do not expose lead records publicly.

Protect personal information.

---

# 30. CHATBOT AI ARCHITECTURE

The AI should be used primarily for:

* natural conversation
* understanding user answers
* identifying requirement type
* handling questions
* collecting missing information
* guiding users back to enquiry completion

The chatbot must NOT invent:

* product specifications
* pricing
* warranties
* certifications
* installation timelines
* company claims

If it does not know something:

"I can collect your project details and have the SLORA team get back to you."

---

# 31. CHATBOT UX

Desktop:

floating circular button.

Click:

glassmorphism chatbot panel opens.

Example:

┌─────────────────────────────┐
│ SLORA AI                    │
│                             │
│ Let's build something.      │
│                             │
│ [ conversation ]            │
│                             │
│ Type your answer...     →   │
└─────────────────────────────┘

Mobile:

full-screen or near-full-screen experience.

Use:

* smooth message animation
* typing indicator
* quick option buttons
* input validation
* progress indicator

Example:

PROJECT DETAILS
●────●────●────○────○

---

# 32. PROJECT CONFIGURATOR + CHATBOT

The project configurator and chatbot should share the same underlying lead schema.

Do not build two completely separate lead systems.

If the user starts from:

BUILD WITH SLORA

the system can transition into the chatbot.

The chatbot should recognize previously collected fields.

Example:

User selects:

Football

Then chatbot should not ask again:

"What are you looking to build?"

Instead continue:

"Great. Which city is the project in?"

---

# 33. SECOND VIDEO + GLASSMORPHISM SECTION

Recommended homepage order:

01 ENTRY
02 HERO VIDEO
03 SURFACE
04 SPORTS
05 HOW WE BUILD VIDEO
06 ENGINEERING
07 STADIUM
08 LANDSCAPE
09 PLAY
10 PROJECT UNIVERSE
11 MATERIAL LIBRARY
12 BUILD WITH SLORA
13 ABOUT
14 CONTACT

The exact order may be adjusted after analyzing the supplied second video.

The second video should act as a **narrative bridge** between inspiration and engineering.

---

# 34. NAVIGATION

Desktop:

SLORA

SURFACES
SPORTS
LANDSCAPE
PROJECTS
PROCESS
ABOUT

CONTACT →

Also provide a persistent small CTA:

BUILD WITH SLORA →

Do not overload the navigation.

---

# 35. TECHNOLOGY

Use:

Next.js
React
TypeScript
Tailwind CSS
GSAP
GSAP ScrollTrigger
Lenis
Three.js
React Three Fiber
Drei

Backend/API:

Next.js Route Handlers or server-side API architecture.

AI:

Use an LLM API through a server-side endpoint.

Never expose AI API keys in frontend code.

---

# 36. BACKEND SERVICES

Create service abstractions:

/lib/ai
/lib/telegram
/lib/email
/lib/whatsapp
/lib/leads

Example:

aiService
telegramService
emailService
leadService

Keep provider-specific logic separate.

---

# 37. ENVIRONMENT VARIABLES

Use environment variables.

Example:

NEXT_PUBLIC_WHATSAPP_NUMBER=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

LEAD_NOTIFICATION_EMAIL=

AI_API_KEY=

EMAIL_PROVIDER_API_KEY=

Do not commit secrets to Git.

Provide:

.env.example

without actual credentials.

---

# 38. SECURITY

Protect:

* chatbot endpoint
* lead endpoint
* Telegram credentials
* email credentials
* AI API keys

Implement:

* rate limiting
* input validation
* spam protection
* server-side validation
* basic abuse prevention
* secure headers where appropriate

Do not expose personal lead information to the browser unnecessarily.

---

# 39. PERFORMANCE

This is an animation-heavy website.

Performance is a first-class requirement.

Implement:

* lazy-loaded videos
* lazy-loaded 3D
* compressed WebP/AVIF images
* optimized video
* GLB models
* dynamic imports
* IntersectionObserver
* reduced particle counts
* GPU-conscious shaders
* responsive video sources
* mobile fallbacks

Do not initialize every 3D scene at page load.

---

# 40. MOBILE

Do NOT simply shrink the desktop experience.

Create mobile-specific behavior.

Replace expensive 3D where necessary with:

* optimized video
* image sequences
* lightweight 3D
* CSS animation
* static fallback

Maintain:

brand
typography
motion
storytelling

without sacrificing performance.

---

# 41. ACCESSIBILITY

Implement:

semantic HTML
keyboard navigation
focus states
ARIA labels
reduced-motion support
accessible forms
sufficient contrast

If prefers-reduced-motion is enabled:

reduce major camera movement
reduce scroll-linked animation
disable unnecessary autoplay motion

---

# 42. SEO

Implement:

metadata
Open Graph
Twitter cards
structured data
sitemap
robots.txt
semantic headings
descriptive image alt text

Relevant search themes:

artificial turf
artificial grass
sports flooring
football turf
cricket turf
sports infrastructure
landscape artificial grass
playground flooring
turf installation
stadium flooring

Do not keyword-stuff.

---

# 43. CONTENT MODEL

Project:

{
title,
slug,
location,
category,
area,
surface,
year,
heroImage,
beforeImages,
installationImages,
afterImages,
video,
description,
specifications
}

Surface:

{
name,
category,
application,
pileHeight,
image,
texture,
specifications
}

Sports:

{
name,
description,
image,
video,
applications
}

Lead:

{
name,
city,
requirementType,
projectLink,
squareFeet,
phoneNumber,
source,
createdAt,
telegramStatus,
emailStatus,
whatsappClicked
}

---

# 44. FILE ARCHITECTURE

Use:

app/
components/
three/
animations/
data/
lib/
public/

Suggested structure:

components/
navigation/
hero/
typography/
cards/
surfaces/
sports/
stadium/
terrain/
projects/
configurator/
chatbot/
contact/
transitions/

lib/
ai/
telegram/
email/
whatsapp/
leads/

three/
TurfSurface.tsx
Stadium.tsx
Terrain.tsx
ProjectUniverse.tsx
MaterialViewer.tsx

animations/
hero.ts
cards.ts
transitions.ts
typography.ts
scroll.ts
chatbot.ts

---

# 45. ASSET SYSTEM

/public/images
/public/videos
/public/textures
/public/models
/public/fonts

Use meaningful filenames.

Examples:

football-turf-chennai.webp
stadium-aerial.mp4
turf-macro.webp
landscape-project-01.webp
how-we-build.mp4
slora-hero.mp4

---

# 46. MOTION PRINCIPLES

Every animation must have a purpose.

Use:

entrance
reveal
transformation
parallax
camera movement
scale
mask
clip-path
horizontal movement
text splitting
morphing

Avoid random animations.

The website must feel:

CONTROLLED
CINEMATIC
PREMIUM

not chaotic.

---

# 47. DESIGN RULE

Do NOT build:

"generic turf company + Three.js effects."

Build:

> **A premium architectural sports-surface experience that happens to use Three.js.**

Technology supports the design.

Design comes first.

---

# 48. BUSINESS RULE

The website is not only a portfolio.

It is a lead-generation system.

Every important page should eventually lead toward:

EXPLORE
→
UNDERSTAND
→
CONFIGURE
→
ENQUIRE
→
WHATSAPP

The primary conversion goal is:

**qualified project enquiry.**

---

# 49. CHATBOT FAILURE HANDLING

If Telegram fails:

Store the lead and continue.

If email fails:

Store the lead and continue.

If AI service fails:

Fall back to a structured form.

If WhatsApp is unavailable:

Show contact options.

Never tell the user:

"Something went wrong, your enquiry is lost."

The lead should be captured before notification services are called.

---

# 50. FINAL USER JOURNEY

The ideal journey:

USER ENTERS WEBSITE

↓

SLORA LOGO

↓

CINEMATIC HERO

↓

DISCOVERS SURFACES

↓

EXPLORES SPORTS

↓

WATCHES HOW SLORA BUILDS

↓

SEES ENGINEERING

↓

EXPERIENCES STADIUM

↓

EXPLORES LANDSCAPE

↓

DISCOVERS PROJECTS

↓

EXPLORES MATERIALS

↓

BUILD WITH SLORA

↓

AI CHATBOT

↓

NAME

↓

CITY

↓

REQUIREMENT

↓

PROJECT LINK

↓

SQ FT

↓

PHONE

↓

THANK YOU

↓

TELEGRAM NOTIFICATION

*

EMAIL NOTIFICATION

*

WHATSAPP CTA

↓

SLORA SALES TEAM

---

# 51. FIRST DEVELOPMENT MILESTONE

Do NOT immediately build the complete website.

First build only:

1. Global design system
2. SLORA entrance animation
3. Navigation
4. Hero video
5. Hero typography
6. Hero → turf transition
7. Initial 3D turf prototype
8. First editorial card
9. Glassmorphism video section
10. AI chatbot visual shell

The first milestone must already feel like a premium digital experience.

---

# 52. SECOND DEVELOPMENT MILESTONE

Build:

1. Sports
2. Stadium
3. Landscape
4. Playground
5. Engineering
6. Project universe
7. Project case studies

---

# 53. THIRD DEVELOPMENT MILESTONE

Build:

1. Material library
2. Project configurator
3. AI chatbot logic
4. Lead validation
5. Telegram notification
6. Email notification
7. WhatsApp integration
8. Lead persistence

---

# 54. FOURTH DEVELOPMENT MILESTONE

Production:

1. Mobile optimization
2. Performance optimization
3. SEO
4. Accessibility
5. Analytics
6. Error handling
7. Security
8. Cross-browser testing
9. Video optimization
10. 3D fallback testing

---

# 55. FINAL CREATIVE DIRECTION

The final experience should communicate:

SURFACE
MOVEMENT
SPORT
ENGINEERING
LANDSCAPE
CRAFT
PERFORMANCE

The visitor should remember the experience.

The website should feel:

BLACK.
SPATIAL.
CINEMATIC.
EDITORIAL.
TACTILE.
TECHNICAL.
PREMIUM.

The final website must combine:

* SLORA branding
* editorial typography
* cinematic hero video
* second process video
* glassmorphism
* 3D turf
* stadium experience
* sports categories
* landscape experience
* project universe
* project storytelling
* material exploration
* AI lead qualification
* WhatsApp conversion
* Telegram notification
* email notification
* responsive mobile experience

The result should be:

> **An interactive digital showroom for SLORA's surfaces, spaces and projects — with a built-in AI sales enquiry system.**

Do not copy any reference website.

Use references only for inspiration and information architecture.

Build an original SLORA digital identity.
