import { content } from '../../content'
import { hasPlaceholder } from '../../lib/placeholder'
import type { AutomationLink, RecruiterTabId } from '../../types'
import { Card, type CardAction } from '../ui/Card'
import { ExternalLink } from '../ui/ExternalLink'
import { FlowDiagram } from '../ui/FlowDiagram'
import { Rich } from '../ui/Rich'

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

function Experience() {
  const b = content.background
  return (
    <>
      <ol className="jobs">
        {content.experience.map((job) => (
          <li key={job.id} id={job.id} className="job pane">
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
          </li>
        ))}
      </ol>
      <div className="background pane">
        <h4>{b.heading}</h4>
        <p>
          <Rich text={b.degree} />
        </p>
        <ul className="bullets">
          {b.leadership.map((l) => (
            <li key={l}>
              <Rich text={l} />
            </li>
          ))}
        </ul>
        <p>
          <span className="label">Awards:</span> <Rich text={b.awards} />
        </p>
        <p>
          <span className="label">Certifications:</span> <Rich text={b.certs} />
        </p>
      </div>
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

function Automations() {
  return (
    <>
      <p className="panel-intro">{content.automationsIntro}</p>
      <ul className="card-grid card-grid-2">
        {content.automations.map((a) => (
          <li key={a.slug}>
            <Card
              title={a.title}
              media={<FlowDiagram nodes={a.nodes} />}
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
    </>
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
    case 'experience':
      return <Experience />
    case 'cases':
      return <Cases />
    case 'automations':
      return <Automations />
    case 'how-i-work':
      return <HowIWork />
  }
}
