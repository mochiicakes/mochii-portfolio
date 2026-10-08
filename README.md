# Michaella Gonzales, portfolio

Personal site of Michaella Gonzales, AI and automation engineer. The page opens as a sheet of white paper laid over the finished site. The visitor paints, and each brush mark splats a watercolour-shaped hole through the paper, showing the page beneath; then the rest of the paper is splatted away. The finished wash shimmers with rippling light, stars and two koi.

Live site: _add the Vercel URL here_

## What it does

- Paint to reveal, after Third by Kenjiro. Three layers: the prompt on top, then white paper, then the page over a watercolour background painted in full before anyone sees it. The visitor paints with a calligraphy brush by pressing and dragging, as in MS Paint (mouse button held, or a finger on touch screens); a single click leaves a dab, and hovering paints nothing. Each mark wears a grainy, rimmed, watercolour-shaped hole in the paper, and fast strokes flick off droplets. Past about a third of the screen, big splats clear the rest of the paper and it is removed, so none of the visitor's strokes stay in the page. An Enter button and the Enter key do it at once; a link straight to a section (`#contact`) arrives with no paper.
- Rippling water light. A WebGL layer added with `screen` draws soft caustic ripples with a faint rainbow fringe, starburst glints and pastel glitter, plus ripples from the cursor. Screen leaves white untouched, so the light only shows on paint.
- Colours from the water references: clear and deeper blues, lavender blue, deep teal pools, pale aqua and iridescent lilac and pink in the washes; goldfish orange; butter, sky and milk stars.
- The card fan, a continuous loop: past the last card comes the first again, so there are always cards on both sides. Recruiter mode deals the projects; casual mode deals Gaming and Hobbies. Click a card, drag (the cards follow the pointer and settle on release), use the arrow keys or the arrow buttons.
- The background is softened with a light blur (`--ground-blur`, about 3 px) and the water light is toned down (`--crystal-opacity`) so the content leads.
- One topic, one screen: the hero, the Around Tech header with the intro video (YouTube, loaded only when played), Experience, Impact, Automations and Personal Projects each fill the window and open with a dripping divider. With a mouse wheel, one flick turns one screen; a screen taller than the window scrolls to its end first (`src/lib/scroll.ts`). Touch and the keyboard scroll freely.
- Contact is a page of its own: the top bar's Contact link and Get in touch open it in place of the main page (`#contact`), and MG or the browser's back button return. Without JavaScript it follows the main page.
- Recruiter and casual modes: "Around Tech" (Experience tabs, the Impact tabs: Proof, Leadership, Case studies, How I work, then Automations, then the Personal Projects fan, each part between dividers) or "Out of Tech" (the Gaming and Hobbies fan). Remembered, and applied before first paint.
- The koi. A goldfish-coloured koi with a long, flowing tail follows the cursor, leaving a watercolour wake that fades as it dries. A golden koi waits at the bottom of the page; once yours reaches it, the two swim together, their wakes braiding. Mouse and trackpad only; off under reduced motion.
- Type, after an editorial cover: Playfair Display (heavy, high-contrast capitals) for the name and titles, Mrs Saint Delafield (a signature script) for the surname and handwritten accents, and Lora for reading text and tracked capitals. Buttons are capitals inside a hand-drawn ellipse.
- The name hero is a cover: the first name huge behind a cut-out portrait (`public/hero/michaella.webp`, a transparent WebP), the surname signed across it, and a text block in each corner. Phones stack the same pieces.
- Smooth scrolling with Lenis. Without JavaScript the page is simply painted: no paper, all content shown.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript 6 (strict) |
| Build | Vite 8, pre-rendered with `react-dom/server` (`scripts/prerender.mjs`) |
| Scrolling | [Lenis](https://github.com/darkroomengineering/lenis) |
| Styling | Plain CSS with custom-property tokens |
| Graphics | Canvas 2D (watercolour), WebGL (water light), inline SVG (koi, stars, underline, flow diagrams) |
| Fonts | Playfair Display (display), Mrs Saint Delafield (script), Lora (body), self-hosted via Fontsource |
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
   │  ├─ TopBar, NameHero, World, CardFan, Contact     the page, top to bottom (Contact opens as its own page)
   │  ├─ panels/              recruiter tab contents
   │  ├─ effects/             PaintedGround, CrystalLayer, CursorKoi (both koi)
   │  └─ ui/                  Card, ModeSwitch, FlowDiagram, Rich, ExternalLink, Ornaments
   ├─ lib/
   │  ├─ paint.ts             the watercolour background and shared brush-mark helpers
   │  ├─ paper.ts             the white paper and the brush that wears through it
   │  ├─ wake.ts              the koi's watercolour wakes
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

The background (`lib/paint.ts`) is painted in full on a canvas fixed behind the page as soon as the page loads: three layers of broad calligraphic washes, each drawn as one solid shape on an offscreen wet canvas, then dried in: mottled by a grain mask, laid down blurred and translucent with `multiply` so washes deepen as they overlap, given a darker rim (the shape minus a blurred copy of itself) and sometimes a ragged bloom.

The paper (`lib/paper.ts`) is a white canvas above the page; until it is drawn, CSS gives it a white background, so the page never shows uncovered. The brush stamps watercolour sprites into it with `destination-out`. Each stamp is an ellipse held at the -38° nib angle, so sweeping the brush gives calligraphy: wide across the nib, a hairline along it, thinner when fast, tapered at the start. A 24 × 14 grid tracks coverage. Past the threshold, `reveal()` throws big splats across a coarse grid in random order, fades the leftover flecks, and the paper is removed.

The water light (`lib/crystal.ts`) is one fragment shader at half resolution, capped at 30 fps. Caustics are the edges between cells of moving, warped cellular noise, faded in and out in patches; with `mix-blend-mode: screen` they lighten the paint and leave white paper as it is.

The koi (`effects/CursorKoi.tsx`) steer with an eased turning speed and eased swimming speed, all scaled by frame time so they swim the same at 60 or 144 Hz. The tail beat is an accumulating phase whose rate and width follow the pace; each frame the tail paths are bent along a spine carrying a travelling wave, so the tip lags the base, and the tail curves into turns. The body yaws slightly against the beat and the pectoral fins paddle or fold back. Each wake (`lib/wake.ts`) is a trail of points laid by distance and expiring after 1.4 s, drawn on a canvas as overlapping translucent stamps of watercolour brush sprites (grainy blobs with darker rims, made once with the paint engine's methods). The golden koi loops around `#koi-home` until yours comes within 110 px; then it targets a point orbiting yours.

The card fan (`components/CardFan.tsx`) rotates every card about one point below the stage (`transform-origin` at the dial's centre), so a single `--o` offset per card places the whole arc. The position along the loop is unbounded; each card's offset is the shortest way round, cards past the visible edge fade out, and a card that wraps jumps sides without animating.

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
3. Add the images (WebP, named exactly as in `src/content.ts`). Until a file exists, its slot shows a painted stand-in.

   | Slot | Path | Shape and size |
   | --- | --- | --- |
   | Hero portrait (done) | `public/hero/michaella.webp` | transparent cut-out, about 1500–2000px tall, cropped to the figure, feet on the bottom edge |
   | Personal Projects fan cards | `public/projects/<slug>.webp` | portrait 11:15, 660 × 900 |
   | Out of Tech fan cards | `public/casual/<slug>.webp` | portrait 11:15, 660 × 900 |
   | Experience screenshots | `public/experience/{bloch,yousource,hosting}.webp` | landscape 16:10, 1600 × 1000 |
   | Contact polaroid | `public/contact/selfie.webp` | portrait 4:5, 800 × 1000 |

   Export WebP at quality 80–85 (screens with small text: 90). Keep each under about 250 KB; the portrait is the only one that needs transparency.

## Deployment

Static build on Vercel: import the repo, preset **Vite**, build command `npm run build`, output `dist`. Any static host that serves `dist/` works.

## Roadmap

- [ ] Fill the placeholders, including the Hobbies cards
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
