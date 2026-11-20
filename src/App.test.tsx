import { describe, expect, it } from 'vitest'
import { meta, render } from './entry-server'

// The production build pre-renders the page with this same render(), so if it
// breaks here the deployed HTML would break too.
describe('App', () => {
  it('pre-renders the page with the hero name and contact email', () => {
    const html = render()
    expect(html).toContain(meta.name)
    expect(html).toContain(meta.email)
  })
})
