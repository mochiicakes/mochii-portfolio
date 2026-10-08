import { content } from '../content'
import type { ReactNode } from 'react'
import type { CasualTabId, Mode, RecruiterTabId } from '../types'
import { CardFan, type FanCard } from './CardFan'
import { IntroVideo } from './IntroVideo'
import { ScreenFoot } from './ScreenFoot'
import { Automations, Experience, RecruiterPanel } from './panels/RecruiterPanels'
import { Divider } from './ui/Ornaments'
import { Tabs } from './ui/Tabs'

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

/** A part of the recruiter world under its own header: Experience, Impact, Automations, Personal Projects. */
type Next = { id: string; label: string }

/** The divider at the foot of a screen, leading on to the next topic. */
function NextDivider({ next }: { next?: Next }) {
  return next ? <Divider to={next.id} label={`Scroll to ${next.label}`} /> : null
}

/**
 * One topic, one screen: Experience, Impact, Automations, Personal Projects.
 * A divider at its foot leads on to the next one.
 */
function Part({
  id,
  title,
  intro,
  next,
  last,
  children,
}: {
  id: string
  title: string
  intro?: string
  next?: Next
  /** The page's last screen: it carries the credits and the koi's home. */
  last?: boolean
  children: ReactNode
}) {
  return (
    <section id={id} className="world-part screen" data-screen aria-labelledby={`${id}-title`}>
      <header className="part-head">
        <h3 id={`${id}-title`} className="section-title">
          {title}
        </h3>
        {intro && <p className="part-intro">{intro}</p>}
      </header>
      {children}
      <NextDivider next={next} />
      {last && <ScreenFoot />}
    </section>
  )
}

/**
 * One world per mode, one screen per topic. Recruiter mode ("Around Tech") opens
 * with the intro video, then Experience, the Impact tabs, Automations and the
 * Personal Projects fan. Casual mode ("Out of Tech") is one screen: the Gaming
 * and Hobbies fan. CSS shows the world that matches the mode; both show without
 * JavaScript.
 */
function WorldSection({ mode }: { mode: Mode }) {
  const world = content.worlds[mode]
  return (
    <section className="world" data-world={mode} aria-labelledby={`world-${mode}`}>
      {/* The world's first screen: its header, then the intro video or the fan. */}
      <div className="world-intro-screen screen" data-screen>
        <header className="world-head">
          <h2 id={`world-${mode}`} className="world-title">
            {world.title}
          </h2>
          <p className="world-intro">{world.intro}</p>
        </header>
        {mode === 'recruiter' ? (
          <IntroVideo />
        ) : (
          <CardFan label={world.title} ring={content.fan.ring} cards={casualCards()} groups={content.worlds.casual.tabs} />
        )}
        {mode === 'recruiter' ? <NextDivider next={{ id: 'experience', label: 'experience' }} /> : <ScreenFoot />}
      </div>
      {mode === 'recruiter' && (
        <>
          <Part
            id="experience"
            title={content.sections.experience.title}
            intro={content.sections.experience.intro}
            next={{ id: 'impact', label: 'impact' }}
          >
            <Experience />
          </Part>
          <Part id="impact" title={content.worlds.recruiter.tabsTitle} next={{ id: 'automations', label: 'automations' }}>
            <Tabs
              set="recruiter"
              label={content.worlds.recruiter.tabsTitle}
              tabs={content.worlds.recruiter.tabs.map((t) => ({ id: t.id, label: t.label, title: t.label }))}
            >
              {(id) => <RecruiterPanel tab={id as RecruiterTabId} />}
            </Tabs>
          </Part>
          <Part
            id="automations"
            title={content.sections.automations.title}
            intro={content.sections.automations.intro}
            next={{ id: 'personal-projects', label: 'personal projects' }}
          >
            <Automations />
          </Part>
          <Part last id="personal-projects" title={content.fan.recruiterGroup} intro={content.worlds.recruiter.projectsIntro}>
            <CardFan label={content.fan.recruiterGroup} ring={content.fan.ring} cards={projectCards()} />
          </Part>
        </>
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
