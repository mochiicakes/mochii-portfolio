import { content } from '../content'
import type { Mode, RecruiterTabId } from '../types'

// Page-level state that CSS needs before React runs lives on <html>:
//   data-mode="recruiter" | "casual"   which world is shown
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

export const revealStore = {
  subscribe: watch('class'),
  get: () => root().classList.contains('revealed'),
  getServer: () => false,
}

export function markRevealed() {
  root().classList.add('revealed')
}

// Active recruiter tab.
const INITIAL: RecruiterTabId = content.worlds.recruiter.tabs[0].id
let tab = INITIAL
const tabListeners = new Set<() => void>()

export const tabStore = {
  subscribe(listener: () => void) {
    tabListeners.add(listener)
    return () => {
      tabListeners.delete(listener)
    }
  },
  get: () => tab,
  getServer: () => INITIAL,
}

export function setTab(id: RecruiterTabId) {
  if (tab === id) return
  tab = id
  tabListeners.forEach((l) => l())
}
