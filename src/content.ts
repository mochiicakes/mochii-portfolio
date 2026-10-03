import type { Content } from './types'

// All site copy. Components read from here; edit text, numbers and links in this file.
// [Square brackets] mark placeholders. `npm run placeholders` lists the ones left.

const cv = { label: 'Download CV', href: '/Michaella-Gonzales-CV.pdf' }

export const content: Content = {
  meta: {
    title: 'Michaella Gonzales, AI & automation engineer',
    description:
      'Software engineer who puts AI to work across whole organizations. I build the automations, ship the integrations, and train the people who use them.',
  },

  gate: {
    prompt: 'Paint the water',
    hint: 'Move your cursor, or drag a finger, across the paper.',
    skip: 'Enter',
  },

  hero: {
    name: 'Michaella Gonzales',
    role: 'AI & automation engineer',
    primaryCta: { label: 'Get in touch', href: '#contact' },
    cvCta: cv,
  },

  tagline: {
    line1: 'Always on the move.',
    line2: 'Your goal, I follow.',
    supporting:
      'Software engineer who puts AI to work across whole organizations. I build the automations, ship the integrations, and train the people who use them.',
  },

  // The card fan. Recruiter mode deals the projects; casual mode deals Gaming, Hobbies and Life.
  fan: { ring: 'Michaella Gonzales', recruiterGroup: 'Projects' },

  modes: { label: 'View', recruiter: 'Recruiter', casual: 'Casual' },

  worlds: {
    recruiter: {
      title: 'Around Tech',
      intro: 'What I have shipped, for whom, and how it held up. Turn the cards for projects.',
      tabs: [
        { id: 'proof', label: 'Proof' },
        { id: 'experience', label: 'Experience' },
        { id: 'cases', label: 'Case studies' },
        { id: 'automations', label: 'Automations' },
        { id: 'how-i-work', label: 'How I work' },
      ],
    },
    casual: {
      title: 'Out of Tech',
      intro: 'The rest of me: the stage, the games, and everything in between. Turn the cards.',
      tabs: [
        { id: 'gaming', label: 'Gaming' },
        { id: 'hobbies', label: 'Hobbies' },
        { id: 'life', label: 'Life' },
      ],
    },
  },

  proof: {
    claimHeading: 'You need someone who',
    evidenceHeading: 'Evidence',
    rows: [
      {
        claim: 'Ships working software',
        evidence:
          'Full-stack at YOU_SOURCE: delivered a 6-month admin portal roadmap in 4 months; raised unit test coverage from 36% to 78% in 5 months',
        href: '#exp-yousource',
      },
      {
        claim: 'Knows which AI fits which job',
        evidence:
          "Benchmarked GPT, Claude and DeepSeek across 5 engineering tasks for an internal coding assistant; built API integrations for Bob, Bloch.ai's agentic platform",
        href: '#case-assistant',
      },
      {
        claim: 'Can roll automation out at scale',
        evidence:
          'n8n bio generator with scraping, validation, AI drafting, emailing and human approval, used across 26 offices and 600+ employees',
        href: '#case-bios',
      },
      {
        claim: 'Builds things leaders can trust',
        evidence:
          'Human approval step before any AI-drafted bio is sent; weekly EU legislation digest delivered to executives',
        href: '#case-executives',
      },
      {
        claim: 'Brings people along',
        evidence:
          "Wrote AI leadership training on safe usage and core concepts; ran onboarding and built the team's central documentation and tracking",
        href: '#case-executives',
      },
      {
        claim: 'Holds up under pressure',
        evidence: '80+ live events hosted for Samsung, Predator Gaming, Mineski, UAAP and others',
        href: '#exp-hosting',
      },
    ],
  },

  experience: [
    {
      id: 'exp-bloch',
      org: 'Bloch.ai',
      role: 'Automation Specialist & Consultant',
      dates: '[start date] to present',
      location: '[location]',
      bullets: [
        {
          text: 'Introduced n8n automation to marketing and finance firms across Europe',
          chip: '[n] firms, [n] offices',
        },
        {
          text: 'Built a bio generator with web scraping, validation, AI drafting, automated email and human approval',
          chip: '26 offices, 600+ employees',
        },
        {
          text: "Contributed API integrations, platform connections and UI to Bob, Bloch.ai's agentic AI platform",
          link: { label: 'bob.bloch.ai', href: 'https://bob.bloch.ai' },
        },
        {
          text: 'Automated a digest that summarises new EU legislation for executives',
          chip: '[n] executives, weekly',
        },
        {
          text: 'Wrote AI leadership training on safe usage and technical concepts',
          chip: '[n] leaders, [n] offices',
        },
        {
          text: 'Ran onboarding and set up central tracking and documentation',
          chip: '[n] new hires',
        },
      ],
      meta: { label: 'Platforms', text: 'Microsoft Entra, Supabase, Google Cloud Platform' },
    },
    {
      id: 'exp-yousource',
      org: 'YOU_SOURCE Inc.',
      role: 'Full-stack Software Engineer',
      dates: 'Dec 2023 to Jun 2025',
      bullets: [
        {
          text: "Delivered the Yebo Fresh admin and delivery portal's 6-month roadmap in 4 months; improved performance by 25% across REST APIs, database and UI",
        },
        {
          text: 'Raised unit test coverage from 36% to 78% in 5 months on Pine Connector and introduced TDD practices',
        },
        {
          text: 'Built YS-AI, a 6-module AI training web app with 92%+ satisfaction; cut deployment time by 37% with Docker and YAML config',
          chip: '60+ employees',
        },
        {
          text: 'Benchmarked 3+ LLMs for YS-LLM, an internal coding assistant',
          chip: '50+ engineers in pilot',
        },
      ],
    },
    {
      id: 'exp-hosting',
      org: 'Freelance Host & Shoutcaster',
      role: 'Esports and tech events',
      dates: 'Jan 2021 to present',
      bullets: [
        {
          text: 'Hosted and cast live events for Samsung, Predator Gaming, Mineski, TNC, UAAP, VCT and CFS',
          chip: '80+ events',
        },
      ],
    },
  ],

  background: {
    heading: 'Education and leadership',
    degree:
      'B.S. Computer Science, Software Engineering, FEU Institute of Technology, 2020 to 2024. Cum Laude, GPA 3.5/4.0.',
    leadership: [
      'President, iTamaraws Esports Club: grew membership from 70+ to 280+ and the officer team from 18 to 60+; secured full accreditation',
      'Director for Membership, ACM Student Chapter: grew active membership 36% to 470+',
      'Director for Publications, ACM Student Chapter: chapter named Best Student Organization of the Year',
    ],
    awards:
      "Outstanding Leadership Award, AcadArena Silver Awardee, President's Scholar, pitching competition wins (iTam Design Jam, Techno Fair)",
    certs: 'Cisco CCNA DevNet Associate, Google Agile Project Management, TOPCIT Level 3, Harvard Leaders of Learning',
  },

  caseHeadings: {
    problem: 'Problem',
    role: 'My role',
    built: 'What I built',
    decisions: 'Key decisions',
    result: 'Result',
  },

  caseStudies: [
    {
      id: 'case-bios',
      title: 'Bios for 600+ people, written in days instead of [months]',
      problem:
        '26 offices across Europe needed consistent staff bios. Writing them by hand was slow and the quality varied by office. [confirm]',
      role: 'Designed and built the full workflow in n8n.',
      built: [
        'Scrape existing profiles and internal data [confirm sources]',
        'Validate and clean the inputs',
        'Draft each bio with AI to a house style',
        'Email the draft to the employee for approval or edits',
        'Publish only approved bios',
      ],
      decisions:
        'A human approves every bio before it goes live, because a wrong fact on a public profile costs more than the time saved. Validation runs before drafting, so bad data never reaches the model.',
      result: '[number] bios produced; [time per bio before vs after]; [first-draft approval rate].',
    },
    {
      id: 'case-assistant',
      title: 'Choosing the model behind an internal AI assistant (YOU_SOURCE)',
      problem: 'The company wanted an AI coding assistant but had no basis for choosing a model.',
      role: "Researched and benchmarked models; contributed to the assistant's build.",
      built:
        'A comparison of GPT, Claude and DeepSeek across code generation, refactoring, task planning, test creation and documentation, then the internal tool itself, piloted with 50+ engineers.',
      decisions: '[Which model won which task, and why not one model for everything.]',
      result: 'Engineers reported an estimated 25 to 35% gain in task efficiency during the pilot.',
      resultNote: 'Self-reported',
    },
    {
      id: 'case-executives',
      title: 'Making AI usable for executives (Bloch.ai)',
      problem:
        'Leaders were expected to use and approve AI tools without a working understanding of them, and needed to track EU legislation without reading it all.',
      role: 'Wrote the training and built the automation.',
      built:
        'AI leadership training on safe usage and core concepts; an n8n workflow that summarises new EU legislation and emails executives every week.',
      decisions: '[How the training was scoped; how the digest decides what matters.]',
      result: '[Leaders trained; how long the digest has run; feedback.]',
    },
  ],

  // Live projects first. Thumbnails: add public/projects/<slug>.png (1600×1000).
  projects: [
    {
      slug: 'spirit',
      title: 'Spirit',
      status: 'Live',
      description:
        'An anonymous sky of glowing orbs where people leave a thought, feeling or confession for others to find, with mental-health resources built in.',
      stack: ['[confirm stack]'],
      href: 'https://spirit-our-comfort.vercel.app',
      thumbnail: '/projects/spirit.png',
    },
    {
      slug: 'yours-db',
      title: 'yours-db',
      status: 'Live',
      description:
        'A personal database. Build sheets with typed columns (text, number, date, choices, checkboxes, links), then search, tick off and bulk-edit rows.',
      stack: ['React', 'TypeScript', 'Vite', 'Supabase'],
      href: 'https://yours-db.vercel.app',
      thumbnail: '/projects/yours-db.png',
    },
    {
      slug: 'photo-bot',
      title: 'Photo Bot',
      status: 'Live',
      description: 'A virtual photobooth. Take photos, edit them with digital effects, and send them by email.',
      stack: ['React', 'Fabric.js', 'Tailwind', 'EmailJS'],
      href: 'https://photo-bot-kappa.vercel.app',
      thumbnail: '/projects/photo-bot.png',
    },
    {
      slug: 'tomorrow',
      title: 'tomorrow',
      status: 'In development',
      description: 'A daily planner where a cat companion of your choice keeps you company through your tasks.',
      stack: ['React Native', 'Expo', 'TypeScript', 'SQL'],
      href: '[deployed link]',
      thumbnail: '/projects/tomorrow.png',
    },
    {
      slug: 'pastel-affirmations',
      title: 'Pastel Affirmations',
      status: 'Desktop app',
      description:
        'An always-on-top pixel-art widget that shows a fresh affirmation on demand and saves your favourites.',
      stack: ['Electron', 'React', 'Express', 'Node.js'],
      href: '[deployed link or download page]',
      thumbnail: '/projects/pastel-affirmations.png',
    },
    {
      slug: 'motion-field',
      title: 'Motion Field',
      status: 'In development',
      description: 'A particle field that follows your movement through the webcam, entirely in the browser.',
      stack: ['JavaScript', 'Canvas', 'WebRTC'],
      href: '[deployed link]',
      thumbnail: '/projects/motion-field.png',
    },
  ],

  automationsIntro: 'The real systems are confidential, so each card shows the workflow instead of a screenshot.',
  automations: [
    {
      slug: 'bio-generator',
      title: 'Staff bio generator',
      scale: '26 offices, 600+ employees',
      nodes: ['Scrape', 'Validate', 'AI draft', 'Email for approval', 'Publish'],
      description:
        'Scrapes and validates staff data, drafts bios with AI, and emails each person to approve before anything is published.',
      stack: ['n8n', 'LLM API', 'Web scraping', 'Email'],
      link: { kind: 'case', caseId: 'case-bios' },
    },
    {
      slug: 'eu-digest',
      title: 'EU legislation digest',
      scale: '[n] executives, weekly',
      nodes: ['New legislation', 'Filter', 'AI summary', 'Weekly email'],
      description: 'Summarises new EU legislation and emails executives a weekly briefing.',
      stack: ['n8n', 'LLM API', 'Email'],
      link: { kind: 'case', caseId: 'case-executives' },
    },
    {
      slug: 'n8n-rollout',
      title: 'n8n rollout',
      scale: '[n] firms, [n] offices',
      nodes: ['Audit', 'Build', 'Train', 'Hand over'],
      description: 'Introduced n8n automation to marketing and finance firms across Europe.',
      stack: ['n8n', '[integrations]'],
      link: null,
    },
    {
      slug: 'bob',
      title: 'Bob (contributor)',
      scale: '[reach]',
      nodes: ['Request', 'Agent', 'API integrations', 'Response'],
      description: "Bloch.ai's agentic AI platform. I worked on API integrations, platform connections and UI.",
      stack: ['[confirm stack]'],
      link: { kind: 'external', href: 'https://bob.bloch.ai' },
    },
  ],

  cardLabels: {
    visit: 'Visit',
    readCase: 'Read the case study',
    comingSoon: 'Link coming soon',
    scale: 'Scale',
    stack: 'Built with',
  },

  howIWork: {
    principles: [
      'I pick the right tool for the job, AI included, and say when AI is the wrong tool.',
      'I keep a human in the loop where a mistake would be public or costly.',
      'I write things down, so the work outlives my involvement.',
      'I flag risks as soon as I see them.',
      "I'd rather ship a smaller version on time than a bigger one late.",
      'I pick up whatever is blocking the team, even when it is outside my area.',
    ],
    toolboxHeading: 'Toolbox',
    toolbox: [
      { area: 'AI & automation', tools: 'n8n, OpenAI, Claude and DeepSeek APIs, agentic workflows, LLM evaluation' },
      { area: 'Backend', tools: 'Python (Django), Express, PHP, Prisma, REST APIs' },
      { area: 'Frontend & mobile', tools: 'JavaScript, TypeScript, React, React Native, Expo, Flutter' },
      { area: 'Cloud & data', tools: 'Google Cloud Platform, Supabase, Firebase, Microsoft Entra' },
      { area: 'Delivery', tools: 'Docker, CI/CD, TDD, Azure DevOps, Jira' },
    ],
  },

  // Casual mode ("Out of Tech"): one card per moment. Photos go in public/casual/<slug>.jpg.
  casual: {
    gaming: [
      {
        slug: 'shoutcasting',
        title: 'On the mic',
        when: '2021 to now',
        detail: 'Hosted and cast 80+ live events for Samsung, Predator Gaming, Mineski, TNC, UAAP, VCT and CFS.',
        image: '/casual/shoutcasting.jpg',
      },
      {
        slug: 'itamaraws',
        title: 'iTamaraws Esports',
        when: 'President, FEU Tech',
        detail: 'Grew the club from 70+ to 280+ members and the officer team from 18 to 60+, and secured full accreditation.',
        image: '/casual/itamaraws.jpg',
      },
      {
        slug: 'acadarena',
        title: 'AcadArena Silver',
        detail: '[What the award recognised.]',
        image: '/casual/acadarena.jpg',
      },
      {
        slug: 'now-playing',
        title: 'Now playing',
        detail: '[Games you are playing right now, and your main.]',
        image: '/casual/now-playing.jpg',
      },
    ],
    hobbies: [
      { slug: 'hobby-1', title: '[Hobby]', detail: '[What you love about it.]', image: '/casual/hobby-1.jpg' },
      { slug: 'hobby-2', title: '[Hobby]', detail: '[What you love about it.]', image: '/casual/hobby-2.jpg' },
      { slug: 'hobby-3', title: '[Hobby]', detail: '[What you love about it.]', image: '/casual/hobby-3.jpg' },
    ],
    life: [
      { slug: 'home', title: '[Home]', detail: '[Where you are based, in a line.]', image: '/casual/home.jpg' },
      { slug: 'cares', title: '[Something you care about]', detail: '[Why it matters to you.]', image: '/casual/cares.jpg' },
      { slug: 'currently', title: '[Currently]', detail: '[Reading, learning or planning.]', image: '/casual/currently.jpg' },
    ],
  },

  contact: {
    title: 'Contact',
    openTo:
      'Open to AI and automation engineering, solutions engineering and technical lead roles. Remote or [location].',
    email: 'michaellagonzales.owo@gmail.com',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed. Select the address instead.',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/michaella-gonzales-203626296' },
      { label: 'GitHub', href: '[link]' },
    ],
    cv,
  },

  footer: `© ${new Date().getFullYear()} Michaella Gonzales`,
}
