import { useSyncExternalStore } from 'react'
import { content } from '../content'
import { pageStore } from '../lib/htmlState'
import { ModeSwitch } from './ui/ModeSwitch'

export function TopBar() {
  const page = useSyncExternalStore(pageStore.subscribe, pageStore.get, pageStore.getServer)
  return (
    <>
      <a className="skip-link" href="#work">
        Skip to content
      </a>
      <header className="topbar">
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
