import type { Content } from './types'

// All site copy. Components read from here; edit text, numbers and links in this file.
// [Square brackets] mark placeholders. `npm run placeholders` lists the ones left.

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
        claim: 'Writes code that lasts',
        evidence:
          '25+ code reviews and 10+ refactors at YOU_SOURCE that cut technical debt by up to 32%; introduced TDD and faster CI feedback',
        href: '#exp-yousource',
      },
      {
        claim: 'Builds secure, tested full-stack apps',
        evidence:
          'yours-db: Postgres row-level security with automated database tests, triggers that validate every row against its column types, and CI on GitHub Actions',
        href: '#personal-projects',
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
        claim: 'Connects AI to the tools a company already uses',
        evidence:
          'n8n workflows wired into Microsoft Graph, SharePoint, Outlook, Notion and Baserow, with Claude and Perplexity doing the research and writing',
        href: '#automations',
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
          "Wrote and designed a 10-module AI leadership course and a KNIME course for finance teams, and delivered the KNIME training; ran onboarding and built the team's central documentation and tracking",
        href: '#leadership',
      },
      {
        claim: 'Earns trust with clients and audiences',
        evidence:
          'Worked directly with clients in South Africa; picked as 1 of 50 Samsung campus ambassadors from 4,000+ applicants, then ranked Top 6 nationwide',
        href: '#lead-samsung',
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
          chip: '4 firms, 26 offices',
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
          chip: 'Weekly',
        },
        {
          text: 'Wrote and designed a 10-module AI leadership course, from AI fundamentals to risk, governance and adoption',
          chip: '10 modules',
        },
        {
          text: 'Wrote and delivered a KNIME course that teaches finance and accounting teams to build auditable, no-code data workflows',
        },
        {
          text: 'Ran onboarding and set up central tracking and documentation',
          chip: '3 new hires',
        },
      ],
      meta: {
        label: 'Built with',
        text: 'n8n, KNIME, Microsoft Graph, SharePoint, Microsoft Entra ID, Azure AI Foundry, Claude, OpenAI and Perplexity APIs, Notion, Baserow, Supabase, Google Cloud Platform',
      },
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
          text: 'Moved the backend from Django to Node.js and TypeScript, and connected WhatsApp Business, SMS, Postmark email and PDF invoicing',
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
      meta: {
        label: 'Built with',
        text: 'Node.js, TypeScript, Express, Prisma, PostgreSQL, Next.js, React, Material UI, Redux Toolkit, GraphQL (Apollo), Jest, Docker, Google Cloud (App Engine, Cloud Build), Sentry',
      },
    },
    {
      id: 'exp-ys-training-bot',
      tab: 'YS Training Bot',
      region: { name: 'Internal tool, not public', abbr: 'Internal' },
      thumbnail: '/experience/ys-training-bot.webp',
      org: 'YS Training Bot (YS-AI)',
      role: 'AI training app, built at YOU_SOURCE Inc.',
      dates: 'Dec 2023 to Jul 2025',
      location: 'Internal tool',
      bullets: [
        {
          text: "An AI-powered assistant that trains engineers on the company's coding standards and its clients' needs, through a set of training modules",
        },
        {
          text: 'Runs oral examinations with a voice AI interviewer: speech-to-text for answers, text-to-speech for questions',
        },
        {
          text: 'The interviewer persona is defined in a YAML file, and SSML shapes how it speaks',
        },
        {
          text: 'Sign-in with company Google accounts',
        },
      ],
      meta: { label: 'Built with', text: 'Azure AI Speech, Google Cloud Text-to-Speech, YAML, SSML, Google sign-in' },
    },
    {
      id: 'exp-hosting',
      tab: 'Freelance Host & Shoutcaster',
      region: { name: 'Asia-Pacific', abbr: 'APAC' },
      href: 'https://sites.google.com/view/mochii-does-things/portfolio',
      thumbnail: '/experience/hosting.webp',
      org: 'Freelance Host & Shoutcaster',
      role: 'Esports and tech events',
      dates: 'Mar 2021 to present',
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
          {
            text: 'Wrote and designed a 10-module AI leadership course for executives, covering responsible use, governance and adoption',
            kind: 'Initiative',
          },
          {
            text: 'Wrote and delivered KNIME training for finance and accounting teams, replacing fragile spreadsheets with workflows a reviewer can follow',
            kind: 'Initiative',
          },
          {
            text: "Onboarded new team members on tools, workflows, AI best practices and company standards; set up the team's central tracking and documentation",
            kind: 'Initiative',
            chip: '3 new hires',
          },
          {
            text: 'Mapped workflows and shared what I learned, so the team builds automations the same way',
            kind: 'Initiative',
          },
          { text: 'Introduced n8n automation to marketing and finance firms across Europe', chip: '4 firms' },
        ],
      },
      {
        id: 'lead-yousource',
        heading: 'YOU_SOURCE Inc.',
        period: 'Dec 2023 to Jul 2025',
        items: [
          { text: 'Introduced test-driven development on Pine Connector, raising coverage from 36% to 78%', kind: 'Initiative' },
          { text: 'Built YS-AI, a 6-module AI training app, to get colleagues comfortable with AI', kind: 'Initiative', chip: '60+ employees' },
          { text: 'Benchmarked LLMs for YS-LLM, the internal coding assistant, and supported its pilot', chip: '50+ engineers' },
          {
            text: 'Led code review and project management initiatives: 25+ reviews and 10+ refactors that cut technical debt by up to 32%',
            kind: 'Initiative',
          },
          {
            text: 'Worked directly with clients in South Africa on sprints and stakeholder alignment, delivering a 6-month roadmap in 4 months',
          },
        ],
      },
      {
        id: 'lead-samsung',
        heading: 'Samsung Galaxy Campus Program',
        period: 'Dec 2023 to Jun 2025',
        items: [
          {
            text: 'Selected as a campus ambassador from 4,000+ applicants nationwide, representing FEU Institute of Technology',
            chip: '1 of 50',
          },
          {
            text: 'Named a Top 6 Ambassador nationwide for tech content, earning a brand immersion trip to South Korea',
            chip: 'Top 6',
          },
        ],
      },
      {
        id: 'lead-student',
        heading: 'Student leadership',
        period: 'Elementary school to 2024',
        items: [
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
          {
            text: 'Interviewed players and delivered play-by-play and colour commentary, working with production teams on the flow of each show',
          },
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
      title: 'Bios for 600+ people, automatically written in days instead of manually over years',
      problem:
        '26 offices across Europe needed consistent staff bios. Writing them by hand was slow and the quality varied by office.',
      role: 'Designed and built the full workflow in n8n.',
      built: [
        'Detect new employees from a SharePoint list through Microsoft Graph, and research each one on the web with Perplexity',
        'Validate and clean the inputs in a Baserow working database',
        'Draft each bio with Claude to a house style',
        'Email the draft and guidelines to the employee through Microsoft Graph for approval or edits',
        'Publish only approved bios',
      ],
      decisions:
        'A human approves every bio before it goes live, because a wrong fact on a public profile costs more than the time saved. Validation runs before drafting, so bad data never reaches the model.',
      result: '600+ bios drafted across 26 offices, each signed off by its owner.',
    },
    {
      id: 'case-assistant',
      title: 'Choosing the right model for the job',
      problem: 'The company wanted an AI coding assistant but had no basis for choosing a model.',
      role: "Researched and benchmarked models; contributed to the assistant's build.",
      built:
        'A comparison of GPT, Claude and DeepSeek across code generation, refactoring, task planning, test creation and documentation, then the internal tool itself, piloted with 50+ engineers.',
      decisions:
        'No single model wins every task, and that has held across everything I have built since. I match the model to the job: Perplexity for web research, Claude for drafting and long-form writing, and a benchmark before committing a team to any one of them.',
      result: 'Engineers reported an estimated 25 to 35% gain in task efficiency during the pilot.',
      resultNote: 'Self-reported',
    },
    {
      id: 'case-executives',
      title: 'Making AI usable for executives (Bloch.ai)',
      problem:
        'Leaders were expected to use and approve AI tools without a working understanding of them, and needed to track EU legislation without reading it all.',
      role: 'Wrote and designed the training, and built the automation.',
      built: [
        'A 10-module AI leadership course: AI fundamentals and myths, why generative AI behaves the way it does, prompts and workflows, reliability, risk and responsible use, research, decision-making, communication, governance and adoption',
        'A governance module leaders can apply on Monday: responsible-AI principles, a three-tier policy (acceptable, conditional, prohibited), a four-question risk check and an approval workflow, with GDPR and CCPA in view',
        'An n8n workflow that reads EUR-Lex and EU RSS feeds, filters new legislation by week and sector, summarises it with an LLM and emails executives every week',
      ],
      decisions:
        'Taught AI as augmentation, not replacement, so the conversation is about capability rather than job loss. Every task is sorted before use into great fit, fit with verification, or not suitable, by asking what happens if the AI is wrong, how easy the output is to check, and who is accountable. People keep the final decision. Adoption is measured by outcomes (time saved, quality, risk reduced), not by logins.',
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
      stack: ['JavaScript', 'Three.js', 'Supabase'],
      href: 'https://spirit-our-comfort.vercel.app',
      thumbnail: '/projects/spirit.webp',
    },
    {
      slug: 'yours-db',
      title: 'yours-db',
      status: 'Live',
      description:
        'A personal database. Build sheets with typed columns (text, number, date, choices, checkboxes, links), then search, tick off and bulk-edit rows.',
      stack: ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Vitest', 'GitHub Actions'],
      href: 'https://yours-db.vercel.app',
      thumbnail: '/projects/yours-db.webp',
    },
    {
      slug: 'photo-bot',
      title: 'Photo Bot',
      status: 'Live',
      description: 'A virtual photobooth. Take photos with your webcam, add digital effects, and save them.',
      stack: ['React', 'Tailwind', 'Framer Motion', 'react-webcam', 'html-to-image'],
      href: 'https://photo-bot-kappa.vercel.app',
      thumbnail: '/projects/photo-bot.webp',
    },
    {
      slug: 'tomorrow',
      title: 'tomorrow',
      status: 'In development',
      description: 'A daily planner where a cat companion of your choice keeps you company through your tasks.',
      stack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'Expo Notifications'],
      href: '[deployed link]',
      thumbnail: '/projects/tomorrow.webp',
    },
    {
      slug: 'pastel-affirmations',
      title: 'Pastel Affirmations',
      status: 'Desktop app',
      description:
        'An always-on-top pixel-art widget that shows a fresh affirmation on demand and saves your favourites.',
      stack: ['Electron', 'Node.js', 'Express', 'affirmations.dev API'],
      href: '[deployed link or download page]',
      thumbnail: '/projects/pastel-affirmations.webp',
    },
    {
      slug: 'viso',
      title: 'Viso',
      status: 'Live',
      description:
        'Ten live-camera filters, from edge detection to optical flow and point clouds, each taken apart layer by layer to show how it works.',
      stack: ['JavaScript', 'Canvas 2D', 'Three.js', 'getUserMedia'],
      href: 'https://viso-case-study.vercel.app/index.html',
      thumbnail: '/projects/viso.webp',
    },
  ],

  automations: [
    {
      slug: 'bio-generator',
      title: 'Staff bio generator',
      scale: '26 offices, 600+ employees',
      nodes: ['New hire in SharePoint', 'Web research', 'AI draft', 'Email for approval', 'Publish'],
      description:
        'Spots new employees in SharePoint, researches each one, drafts a bio with Claude, and emails it to them to approve before anything is published.',
      stack: ['n8n', 'Microsoft Graph', 'SharePoint', 'Perplexity', 'Claude', 'Baserow'],
      link: { kind: 'case', caseId: 'case-bios' },
    },
    {
      slug: 'eu-digest',
      title: 'EU legislation digest',
      scale: 'Weekly',
      nodes: ['EU RSS feeds', 'Filter by week and sector', 'AI summary', 'Weekly email'],
      description: 'Reads EUR-Lex and EU RSS feeds, keeps what is new for each sector, and emails executives a weekly AI-written briefing.',
      stack: ['n8n', 'EUR-Lex RSS', 'LLM API', 'Email'],
      link: { kind: 'case', caseId: 'case-executives' },
    },
    {
      slug: 'n8n-rollout',
      title: 'n8n rollout',
      scale: '4 firms, 26 offices',
      nodes: ['Audit', 'Build', 'Train', 'Hand over'],
      description: 'Introduced n8n automation to marketing and finance firms across Europe.',
      stack: ['n8n', 'Microsoft Graph', 'SharePoint', 'Baserow', 'Notion'],
      link: null,
    },
    {
      slug: 'social-research',
      title: 'Social media research and posters',
      scale: 'Content pipeline',
      nodes: ['RSS feeds', 'Research', 'AI writes', 'Render poster', 'Log to Notion'],
      description:
        'Picks topics from RSS feeds, researches them with Perplexity, has Claude write the post and poster copy, renders the poster as an image and logs it all in Notion.',
      stack: ['n8n', 'Perplexity', 'Claude API', 'HTML/CSS to Image', 'Notion'],
      link: null,
    },
    {
      slug: 'bob',
      title: 'Bob (contributor)',
      scale: 'Under development',
      nodes: ['Request', 'Agent', 'API integrations', 'Response'],
      description: "Bloch.ai's agentic AI platform. I worked on API integrations, platform connections and UI.",
      stack: ['Classified'],
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
      {
        area: 'AI & automation',
        tools:
          'n8n, KNIME, OpenAI, Claude, Perplexity, Gemini and DeepSeek APIs, Azure AI Foundry, Azure AI Speech, agentic workflows, prompt design, LLM evaluation, AI-assisted development (Expert, Crossover assessment)',
      },
      {
        area: 'Integrations',
        tools: 'Microsoft Graph (SharePoint, Outlook), Notion, Baserow, WhatsApp Business, Postmark, OAuth2, RSS',
      },
      {
        area: 'Backend',
        tools: 'Node.js, TypeScript, Express, Python (Django, Django REST Framework), Prisma, PostgreSQL, REST and GraphQL APIs, PHP',
      },
      {
        area: 'Frontend & mobile',
        tools: 'JavaScript, TypeScript, React, Next.js, Redux Toolkit, Material UI, Tailwind, Three.js, React Native, Expo, Electron, Flutter',
      },
      {
        area: 'Cloud & data',
        tools: 'Google Cloud (App Engine, Cloud Build, Storage), Supabase (row-level security, SQL functions, realtime), Firebase, Microsoft Entra ID, Vercel',
      },
      { area: 'Delivery', tools: 'Docker, CI/CD (GitHub Actions, Cloud Build), TDD, Jest, Vitest, Sentry, Azure DevOps, Jira' },
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
      { slug: 'gaming', title: 'Video games', detail: 'When work gets stressful, I play League of Legends and Valorant to get even more stressed :D', image: '/casual/gaming.webp' },
      { slug: 'cosplay', title: 'Cosplay', detail: 'I love dressing up as my favourite characters and bringing them to life, with the craftsmanship to make them accurate.', image: '/casual/cosplay.webp' },
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
        detail:
          'Plastic, twine or stainless steel: whatever the material, all you need is a delusional vision and the drive to make it.',
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
      'AI and automation engineering, solutions engineering and technical lead roles, remotely.',
    email: 'michaellagonzales.owo@gmail.com',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed. Select the address instead.',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/michaella-gonzales-203626296' },
      { label: 'GitHub', href: 'https://github.com/mochiicakes' },
    ],
  },

  footer: `© ${new Date().getFullYear()} Michaella Gonzales`,
}
