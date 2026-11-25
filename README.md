# Michaella Gonzales, portfolio

Personal site of Michaella Gonzales, AI and automation engineer. The page opens as black water over the finished site. The visitor drags a light through it, opening the dark onto the page; then the light spreads and the dark is gone.

Live site: [mochii-portfolio.vercel.app](https://mochii-portfolio.vercel.app)

## What it does

- Light the deep. Three layers: the prompt on top, then black water, then the finished page. Press and drag (mouse, finger or pen) to open soft holes in the dark and stir up glowing plankton; a single click leaves one glow. Past about a third of the screen the light spreads from the visitor's strokes and the dark is removed, so none of them stay in the page. An Enter button and the Enter key do it at once; a link straight to a section (`#contact`) arrives with no dark.
- The ocean. Light rays come down from the surface ([React Bits](https://github.com/DavidHDev/react-bits) `LightRays`, WebGL), and the water darkens to black at the bottom of the page. Glowing flowers drift in three layers: huge and soft in front, small and dim far back, each moving at its own pace as the page scrolls. Still under reduced motion.
- Deep ocean colours: near-black water, white text and icy blue light. The cards, bars and buttons are glass. Other palettes that were considered are in `docs/style-options.md`; `compare.html` shows them side by side on the dev server only.
- The card fan, a continuous loop: past the last card comes the first again, so there are always cards on both sides. Recruiter mode deals the projects; casual mode deals Gaming and Hobbies. Click a card, drag (the cards follow the pointer and settle on release), use the arrow keys or the arrow buttons.
- One topic, one screen: the hero, the Around Tech header with the intro video (YouTube, loaded only when played), Experience, Impact, Automations and Personal Projects each fill the window, with a divider between them. On wide windows each screen's text scales to fill the window without spilling past it (`src/lib/fit.ts`). With a mouse wheel, one flick turns one screen; a screen taller than the window scrolls to its end first (`src/lib/scroll.ts`). Touch and the keyboard scroll freely.
- Contact is a page of its own: the top bar's Contact link and Get in touch open it in place of the main page (`#contact`), and Recruiter, Casual or the browser's back button return. Every top bar button goes to the top of its page. Without JavaScript it follows the main page.
- Recruiter and casual modes: "Around Tech" (Experience tabs, the Impact tabs: Proof, Leadership, Case studies, How I work, then Automations, then the Personal Projects fan, each part between dividers) or "Out of Tech" (the Gaming and Hobbies fan, then Recently played). Remembered, and applied before first paint.
- Cop my drip? (casual mode): a button under Get in touch draws lines from the pieces she is wearing in the portrait out to cards beside her, each linking to where to buy it (`src/components/Drip.tsx`, items in `src/content.ts`, photos in `public/drip/`). On phones the cards sit in a row you swipe through.
- Recently played (casual mode): the songs she played last, live from Spotify. Hovering a song plays a 30-second preview; clicking opens it on Spotify (`src/components/RecentlyPlayed.tsx`, served by `api/recently-played.ts`). Spotify no longer gives new apps previews, so they come from Apple's public iTunes catalogue, matched by title and artist.
- The sea angel. A small translucent sea angel swims after the cursor and circles it; on touch screens it circles the last tap. A heart waits at the bottom of the page: lead the angel to it and it eats the heart, once a visit, and carries it from then on. Under reduced motion it rests above the credits.
- Type: Sixtyfour, a scanline pixel face, for the name, and light Inter for everything else.
- The name hero is a cover: the name in pixel capitals over a cut-out portrait (`public/hero/michaella.webp`, a transparent WebP), with a text block in the corners. Phones stack the same pieces.
- Smooth scrolling with Lenis. Without JavaScript there is no dark, and all content shows.

## Tech stack

| Layer     | Choice                                                                                   |
| --------- | ---------------------------------------------------------------------------------------- |
| UI        | React 19, TypeScript 6 (strict)                                                          |
| Build     | Vite 8, pre-rendered with `react-dom/server` (`scripts/prerender.mjs`)                   |
| Scrolling | [Lenis](https://github.com/darkroomengineering/lenis)                                    |
| Styling   | Plain CSS with custom-property tokens                                                    |
| Graphics  | Canvas 2D (angel, flowers, intro), WebGL (light rays), inline SVG (flow diagrams, icons) |
| Fonts     | Sixtyfour (the name), Inter (everything else), self-hosted via Fontsource                |
| Hosting   | Vercel (static)                                                                          |

## Project structure

```text
portfolio/
├─ index.html                 shell + the pre-paint script (mode, skip-the-intro)
├─ public/                    favicon, share image, project screenshots (projects/), casual-card photos (casual/)
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
   │  ├─ effects/             Ocean, LightRays, DeepIntro, CursorAngel
   │  └─ ui/                  Card, ContactCode, ModeSwitch, FlowDiagram, Tabs, Title, Rich, ExternalLink, Ornaments
   ├─ lib/
   │  ├─ deep.ts              the dark over the page and the light that opens it
   │  ├─ angel.ts             the sea angel: steering, spine, heart and drawing
   │  ├─ swim.ts              steering shared by anything that swims
   │  ├─ bloom.ts             the glowing flowers
   │  ├─ depth.ts             how deep the page is at a scroll position
   │  ├─ fit.ts               scales each screen to fit the window
   │  ├─ htmlState.ts         mode, revealed and recruiter-tab stores
   │  ├─ scroll.ts            Lenis wrapper and scroll-to-element
   │  ├─ placeholder.ts       [placeholder] detection
   │  └─ useReducedMotion.ts
   └─ styles/
      ├─ tokens.css           palette, fonts, spacing
      ├─ base.css             reset, buttons, Lenis rules
      ├─ page.css             intro, hero, fan, tabs, panels, contact
      └─ glass.css            ocean, glass, the one-page layouts
```

### How the pieces fit

Content is data. `content.ts` is the only file to edit to change what the site says, and `types.ts` makes the build fail if a project, job or tab is missing a field.

State the CSS needs before React runs lives on `<html>`: `data-mode="recruiter" | "casual"` and the `revealed` class. The inline script in `index.html` sets both before first paint, so a returning casual-mode visitor never sees recruiter mode flash first. `lib/htmlState.ts` reads them back into React with `useSyncExternalStore`. Both worlds are always rendered; CSS shows the one that matches the mode, which is also why everything is visible without JavaScript.

The dark (`lib/deep.ts`) is a canvas above the page; until it is drawn, CSS gives it a black background, so the page never shows uncovered. The light stamps soft round sprites into it with `destination-out`. A second canvas over it draws the trail, the plankton and a few drifting specks, and is left empty under reduced motion. A 24 × 14 grid tracks coverage. Past the threshold, `reveal()` lights a coarse grid of points, nearest the strokes first, fades the leftover haze, and both canvases are removed.

The sea angel (`lib/angel.ts`, drawn by `effects/CursorAngel.tsx`) steers with `lib/swim.ts`: an eased turning speed and an eased swimming speed, scaled by frame time so it swims the same at 60 or 144 Hz. Its body hangs on a spine of evenly spaced points that follow the head. The heart sits at `.koi-home` on the last screen until the pointer or the angel comes near it.

The card fan (`components/CardFan.tsx`) rotates every card about one point below the stage (`transform-origin` at the dial's centre), so a single `--o` offset per card places the whole arc. The position along the loop is unbounded; each card's offset is the shortest way round, cards past the visible edge fade out, and a card that wraps jumps sides without animating.

## Getting started

Requires Node.js 20.19+ or 22.12+ (Vite 8).

```bash
git clone https://github.com/mochiicakes/portfolio.git
cd portfolio
npm install
npm run dev
```

| Command                 | What it does                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`           | Dev server at `http://localhost:5173`                                                                                                                            |
| `npm run build`         | Check for placeholders, type-check, build, pre-render into `dist/` (plus `robots.txt`, and `sitemap.xml` when the site URL is known)                             |
| `npm run preview`       | Serve `dist/` at `http://localhost:4173`                                                                                                                         |
| `npm run lint`          | ESLint                                                                                                                                                           |
| `npm run spotify:token` | One-time: get the Spotify refresh token for Recently played (see below)                                                                                          |
| `npm run placeholders`  | List the `[placeholders]` left in `src/content.ts` (`--check` exits with an error while any remain; `href` placeholders are allowed and show "Link coming soon") |

### Filling in content

1. Edit `src/content.ts`. Replace each `[placeholder]` until `npm run placeholders` reports none left. `npm run build` refuses to build while any remain, except in an `href`.
2. Add the images (WebP, named exactly as in `src/content.ts`). Until a file exists, its slot shows a painted stand-in.

   | Slot                        | Path                            | Shape and size                                                                              |
   | --------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------- |
   | Hero portrait (done)        | `public/hero/michaella.webp`    | transparent cut-out, about 1500–2000px tall, cropped to the figure, feet on the bottom edge |
   | Personal Projects fan cards | `public/projects/<slug>.webp`   | portrait 11:15, 660 × 900                                                                   |
   | Out of Tech fan cards       | `public/casual/<slug>.webp`     | portrait 11:15, 660 × 900                                                                   |
   | Experience screenshots      | `public/experience/<name>.webp` | landscape 16:10, 1600 × 1000                                                                |
   | Contact photo               | `public/contact/selfie.webp`    | portrait 4:5, 800 × 1000                                                                    |
   | Share image                 | `public/og.jpg`                 | 1200 × 630                                                                                  |

   Export WebP at quality 80–85 (screens with small text: 90). Keep each under about 250 KB; the portrait is the only one that needs transparency.

### Recently played (Spotify)

The screen reads your listening history through `api/recently-played.ts`, a Vercel function. Locally, `npm run dev` serves it too (a small plugin in `vite.config.ts`). Until it is set up, the screen shows a quiet empty state.

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and add the redirect URI `http://127.0.0.1:8888/callback`.
2. Put its keys in `.env.local` (never committed):

   ```bash
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   ```

3. Run `npm run spotify:token`, open the link it prints, approve, and add the `SPOTIFY_REFRESH_TOKEN=...` it prints to `.env.local`.
4. In the Vercel project, add the same three variables under Settings, Environment Variables, and redeploy.
5. Optional: `SPOTIFY_HIDE` takes comma-separated Spotify track or artist ids to keep off the page. It shows whatever you play, so use it for anything you would rather not show.

Responses are cached at the edge for five minutes, so Spotify and Apple are asked at most every few minutes however many people visit.

## Deployment

Static build on Vercel: import the repo, preset **Vite**, build command `npm run build`, output `dist`. Any static host that serves `dist/` works.

The canonical link, share-image tags, JSON-LD `Person` URL and `sitemap.xml` need the site's address. The build reads `SITE_URL` if set, otherwise `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel provides on every build. For a custom domain, set `SITE_URL` (for example `https://example.com`) in the Vercel project's environment variables.

## Roadmap

- [x] Fill the placeholders, including the Hobbies cards
- [x] Photos for every casual card and screenshots for every project
- [x] A 1200 × 630 share image (the CV download was removed)
- [x] Fail the production build while placeholders remain
- [x] `robots.txt`, `sitemap.xml`, canonical URL, JSON-LD `Person`
- [ ] Links for tomorrow and Pastel Affirmations
- [ ] Fade transitions when switching tabs, so content changes gracefully instead of swapping at once: the Recruiter/Casual mode switch, the Experience tabs, the Impact tabs (Proof, Leadership, Case studies, How I work), the Gaming/Hobbies fan groups, and opening or leaving Contact. Fade the outgoing panel out, then the incoming one in (about 200–300 ms, opacity with a small upward drift), keep the page height steady while they swap, and skip the motion under `prefers-reduced-motion`
- [ ] Playwright smoke test with an axe accessibility check in CI
- [ ] Per-project pages, if the site grows past one page

## License

The code is released under the [MIT License](LICENSE), except `src/components/effects/LightRays.jsx` and `.css`, which are [React Bits](https://github.com/DavidHDev/react-bits) under MIT + Commons Clause. The written content, photos and illustrations are © 2026 Michaella Gonzales, all rights reserved.
