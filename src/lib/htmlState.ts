import { content } from '../content'
import type { Mode } from '../types'

// Page-level state that CSS needs before React runs lives on <html>:
//   data-mode="recruiter" | "casual"   which world is shown
//   data-page="contact"                  Contact is open as its own page
//   class="revealed"                   the paint reveal is done
// index.html sets both before first paint, so there is no flash.
// Keep the storage key in sync with the inline script there.
export const MODE_KEY = 'mg-mode'

const root = () => document.documentElement

function watch(attribute: string) {
  return (onChange: () => void) => {
    const mo = new MutationObserver(onChange)
    mo.observe(root(), { attributes: true, attributeFilter: [attribute] })
    return () => mo.disconnect()
  }
}

export const modeStore = {
  subscribe: watch('data-mode'),
  get: (): Mode => (root().dataset.mode === 'casual' ? 'casual' : 'recruiter'),
  getServer: (): Mode => 'recruiter',
}

export function setMode(mode: Mode) {
  root().dataset.mode = mode
  try {
    localStorage.setItem(MODE_KEY, mode)
  } catch {
    // Storage blocked: the switch still works for this visit.
  }
}

export type Page = 'home' | 'contact'

/** Which page shows: the main page, or Contact on its own. Follows the URL hash. */
export const pageStore = {
  subscribe: watch('data-page'),
  get: (): Page => (root().dataset.page === 'contact' ? 'contact' : 'home'),
  getServer: (): Page => 'home',
}

export function setPage(page: Page) {
  if (page === 'contact') root().dataset.page = 'contact'
  else delete root().dataset.page
}

export const revealStore = {
  subscribe: watch('class'),
  get: () => root().classList.contains('revealed'),
  getServer: () => false,
}

export function markRevealed() {
  root().classList.add('revealed')
}

// The active tab of each tab set. The first tab is active until one is picked.
export type TabStore<Id extends string = string> = ReturnType<typeof createTabStore<Id>>

function createTabStore<Id extends string>(initial: Id) {
  let tab = initial
  const listeners = new Set<() => void>()
  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    get: () => tab,
    getServer: () => initial,
    set(id: Id) {
      if (tab === id) return
      tab = id
      listeners.forEach((l) => l())
    },
  }
}

/** One store per tab set, keyed by the `data-tabs` name on its panels. */
export const tabStores = {
  recruiter: createTabStore(content.worlds.recruiter.tabs[0].id),
  experience: createTabStore(content.experience[0].id),
}

export type TabSet = keyof typeof tabStores
