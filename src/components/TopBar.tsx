import { useEffect, useState, useSyncExternalStore } from 'react'
import { content } from '../content'
import { pageStore } from '../lib/htmlState'
import { ModeSwitch } from './ui/ModeSwitch'

export function TopBar() {
  const page = useSyncExternalStore(pageStore.subscribe, pageStore.get, pageStore.getServer)
  // Once the page moves, the bar gets a wash of its own so content passing
  // under it stays out of the way.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      <a className="skip-link" href="#work">
        Skip to content
      </a>
      <header className="topbar" data-scrolled={scrolled || undefined}>
        <a className="topbar-mark" href="#top" aria-label={`${content.hero.name}, back to top`}>
          MG
        </a>
        <div className="topbar-end">
          <ModeSwitch />
          <a className="topbar-link" href="#contact" aria-current={page === 'contact' ? 'page' : undefined}>
            {content.contact.title}
          </a>
        </div>
      </header>
    </>
  )
}
