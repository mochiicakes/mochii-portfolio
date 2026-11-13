import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
import { content } from './content'

// Used at build time only, so the page reads fine even if JavaScript fails.
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

/** What the head tags and the JSON-LD Person need, read from content.ts. */
export const meta = {
  ...content.meta,
  name: content.hero.name,
  role: content.hero.role,
  email: content.contact.email,
  links: content.contact.links.map((l) => l.href),
}
