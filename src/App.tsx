import { useEffect, useSyncExternalStore } from 'react'
import { Contact } from './components/Contact'
import { CursorKoi } from './components/effects/CursorKoi'
import { CrystalLayer } from './components/effects/CrystalLayer'
import { PaintedGround } from './components/effects/PaintedGround'
import { NameHero } from './components/NameHero'
import { TopBar } from './components/TopBar'
import { World } from './components/World'
import { content } from './content'
import { revealStore, setMode, setTab } from './lib/htmlState'
import { lockScroll, scrollToElement, startSmoothScroll, stopSmoothScroll } from './lib/scroll'
import { useReducedMotion } from './lib/useReducedMotion'
import type { Mode, RecruiterTabId } from './types'

/**
 * Make an in-page target visible before scrolling to it: switch to the world and
 * tab that hold it, and open it if it is a case study.
 */
function reveal(el: HTMLElement) {
  const world = el.closest<HTMLElement>('.world')
  if (world) setMode(world.dataset.world as Mode)
  const panel = el.closest<HTMLElement>('.tab-panel')
  if (panel) setTab(panel.dataset.tab as RecruiterTabId)
  if (el instanceof HTMLDetailsElement) el.open = true
}

function go(id: string, reduced: boolean) {
  const el = id ? document.getElementById(id) : null
  if (!el) return false
  reveal(el)
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
        go(decodeURIComponent(location.hash.slice(1)), true)
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
      <PaintedGround />
      <CrystalLayer />
      <div id="page" className="page">
        <TopBar />
        <main>
          <NameHero />
          <World />
          <Contact />
        </main>
        <footer className="footer">{content.footer}</footer>
      </div>
      <CursorKoi />
    </>
  )
}
