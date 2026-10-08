import '@fontsource-variable/playfair-display/wght.css'
// The hero name only: static 800, whose letters are single merged outlines, so
// the blue outline drawn over the portrait has no overlap seams.
import '@fontsource/playfair-display/latin-800.css'
import '@fontsource-variable/lora/wght.css'
import '@fontsource-variable/lora/wght-italic.css'
import '@fontsource/mrs-saint-delafield/latin-400.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/page.css'

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
