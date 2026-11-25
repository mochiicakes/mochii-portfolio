import { useEffect, useSyncExternalStore } from 'react'
import { Contact } from './components/Contact'
import { CursorAngel } from './components/effects/CursorAngel'
import { DeepIntro } from './components/effects/DeepIntro'
import { Ocean } from './components/effects/Ocean'
import { NameHero } from './components/NameHero'
import { TopBar } from './components/TopBar'
import { World } from './components/World'
import { fitScreens } from './lib/fit'
import { pageStore, revealStore, setMode, setPage, tabStores, type TabSet, type TabStore } from './lib/htmlState'
import { lockScroll, scrollToElement, scrollToTop, startSmoothScroll, stopSmoothScroll } from './lib/scroll'
import { useReducedMotion } from './lib/useReducedMotion'
import type { Mode } from './types'

/**
 * Make an in-page target visible before scrolling to it: open the page that
 * holds it (Contact is a page of its own), switch to its mode and tab, and open
 * it if it is a case study.
 */
function reveal(el: HTMLElement) {
  setPage(el.closest('#contact') ? 'contact' : 'home')
  const world = el.closest<HTMLElement>('[data-world]')
  if (world) setMode(world.dataset.world as Mode)
  const panel = el.closest<HTMLElement>('.tab-panel')
  if (panel) (tabStores[panel.dataset.tabs as TabSet] as TabStore).set(panel.id)
  if (el instanceof HTMLDetailsElement) el.open = true
}

function go(id: string, reduced: boolean) {
  const el = id ? document.getElementById(id) : null
  if (!el) return false
  const from = pageStore.get()
  reveal(el)
  // Contact is a page of its own: it opens at its top.
  if (id === 'contact') {
    scrollToTop(reduced || from !== 'contact')
    return true
  }
  // Wait for React to show the tab before measuring where to scroll.
  requestAnimationFrame(() => requestAnimationFrame(() => scrollToElement(el, reduced)))
  return true
}

export function App() {
  const revealed = useSyncExternalStore(revealStore.subscribe, revealStore.get, revealStore.getServer)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!reduced) startSmoothScroll()
    return stopSmoothScroll
  }, [reduced])

  useEffect(() => fitScreens(), [])

  useEffect(() => {
    lockScroll(!revealed)
    const page = document.getElementById('page')
    if (page) page.inert = !revealed
  }, [revealed, reduced])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]')
      if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey) return
      const id = link.getAttribute('href')?.slice(1) ?? ''
      if (go(id, reduced)) {
        e.preventDefault()
        history.pushState(null, '', `#${id}`)
      }
    }
    const fromHash = () => {
      try {
        const id = decodeURIComponent(location.hash.slice(1))
        // Back to a plain URL: the main page, from the top.
        if (!id) {
          setPage('home')
          window.scrollTo(0, 0)
          return
        }
        go(id, true)
      } catch {
        // Malformed hash: stay where we are.
      }
    }
    document.addEventListener('click', onClick)
    window.addEventListener('popstate', fromHash)
    if (location.hash) fromHash()
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', fromHash)
    }
  }, [reduced])

  return (
    <>
      {/* The top bar sits outside #page so it can float above the angel. */}
      <TopBar />
      <Ocean />
      <DeepIntro />
      <div id="page" className="page">
        <main>
          <NameHero />
          <World />
          <Contact />
        </main>
      </div>
      <CursorAngel />
    </>
  )
}
