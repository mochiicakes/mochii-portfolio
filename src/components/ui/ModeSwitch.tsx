import { useSyncExternalStore } from 'react'
import { content } from '../../content'
import { modeStore, pageStore, setMode, setPage } from '../../lib/htmlState'
import { scrollToTop } from '../../lib/scroll'
import { useReducedMotion } from '../../lib/useReducedMotion'
import type { Mode } from '../../types'

const MODES: Mode[] = ['recruiter', 'casual']

/**
 * Picks a mode and goes to the top of the main page, from wherever the visitor
 * is. Leaving Contact (or any other #section) drops it from the address.
 */
function pick(m: Mode, reduced: boolean) {
  const fromContact = pageStore.get() === 'contact'
  setMode(m)
  setPage('home')
  if (location.hash && location.hash !== '#top') history.pushState(null, '', '#top')
  scrollToTop(fromContact || reduced)
}

/** Recruiter / Casual. Recruiter shows "Around Tech", casual shows "Out of Tech". */
export function ModeSwitch({ className }: { className?: string }) {
  const mode = useSyncExternalStore(modeStore.subscribe, modeStore.get, modeStore.getServer)
  // On the Contact page neither mode is the place you are.
  const page = useSyncExternalStore(pageStore.subscribe, pageStore.get, pageStore.getServer)
  const reduced = useReducedMotion()
  const t = content.modes
  return (
    <div className={['mode-switch needs-js', className].filter(Boolean).join(' ')} role="group" aria-label={t.label}>
      {MODES.map((m) => (
        <button key={m} type="button" aria-pressed={page !== 'contact' && mode === m} onClick={() => pick(m, reduced)}>
          {t[m]}
        </button>
      ))}
    </div>
  )
}
