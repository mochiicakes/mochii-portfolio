import { useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react'
import { tabStores, type TabSet, type TabStore } from '../../lib/htmlState'

type Tab = { id: string; label: ReactNode; title?: string }

/**
 * A tab list and its panels. Each panel's id is its tab's id, so an in-page
 * link to it (or to anything inside it) opens the tab first; see `reveal` in
 * App. Without JavaScript the tab list hides and every panel shows, each under
 * its `title`.
 */
export function Tabs({ set, label, tabs, children }: { set: TabSet; label: string; tabs: Tab[]; children: (id: string) => ReactNode }) {
  const store = tabStores[set] as TabStore
  const active = useSyncExternalStore(store.subscribe, store.get, store.getServer)
  const select = store.set
  const listRef = useRef<HTMLDivElement>(null)

  const onKey = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === active)
    const next =
      e.key === 'ArrowRight' ? (i + 1) % tabs.length
      : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? tabs.length - 1
      : -1
    if (next < 0) return
    e.preventDefault()
    const id = tabs.at(next)!.id
    select(id)
    listRef.current?.querySelector<HTMLButtonElement>(`#tab-${id}`)?.focus()
  }

  return (
    <>
      <div ref={listRef} className="tabs needs-js" role="tablist" aria-label={label} onKeyDown={onKey}>
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            aria-controls={t.id}
            tabIndex={t.id === active ? 0 : -1}
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          id={t.id}
          className="tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          data-tabs={set}
          data-active={t.id === active || undefined}
          tabIndex={0}
        >
          {t.title && <h3 className="panel-title">{t.title}</h3>}
          {children(t.id)}
        </div>
      ))}
    </>
  )
}
