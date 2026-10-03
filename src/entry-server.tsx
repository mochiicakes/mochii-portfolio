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

export const meta = content.meta
