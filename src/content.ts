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
    hint: 'Click and drag to paint, or drag a finger across the paper.',
    skip: 'Enter',
  },

  hero: {
    name: 'Michaella Gonzales',
    firstName: 'Michaella',
    lastName: 'Gonzales',
    // M-I-C-H-[A]-[E]-L-L-A: she stands in front of the A and the E.
    coverLetters: [4, 5],
    portrait: {
      src: '/hero/michaella.webp',
      alt: 'Illustrated portrait of Michaella in a white tee and black flared jeans',
      width: 543,
      height: 1516,
    },
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

  // The card fan. Recruiter mode deals the projects; casual mode deals Gaming and Hobbies.
  fan: { ring: 'Michaella Gonzales', recruiterGroup: 'Personal Projects' },

  modes: { label: 'View', recruiter: 'Recruiter', casual: 'Casual' },

  worlds: {
    recruiter: {
      title: 'Around Tech',
      intro: 'What I have shipped, for whom, and how it held up.',
      projectsIntro: 'Things I build on my own time. Turn the cards.',
      tabsTitle: 'Impact',
      tabs: [
        { id: 'proof', label: 'Proof' },
        { id: 'leadership', label: 'Leadership' },
        { id: 'cases', label: 'Case studies' },
        { id: 'how-i-work', label: 'How I work' },
      ],
    },
    casual: {
      title: 'Out of Tech',
      intro: 'The rest of me: the stage, the games, and the things I make. Turn the cards.',
      tabs: [
        { id: 'gaming', label: 'Gaming' },
        { id: 'hobbies', label: 'Hobbies' },
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
        href: '#leadership',
      },
      {
        claim: 'Holds up under pressure',
        evidence: '80+ live events hosted for Samsung, Predator Gaming, Mineski, UAAP and others',
        href: '#exp-hosting',
      },
    ],
  },

  // Screenshots: public/experience/<name>.webp, landscape 1600 × 1000, named as in `thumbnail`.
  experience: [
    {
      id: 'exp-bloch',
      tab: 'Bloch.ai',
      region: { name: 'United Kingdom', abbr: 'UK' },
      href: 'https://www.bloch.ai',
      thumbnail: '/experience/bloch.webp',
      org: 'Bloch.ai',
      role: 'Automation Specialist & Consultant',
      dates: 'Oct 2025 to present',
      location: 'United Kingdom',
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
      tab: 'YOU_SOURCE Inc. (Yebo Fresh)',
      region: { name: 'South Africa', abbr: 'ZA' },
      href: 'https://www.yebofresh.co.za',
      thumbnail: '/experience/yousource.webp',
      org: 'YOU_SOURCE Inc.',
      role: 'Full-stack Software Engineer',
      dates: 'Dec 2023 to Jul 2025',
      location: 'Yebo Fresh, South Africa',
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
      tab: 'Freelance Host & Shoutcaster',
      region: { name: 'Asia-Pacific', abbr: 'APAC' },
      href: 'https://sites.google.com/view/mochii-does-things/portfolio',
      thumbnail: '/experience/hosting.webp',
      org: 'Freelance Host & Shoutcaster',
      role: 'Esports and tech events',
      dates: 'Jan 2021 to present',
      location: 'Asia-Pacific',
      bullets: [
        {
          text: 'Hosted and cast live events for Samsung, Predator Gaming, Mineski, TNC, UAAP, VCT and CFS',
          chip: '80+ events',
        },
      ],
    },
  ],

  // Intro video on YouTube: the id is the part after watch?v= in its link.
  introVideo: {
    youtubeId: 'oSlaD3GcM9k',
    title: 'Introduction from Michaella',
    caption: 'A quick hello, and what I can do for your team (COMING SOON).',
  },

  sections: {
    experience: {
      title: 'Experience',
      intro: 'Where I have worked, what I shipped there, and where I studied.',
    },
    automations: {
      title: 'Automations',
      intro: 'The real systems are confidential, so each card shows the workflow instead of a screenshot.',
    },
  },

  leadership: {
    intro:
      'I have been a student leader since elementary school. As a professional I want to keep making that kind of impact: I see a gap, put my hand up, and bring people along.',
    groups: [
      {
        id: 'lead-bloch',
        heading: 'Bloch.ai',
        period: 'Oct 2025 to present',
        items: [
          { text: 'Wrote AI leadership training for executives on safe usage and core concepts', kind: 'Initiative', chip: '[n] leaders' },
          { text: "Ran onboarding and set up the team's central tracking and documentation", kind: 'Initiative', chip: '[n] new hires' },
          { text: 'Introduced n8n automation to marketing and finance firms across Europe', chip: '[n] firms' },
        ],
      },
      {
        id: 'lead-yousource',
        heading: 'YOU_SOURCE Inc.',
        period: 'Dec 2023 to Jun 2025',
        items: [
          { text: 'Introduced test-driven development on Pine Connector, raising coverage from 36% to 78%', kind: 'Initiative' },
          { text: 'Built YS-AI, a 6-module AI training app, to get colleagues comfortable with AI', kind: 'Initiative', chip: '60+ employees' },
          { text: 'Benchmarked LLMs for YS-LLM, the internal coding assistant, and supported its pilot', chip: '50+ engineers' },
        ],
      },
      {
        id: 'lead-student',
        heading: 'Student leadership',
        period: 'Elementary school to 2024',
        items: [
          { text: '[Elementary school role, school]', kind: 'Volunteer' },
          { text: '[High school role, school]', kind: 'Volunteer' },
          {
            text: 'President, iTamaraws Esports Club: grew membership from 70+ to 280+ and the officer team from 18 to 60+; secured full accreditation',
            kind: 'Volunteer',
          },
          { text: 'Director for Membership, ACM Student Chapter: grew active membership 36% to 470+', kind: 'Volunteer' },
          {
            text: 'Director for Publications, ACM Student Chapter: chapter named Best Student Organization of the Year',
            kind: 'Volunteer',
          },
          { text: 'Outstanding Leadership Award' },
        ],
      },
      {
        id: 'lead-community',
        heading: 'Community',
        period: '2021 to present',
        items: [
          { text: 'Hosted and cast esports and tech events for the community', chip: '80+ events' },
          { text: '[Other volunteer work]', kind: 'Volunteer' },
        ],
      },
    ],
  },

  background: {
    heading: 'Education',
    tab: 'Education',
    region: { name: 'Philippines', abbr: 'PH' },
    degree:
      'B.S. Computer Science, Software Engineering, FEU Institute of Technology, 2020 to 2024. Cum Laude, GPA 3.5/4.0.',
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

  // Live projects first. Card art: public/projects/<slug>.webp, portrait 660 × 900 (the fan's card shape).
  projects: [
    {
      slug: 'spirit',
      title: 'Spirit',
      status: 'Live',
      description:
        'An anonymous sky of glowing orbs where people leave a thought, feeling or confession for others to find, with mental-health resources built in.',
      stack: ['[confirm stack]'],
      href: 'https://spirit-our-comfort.vercel.app',
      thumbnail: '/projects/spirit.webp',
    },
    {
      slug: 'yours-db',
      title: 'yours-db',
      status: 'Live',
      description:
        'A personal database. Build sheets with typed columns (text, number, date, choices, checkboxes, links), then search, tick off and bulk-edit rows.',
      stack: ['React', 'TypeScript', 'Vite', 'Supabase'],
      href: 'https://yours-db.vercel.app',
      thumbnail: '/projects/yours-db.webp',
    },
    {
      slug: 'photo-bot',
      title: 'Photo Bot',
      status: 'Live',
      description: 'A virtual photobooth. Take photos, edit them with digital effects, and send them by email.',
      stack: ['React', 'Fabric.js', 'Tailwind', 'EmailJS'],
      href: 'https://photo-bot-kappa.vercel.app',
      thumbnail: '/projects/photo-bot.webp',
    },
    {
      slug: 'tomorrow',
      title: 'tomorrow',
      status: 'In development',
      description: 'A daily planner where a cat companion of your choice keeps you company through your tasks.',
      stack: ['React Native', 'Expo', 'TypeScript', 'SQL'],
      href: '[deployed link]',
      thumbnail: '/projects/tomorrow.webp',
    },
    {
      slug: 'pastel-affirmations',
      title: 'Pastel Affirmations',
      status: 'Desktop app',
      description:
        'An always-on-top pixel-art widget that shows a fresh affirmation on demand and saves your favourites.',
      stack: ['Electron', 'React', 'Express', 'Node.js'],
      href: '[deployed link or download page]',
      thumbnail: '/projects/pastel-affirmations.webp',
    },
    {
      slug: 'motion-field',
      title: 'Motion Field',
      status: 'In development',
      description: 'A particle field that follows your movement through the webcam, entirely in the browser.',
      stack: ['JavaScript', 'Canvas', 'WebRTC'],
      href: '[deployed link]',
      thumbnail: '/projects/motion-field.webp',
    },
  ],

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
    visitSite: 'Visit site',
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

  // Casual mode ("Out of Tech"): one card per moment. Photos: public/casual/<slug>.webp, portrait 660 × 900.
  casual: {
    gaming: [
      {
        slug: 'shoutcasting',
        title: 'On the mic',
        when: '2021 to now',
        detail: 'Hosted and cast 80+ live events for Samsung, Predator Gaming, Mineski, TNC, UAAP, VCT and CFS.',
        image: '/casual/shoutcasting.webp',
      },
      { slug: 'gaming', title: 'Video games', detail: '[What you play to unwind.]', image: '/casual/gaming.webp' },
      { slug: 'cosplay', title: 'Cosplay', detail: '[Characters you have made, or are making next.]', image: '/casual/cosplay.webp' },
    ],
    hobbies: [
      {
        slug: 'bioactive',
        title: 'Bioactive keeping',
        detail: 'A shelf of terrariums and planted tanks that look after themselves, with a cat who supervises.',
        image: '/casual/bioactive.webp',
      },
      {
        slug: 'jewelry',
        title: 'Jewelry making',
        detail: '[What you make, and the piece you are proudest of.]',
        image: '/casual/jewelry.webp',
      },
      {
        slug: 'crochet',
        title: 'Crochet',
        detail: "Finally finished crocheting my very own Owlbear, the stuffed toy from Baldur's Gate 3.",
        image: '/casual/crochet.webp',
      },
      {
        slug: 'development',
        title: 'Development',
        detail: 'Side projects after hours, down to drawing the pixel cat for tomorrow by hand.',
        image: '/casual/development.webp',
      },
      {
        slug: 'painting',
        title: 'Painting',
        detail: 'Watercolour in between meetings: peonies, a peach, a sky full of cats and stars, water lilies.',
        image: '/casual/painting.webp',
      },
      {
        slug: 'reading',
        title: 'Reading',
        detail: 'Currently: Essentialism by Greg McKeown, on the disciplined pursuit of less.',
        image: '/casual/reading.webp',
      },
    ],
  },

  contact: {
    title: 'Contact',
    note: {
      hello: "Hello, I'm",
      name: 'Michaella',
      am: "and I'm an",
      role: 'AI & automation engineer',
      open: "I'm open to",
      write: 'Write to me at',
    },
    // Add the photo at public/contact/selfie.webp (portrait 4:5, 800 × 1000).
    selfie: {
      src: '/contact/selfie.webp',
      alt: 'Selfie of Michaella with dark, teal-tipped hair and a silver star earring',
      caption: 'Say hi!',
    },
    openTo:
      'AI and automation engineering, solutions engineering and technical lead roles. Remote or [location].',
    email: 'michaellagonzales.owo@gmail.com',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed. Select the address instead.',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/michaella-gonzales-203626296' },
      { label: 'GitHub', href: 'https://github.com/mochiicakes' },
    ],
    cv,
  },

  footer: `© ${new Date().getFullYear()} Michaella Gonzales`,
}
