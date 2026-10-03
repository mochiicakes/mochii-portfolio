import { content } from '../content'
import { ModeSwitch } from './ui/ModeSwitch'

export function TopBar() {
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
          <a className="topbar-link" href="#contact">
            {content.contact.title}
          </a>
        </div>
      </header>
    </>
  )
}
