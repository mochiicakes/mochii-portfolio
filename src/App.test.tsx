import { describe, expect, it } from 'vitest'
import { meta, render } from './entry-server'

// The production build pre-renders the page with this same render(), so if it
// breaks here the deployed HTML would break too.
describe('App', () => {
  it('pre-renders the page with the hero name and contact email', () => {
    const html = render()
    // The name is drawn in two parts: read the heading as text.
    const heading = html.match(/<h1.*?<\/h1>/s)?.[0].replace(/<[^>]+>/g, '')
    expect(heading).toBe(meta.name)
    expect(html).toContain(meta.email)
  })
})
