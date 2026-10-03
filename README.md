# Michaella Gonzales, portfolio

Personal site of Michaella Gonzales, AI and automation engineer. The page opens as bare paper. Its text is printed in the paper's own colour, so nothing reads until the visitor paints: wet watercolour washes go down behind the words and they appear. The finished wash shimmers with rippling light, stars and two koi.

Live site: _add the Vercel URL here_

## What it does

- Paint to reveal, after Third by Kenjiro. All text is paper-coloured (`--paper`). The visitor paints with a calligraphy brush (cursor, or a finger on touch screens); each stroke stays wet while painting and dries into a translucent wash with a darker rim, pigment grain and the odd bloom. Words appear wherever paint lands behind them. Past about a third of the screen, broad washes cover the rest and the page opens. An Enter button and the Enter key do it at once; a link straight to a section (`#contact`) arrives already painted.
- Rippling water light. A WebGL layer added with `screen` draws soft caustic ripples with a faint rainbow fringe, starburst glints and pastel glitter, plus ripples from the cursor. Screen leaves white untouched, so the light only shows on paint.
- Colours from the water references: clear and deeper blues, lavender blue, deep teal pools, pale aqua and iridescent lilac and pink in the washes; goldfish orange; butter, sky and milk stars.
- The card fan, opening from the middle card. Recruiter mode deals the projects; casual mode deals Gaming, Hobbies and Life. Click a card, drag, use the arrow keys or the arrow buttons.
- Recruiter and casual modes: "Around Tech" (project fan, then Proof, Experience, Case studies, Automations, How I work) or "Out of Tech" (the Gaming, Hobbies and Life fan). Remembered, and applied before first paint.
- The koi. A goldfish-coloured koi with a long, flowing tail follows the cursor, leaving a wide brush-stroke wake. A golden koi waits at the bottom of the page; once yours reaches it, the two swim together, their wakes braiding. Mouse and trackpad only; off under reduced motion.
- Type: Imperial Script, thickened, for the name and titles; everything else in widely spaced Josefin Sans capitals. Buttons are capitals inside a hand-drawn ellipse.
- Smooth scrolling with Lenis. Without JavaScript the page is simply painted: no paper, all content shown.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript 6 (strict) |
| Build | Vite 8, pre-rendered with `react-dom/server` (`scripts/prerender.mjs`) |
| Scrolling | [Lenis](https://github.com/darkroomengineering/lenis) |
| Styling | Plain CSS with custom-property tokens |
| Graphics | Canvas 2D (watercolour), WebGL (water light), inline SVG (koi, stars, underline, flow diagrams) |
| Fonts | Imperial Script (script), Josefin Sans (capitals and body), self-hosted via Fontsource |
| Hosting | Vercel (static) |

## Project structure

```text
portfolio/
├─ index.html                 shell + the pre-paint script (mode, skip-the-gate)
├─ public/                    favicon, CV, project screenshots (projects/), casual-card photos (casual/)
├─ scripts/
│  ├─ prerender.mjs           writes rendered HTML, title, description and social tags into dist/
│  └─ placeholders.mjs        lists [placeholders] left in src/content.ts
└─ src/
   ├─ content.ts              every word on the site
   ├─ types.ts                the shape content.ts must have
   ├─ App.tsx                 page order, in-page links, Lenis start/stop
   ├─ entry-client.tsx        fonts, styles, hydration
   ├─ entry-server.tsx        build-time render
   ├─ components/
   │  ├─ TopBar, NameHero, World, CardFan, Contact     the page, top to bottom
   │  ├─ panels/              recruiter tab contents
   │  ├─ effects/             PaintedGround, CrystalLayer, CursorKoi (both koi)
   │  └─ ui/                  Card, ModeSwitch, FlowDiagram, Rich, ExternalLink, Ornaments
   ├─ lib/
   │  ├─ paint.ts             the watercolour calligraphy engine
   │  ├─ crystal.ts           the WebGL water-light shader
   │  ├─ htmlState.ts         mode, revealed and recruiter-tab stores
   │  ├─ scroll.ts            Lenis wrapper and scroll-to-element
   │  ├─ placeholder.ts       [placeholder] detection
   │  └─ useReducedMotion.ts
   └─ styles/
      ├─ tokens.css           palette, fonts, spacing
      ├─ base.css             reset, capitals, ellipse buttons, panes, Lenis rules
      └─ page.css             ground, prompt, hero, fan, tabs, panels, koi
```

### How the pieces fit

Content is data. `content.ts` is the only file to edit to change what the site says, and `types.ts` makes the build fail if a project, job or tab is missing a field.

State the CSS needs before React runs lives on `<html>`: `data-mode="recruiter" | "casual"` and the `revealed` class. The inline script in `index.html` sets both before first paint, so a returning casual-mode visitor never sees recruiter mode flash first. `lib/htmlState.ts` reads them back into React with `useSyncExternalStore`. Both worlds are always rendered; CSS shows the one that matches the mode, which is also why everything is visible without JavaScript.

The watercolour (`lib/paint.ts`) uses two canvases fixed behind the page. While the brush moves, the stroke is drawn as one solid shape on a wet canvas (shown translucent and slightly blurred). Its width follows a broad nib held at -38°: wide across it, a hairline along it, thinner when fast, tapered at the start. When the brush pauses, the stroke dries into the paint canvas: mottled by a grain mask, laid down blurred and translucent with `multiply` so washes deepen as they overlap, then given a darker rim (the shape minus a blurred copy of itself) and sometimes a ragged bloom. A 24 × 14 grid tracks coverage; past the threshold, `fill()` lays three layers of broad washes.

The water light (`lib/crystal.ts`) is one fragment shader at half resolution. Caustics are the edges between cells of moving, warped cellular noise, faded in and out in patches; with `mix-blend-mode: screen` they lighten the paint and leave white paper as it is.

The koi (`effects/CursorKoi.tsx`) turn toward their target at a limited rate and ease their speed, which gives curved swimming. Each wake is a polygon rebuilt every frame from the last 66 tail positions, its width taken from the speed at each moment. The golden koi loops around `#koi-home` until yours comes within 110 px; then it targets a point orbiting yours.

The card fan (`components/CardFan.tsx`) rotates every card about one point below the stage (`transform-origin` at the dial's centre), so a single `--o` offset per card places the whole arc.

## Getting started

Requires Node.js 20.19+ or 22.12+ (Vite 8).

```bash
git clone https://github.com/mochiicakes/portfolio.git
cd portfolio
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at `http://localhost:5173` |
| `npm run build` | Type-check, build, pre-render into `dist/` |
| `npm run preview` | Serve `dist/` at `http://localhost:4173` |
| `npm run lint` | ESLint |
| `npm run placeholders` | List the `[placeholders]` left in `src/content.ts` |

### Filling in content

1. Edit `src/content.ts`. Replace each `[placeholder]` until `npm run placeholders` reports none left.
2. Add `public/Michaella-Gonzales-CV.pdf`.
3. Add a 1600 × 1000 screenshot per project at `public/projects/<slug>.png`, and a portrait-shaped photo (about 600 × 820) per casual card at `public/casual/<slug>.jpg`. Until then each card shows a painted stand-in.

## Deployment

Static build on Vercel: import the repo, preset **Vite**, build command `npm run build`, output `dist`. Any static host that serves `dist/` works.

## Roadmap

- [ ] Fill the placeholders, including the Hobbies and Life cards
- [ ] Photos for every casual card and screenshots for every project
- [ ] CV PDF and a 1200 × 630 share image
- [ ] Fail the production build while placeholders remain
- [ ] `robots.txt`, `sitemap.xml`, canonical URL, JSON-LD `Person`
- [ ] Playwright smoke test with an axe accessibility check in CI
- [ ] Per-project pages, if the site grows past one page

## Branches

- `master`: the live site.
- `motion-field`: Motion Field (the webcam-reactive particle field from the earlier design), kept for a future standalone project. Its README maps where each piece is.

## License

© 2026 Michaella Gonzales. _Choose a license, for example MIT for the code and all rights reserved for written content and images._
