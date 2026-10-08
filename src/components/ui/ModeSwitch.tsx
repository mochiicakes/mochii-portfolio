import { useSyncExternalStore } from 'react'
import { content } from '../../content'
import { modeStore, pageStore, setMode, setPage } from '../../lib/htmlState'
import { scrollToElement } from '../../lib/scroll'
import type { Mode } from '../../types'

const MODES: Mode[] = ['recruiter', 'casual']

/**
 * Picks a mode. From the Contact page it also goes back to the main page, at
 * that mode's world, and drops #contact from the address.
 */
function pick(m: Mode) {
  setMode(m)
  if (pageStore.get() !== 'contact') return
  setPage('home')
  history.pushState(null, '', '#work')
  const work = document.getElementById('work')
  // Wait for the main page to show before measuring where to scroll.
  if (work) requestAnimationFrame(() => requestAnimationFrame(() => scrollToElement(work, true)))
}

/** Recruiter / Casual. Recruiter shows "Around Tech", casual shows "Out of Tech". */
export function ModeSwitch({ className }: { className?: string }) {
  const mode = useSyncExternalStore(modeStore.subscribe, modeStore.get, modeStore.getServer)
  // On the Contact page neither mode is the place you are.
  const page = useSyncExternalStore(pageStore.subscribe, pageStore.get, pageStore.getServer)
  const t = content.modes
  return (
    <div className={['mode-switch needs-js', className].filter(Boolean).join(' ')} role="group" aria-label={t.label}>
      {MODES.map((m) => (
        <button key={m} type="button" aria-pressed={page !== 'contact' && mode === m} onClick={() => pick(m)}>
          {t[m]}
        </button>
      ))}
    </div>
  )
}
