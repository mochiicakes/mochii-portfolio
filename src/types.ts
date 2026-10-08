// Shapes for src/content.ts. Any string may contain [square-bracket] placeholders;
// they render as dashed chips until replaced.

export type Link = { label: string; href: string }

/** Recruiter mode shows "Around Tech", casual mode shows "Out of Tech". */
export type Mode = 'recruiter' | 'casual'

/** A place, tagged by its abbreviation, e.g. UK. */
export type Region = { name: string; abbr: string }

export type ProofRow = { claim: string; evidence: string; href?: string }

export type Bullet = { text: string; chip?: string; link?: Link }

export type Job = {
  id: string
  /** The job's tab label. */
  tab: string
  /** Where the work was, shown as a tag beside the tab label. */
  region: Region
  /** The company's or work's site. A [placeholder] shows no link. */
  href: string
  /** Screenshot path under public/. Missing files fall back to a painted card. */
  thumbnail: string
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

/** One card in the casual-mode fan (Gaming, Hobbies). */
export type Moment = {
  slug: string
  title: string
  detail: string
  when?: string
  /** Photo under public/casual/. Missing files fall back to a painted card. */
  image: string
}

export type RecruiterTabId = 'proof' | 'leadership' | 'cases' | 'how-i-work'

/** A leadership item. `kind` marks work nobody asked for (Initiative) or unpaid (Volunteer). */
export type LeadershipItem = { text: string; kind?: 'Initiative' | 'Volunteer'; chip?: string }
export type LeadershipGroup = { id: string; heading: string; period: string; items: LeadershipItem[] }
export type CasualTabId = 'gaming' | 'hobbies'

export type Tab<Id extends string> = { id: Id; label: string }

export type Content = {
  meta: { title: string; description: string }
  gate: { prompt: string; hint: string; skip: string }
  hero: {
    name: string
    /** Set huge behind the portrait. */
    firstName: string
    /** Signed across the first name. */
    lastName: string
    /**
     * Letters of the first name (0-based) the portrait covers, redrawn over her
     * as an outline. Only whole letters she hides: an outline on a letter she
     * barely touches shows as a stray sliver.
     */
    coverLetters: number[]
    /** A cut-out (transparent PNG) under public/, standing on the section's floor. */
    portrait: { src: string; alt: string; width: number; height: number }
    role: string
    primaryCta: Link
    cvCta: Link
  }
  tagline: { line1: string; line2: string; supporting: string }
  fan: { ring: string; recruiterGroup: string }
  modes: { label: string; recruiter: string; casual: string }
  worlds: {
    recruiter: { title: string; intro: string; projectsIntro: string; tabsTitle: string; tabs: Tab<RecruiterTabId>[] }
    casual: { title: string; intro: string; tabs: Tab<CasualTabId>[] }
  }
  proof: { claimHeading: string; evidenceHeading: string; rows: ProofRow[] }
  experience: Job[]
  leadership: { intro: string; groups: LeadershipGroup[] }
  /** The introductory video under the Around Tech header, on YouTube. */
  introVideo: { youtubeId: string; title: string; caption: string }
  /** The recruiter scroll sections after the worlds, each between dividers. */
  sections: Record<'experience' | 'automations', { title: string; intro: string }>
  background: {
    heading: string
    /** Its tab label among the jobs. */
    tab: string
    region: Region
    degree: string
    awards: string
    certs: string
  }
  caseHeadings: { problem: string; role: string; built: string; decisions: string; result: string }
  caseStudies: CaseStudy[]
  projects: Project[]
  automations: Automation[]
  cardLabels: { visit: string; visitSite: string; readCase: string; comingSoon: string; scale: string; stack: string }
  howIWork: { principles: string[]; toolboxHeading: string; toolbox: ToolGroup[] }
  casual: Record<CasualTabId, Moment[]>
  contact: {
    title: string
    /** The sticky note: typed prompts, each followed by a handwritten answer. */
    note: { hello: string; name: string; am: string; role: string; open: string; write: string }
    selfie: { src: string; alt: string; caption: string }
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
