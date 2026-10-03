// Shapes for src/content.ts. Any string may contain [square-bracket] placeholders;
// they render as dashed chips until replaced.

export type Link = { label: string; href: string }

/** Recruiter mode shows "Around Tech", casual mode shows "Out of Tech". */
export type Mode = 'recruiter' | 'casual'

export type ProofRow = { claim: string; evidence: string; href?: string }

export type Bullet = { text: string; chip?: string; link?: Link }

export type Job = {
  id: string
  org: string
  role: string
  dates: string
  location?: string
  bullets: Bullet[]
  meta?: { label: string; text: string }
}

export type CaseStudy = {
  id: string
  title: string
  problem: string
  role: string
  /** A list renders as numbered steps; a string renders as a sentence. */
  built: string | string[]
  decisions: string
  result: string
  /** Small qualifier shown after the result, e.g. "Self-reported". */
  resultNote?: string
}

export type ProjectStatus = 'Live' | 'In development' | 'Desktop app'

export type Project = {
  slug: string
  title: string
  status: ProjectStatus
  description: string
  stack: string[]
  /** Deployed URL. A [placeholder] shows the card as "Link coming soon". */
  href: string
  /** Screenshot path under public/. Missing files fall back to a painted title card. */
  thumbnail: string
}

export type AutomationLink = { kind: 'case'; caseId: string } | { kind: 'external'; href: string } | null

export type Automation = {
  slug: string
  title: string
  scale: string
  nodes: string[]
  description: string
  stack: string[]
  link: AutomationLink
}

export type ToolGroup = { area: string; tools: string }

/** One card in the casual-mode fan (Gaming, Hobbies, Life). */
export type Moment = {
  slug: string
  title: string
  detail: string
  when?: string
  /** Photo under public/casual/. Missing files fall back to a painted card. */
  image: string
}

export type RecruiterTabId = 'proof' | 'experience' | 'cases' | 'automations' | 'how-i-work'
export type CasualTabId = 'gaming' | 'hobbies' | 'life'

export type Tab<Id extends string> = { id: Id; label: string }

export type Content = {
  meta: { title: string; description: string }
  gate: { prompt: string; hint: string; skip: string }
  hero: {
    name: string
    role: string
    primaryCta: Link
    cvCta: Link
  }
  tagline: { line1: string; line2: string; supporting: string }
  fan: { ring: string; recruiterGroup: string }
  modes: { label: string; recruiter: string; casual: string }
  worlds: {
    recruiter: { title: string; intro: string; tabs: Tab<RecruiterTabId>[] }
    casual: { title: string; intro: string; tabs: Tab<CasualTabId>[] }
  }
  proof: { claimHeading: string; evidenceHeading: string; rows: ProofRow[] }
  experience: Job[]
  background: {
    heading: string
    degree: string
    leadership: string[]
    awards: string
    certs: string
  }
  caseHeadings: { problem: string; role: string; built: string; decisions: string; result: string }
  caseStudies: CaseStudy[]
  projects: Project[]
  automationsIntro: string
  automations: Automation[]
  cardLabels: { visit: string; readCase: string; comingSoon: string; scale: string; stack: string }
  howIWork: { principles: string[]; toolboxHeading: string; toolbox: ToolGroup[] }
  casual: Record<CasualTabId, Moment[]>
  contact: {
    title: string
    openTo: string
    email: string
    copy: string
    copied: string
    copyFailed: string
    links: Link[]
    cv: Link
  }
  footer: string
}
