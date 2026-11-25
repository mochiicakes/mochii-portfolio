import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/inter/wght-italic.css'
// The scanline pixel face, with its bleed and scanline axes.
import '@fontsource-variable/sixtyfour/full.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/page.css'
import './styles/glass.css'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Production HTML is pre-rendered (scripts/prerender.mjs), so hydrate it.
// The dev server serves an empty root, so render from scratch there.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
