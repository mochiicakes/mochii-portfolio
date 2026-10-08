import { content } from '../../content'
import { hasPlaceholder } from '../../lib/placeholder'
import type { AutomationLink, Job, RecruiterTabId, Region } from '../../types'
import { Card, type CardAction } from '../ui/Card'
import { ExternalLink } from '../ui/ExternalLink'
import { FlowDiagram } from '../ui/FlowDiagram'
import { Rich } from '../ui/Rich'
import { Tabs } from '../ui/Tabs'
import { Thumb } from '../ui/Thumb'

function Proof() {
  const { claimHeading, evidenceHeading, rows } = content.proof
  return (
    <div className="proof-wrap pane">
    <table className="proof">
      <thead>
        <tr>
          <th scope="col">{claimHeading}</th>
          <th scope="col">{evidenceHeading}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.claim}>
            <th scope="row">{row.claim}</th>
            <td>
              <Rich text={row.evidence} />
              {row.href && (
                <>
                  {' '}
                  <a className="proof-link" href={row.href}>
                    See it
                  </a>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}

/** A tab label: the name, then a tag for the region. */
function regionTab(id: string, name: string, region: Region) {
  return {
    id,
    label: (
      <>
        {name}
        <abbr className="tab-region" title={region.name}>
          {region.abbr}
        </abbr>
      </>
    ),
  }
}

const EDUCATION = 'education'

function JobThumb({ job }: { job: Job }) {
  const thumb = <Thumb src={job.thumbnail} alt="" label={job.org} className="job-thumb-img" />
  return hasPlaceholder(job.href) ? (
    <span className="job-thumb">{thumb}</span>
  ) : (
    <ExternalLink href={job.href} className="job-thumb">
      {thumb}
      <span className="job-thumb-go">
        {content.cardLabels.visitSite} <span className="sr-only">{job.org}</span>
        <span aria-hidden="true">↗</span>
      </span>
    </ExternalLink>
  )
}

function JobPane({ job }: { job: Job }) {
  return (
    <div className="job pane">
      <JobThumb job={job} />
      <header className="job-head">
        <h4 className="job-org">{job.org}</h4>
        <p className="job-role">{job.role}</p>
        <p className="job-dates">
          <Rich text={job.dates} />
          {job.location && (
            <>
              {', '}
              <Rich text={job.location} />
            </>
          )}
        </p>
      </header>
      <ul className="bullets">
        {job.bullets.map((bl) => (
          <li key={bl.text}>
            <Rich text={bl.text} />
            {bl.link && (
              <>
                {' ('}
                <ExternalLink href={bl.link.href}>{bl.link.label}</ExternalLink>
                {')'}
              </>
            )}
            {bl.chip && (
              <span className="scale">
                <Rich text={bl.chip} />
              </span>
            )}
          </li>
        ))}
      </ul>
      {job.meta && (
        <p className="job-meta">
          <span>{job.meta.label}:</span> <Rich text={job.meta.text} />
        </p>
      )}
    </div>
  )
}

function Education() {
  const b = content.background
  return (
    <div className="background pane">
      <h4>{b.heading}</h4>
      <p>
        <Rich text={b.degree} />
      </p>
      <p>
        <span className="label">Awards:</span> <Rich text={b.awards} />
      </p>
      <p>
        <span className="label">Certifications:</span> <Rich text={b.certs} />
      </p>
    </div>
  )
}

/** One tab per job, then Education. */
export function Experience() {
  const b = content.background
  const tabs = [
    ...content.experience.map((job) => regionTab(job.id, job.tab, job.region)),
    regionTab(EDUCATION, b.tab, b.region),
  ]
  return (
    <Tabs set="experience" label={content.sections.experience.title} tabs={tabs}>
      {(id) => (id === EDUCATION ? <Education /> : <JobPane job={content.experience.find((j) => j.id === id)!} />)}
    </Tabs>
  )
}

function Leadership() {
  const l = content.leadership
  return (
    <>
      <p className="panel-intro">{l.intro}</p>
      <ol className="jobs">
        {l.groups.map((g) => (
          <li key={g.id} id={g.id} className="job pane">
            <header className="job-head">
              <h4 className="job-org">{g.heading}</h4>
              <p className="job-dates">
                <Rich text={g.period} />
              </p>
            </header>
            <ul className="bullets">
              {g.items.map((it) => (
                <li key={it.text}>
                  {it.kind && <span className="lead-kind">{it.kind}</span>}
                  <Rich text={it.text} />
                  {it.chip && (
                    <span className="scale">
                      <Rich text={it.chip} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  )
}

function Cases() {
  const h = content.caseHeadings
  return (
    <div className="cases">
      {content.caseStudies.map((cs, i) => (
        <details key={cs.id} id={cs.id} className="case pane" open={i === 0}>
          <summary>
            <h4 className="case-title">
              <Rich text={cs.title} />
            </h4>
            <span className="case-toggle" aria-hidden="true" />
          </summary>
          <dl className="case-body">
            <div>
              <dt>{h.problem}</dt>
              <dd>
                <Rich text={cs.problem} />
              </dd>
            </div>
            <div>
              <dt>{h.role}</dt>
              <dd>
                <Rich text={cs.role} />
              </dd>
            </div>
            <div>
              <dt>{h.built}</dt>
              <dd>
                {Array.isArray(cs.built) ? (
                  <ol className="case-steps">
                    {cs.built.map((step) => (
                      <li key={step}>
                        <Rich text={step} />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <Rich text={cs.built} />
                )}
              </dd>
            </div>
            <div>
              <dt>{h.decisions}</dt>
              <dd>
                <Rich text={cs.decisions} />
              </dd>
            </div>
            <div>
              <dt>{h.result}</dt>
              <dd>
                <Rich text={cs.result} />
                {cs.resultNote && <span className="scale">{cs.resultNote}</span>}
              </dd>
            </div>
          </dl>
        </details>
      ))}
    </div>
  )
}

function toAction(link: AutomationLink): CardAction {
  if (!link) return { kind: 'none' }
  if (link.kind === 'case') return { kind: 'internal', href: `#${link.caseId}` }
  return hasPlaceholder(link.href) ? { kind: 'soon' } : { kind: 'external', href: link.href }
}

export function Automations() {
  return (
    <ul className="card-grid card-grid-2 automations">
      {content.automations.map((a) => (
        <li key={a.slug}>
          <Card
            title={a.title}
            media={
              <>
                <FlowDiagram nodes={a.nodes} shape="row" className="flow-wide" />
                <FlowDiagram nodes={a.nodes} className="flow-narrow" />
              </>
            }
            meta={
              <p className="card-scale">
                <span className="sr-only">{content.cardLabels.scale}: </span>
                <Rich text={a.scale} />
              </p>
            }
            description={a.description}
            stack={a.stack}
            action={toAction(a.link)}
          />
        </li>
      ))}
    </ul>
  )
}

function HowIWork() {
  const w = content.howIWork
  return (
    <div className="how">
      <ol className="principles pane">
        {w.principles.map((p) => (
          <li key={p}>
            <Rich text={p} />
          </li>
        ))}
      </ol>
      <div className="toolbox pane">
        <h4>{w.toolboxHeading}</h4>
        <dl>
          {w.toolbox.map((g) => (
            <div key={g.area}>
              <dt>{g.area}</dt>
              <dd>
                <Rich text={g.tools} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export function RecruiterPanel({ tab }: { tab: RecruiterTabId }) {
  switch (tab) {
    case 'proof':
      return <Proof />
    case 'leadership':
      return <Leadership />
    case 'cases':
      return <Cases />
    case 'how-i-work':
      return <HowIWork />
  }
}
