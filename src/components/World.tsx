import { useRef, useSyncExternalStore, type KeyboardEvent } from 'react'
import { content } from '../content'
import { setTab, tabStore } from '../lib/htmlState'
import type { CasualTabId, Mode, RecruiterTabId } from '../types'
import { CardFan, type FanCard } from './CardFan'
import { RecruiterPanel } from './panels/RecruiterPanels'
import { ModeSwitch } from './ui/ModeSwitch'

function projectCards(): FanCard[] {
  const group = content.fan.recruiterGroup
  return [...content.projects]
    .sort((a, b) => Number(b.status === 'Live') - Number(a.status === 'Live'))
    .map((p) => ({
      id: p.slug,
      group: 'projects',
      groupLabel: group,
      title: p.title,
      meta: `${p.status}, built with ${p.stack.join(', ')}`,
      detail: p.description,
      image: p.thumbnail,
      link: { href: p.href, label: content.cardLabels.visit, soon: content.cardLabels.comingSoon },
    }))
}

function casualCards(): FanCard[] {
  return content.worlds.casual.tabs.flatMap((tab) =>
    content.casual[tab.id as CasualTabId].map((m) => ({
      id: m.slug,
      group: tab.id,
      groupLabel: tab.label,
      title: m.title,
      meta: m.when,
      detail: m.detail,
      image: m.image,
    })),
  )
}

function RecruiterTabs() {
  const active = useSyncExternalStore(tabStore.subscribe, tabStore.get, tabStore.getServer)
  const listRef = useRef<HTMLDivElement>(null)
  const tabs = content.worlds.recruiter.tabs

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
    setTab(id)
    listRef.current?.querySelector<HTMLButtonElement>(`#tab-${id}`)?.focus()
  }

  return (
    <>
      <div ref={listRef} className="tabs needs-js" role="tablist" aria-label={content.worlds.recruiter.title} onKeyDown={onKey}>
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            aria-controls={t.id}
            tabIndex={t.id === active ? 0 : -1}
            onClick={() => setTab(t.id)}
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
          data-tab={t.id}
          data-active={t.id === active || undefined}
          tabIndex={0}
        >
          <h3 className="panel-title">{t.label}</h3>
          <RecruiterPanel tab={t.id as RecruiterTabId} />
        </div>
      ))}
    </>
  )
}

/**
 * One world per mode. Recruiter mode ("Around Tech") deals the projects onto the
 * fan, then the work tabs. Casual mode ("Out of Tech") deals Gaming, Hobbies and
 * Life. CSS shows the world that matches the mode; both show without JavaScript.
 */
function WorldSection({ mode }: { mode: Mode }) {
  const world = content.worlds[mode]
  return (
    <section className="world" data-world={mode} aria-labelledby={`world-${mode}`}>
      <header className="world-head">
        <h2 id={`world-${mode}`} className="world-title">
          {world.title}
        </h2>
        <p className="world-intro">{world.intro}</p>
        <ModeSwitch className="world-switch" />
      </header>
      {mode === 'recruiter' ? (
        <>
          <CardFan label={content.fan.recruiterGroup} ring={content.fan.ring} cards={projectCards()} />
          <RecruiterTabs />
        </>
      ) : (
        <CardFan
          label={world.title}
          ring={content.fan.ring}
          cards={casualCards()}
          groups={content.worlds.casual.tabs}
        />
      )}
    </section>
  )
}

export function World() {
  return (
    <div id="work" className="worlds">
      <WorldSection mode="recruiter" />
      <WorldSection mode="casual" />
    </div>
  )
}
