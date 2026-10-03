import { useSyncExternalStore } from 'react'
import { content } from '../../content'
import { modeStore, setMode } from '../../lib/htmlState'
import type { Mode } from '../../types'

const MODES: Mode[] = ['recruiter', 'casual']

/** Recruiter / Casual. Recruiter shows "Around Tech", casual shows "Out of Tech". */
export function ModeSwitch({ className }: { className?: string }) {
  const mode = useSyncExternalStore(modeStore.subscribe, modeStore.get, modeStore.getServer)
  const t = content.modes
  return (
    <div className={['mode-switch needs-js', className].filter(Boolean).join(' ')} role="group" aria-label={t.label}>
      {MODES.map((m) => (
        <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
          {t[m]}
        </button>
      ))}
    </div>
  )
}
