import type { Content } from './types'

// All site copy. Components read from here; edit text, numbers and links in this file.
// [Square brackets] mark placeholders. `npm run placeholders` lists the ones left.

export const content: Content = {
  meta: {
    title: 'Michaella Gonzales, AI & automation engineer',
    description:
      'Software engineer building AI automations and integrations for whole organizations. I also train the people who use them.',
  },

  gate: {
    prompt: 'Light the water',
    hint: 'Click and drag to light it up, or drag a finger across the dark.',
    skip: 'Enter',
  },

  hero: {
    name: 'Michaella Gonzales',
    firstName: 'Michaella',
    lastName: 'Gonzales',
    more: 'See my work',
    portrait: {
      src: '/hero/michaella.webp',
      alt: 'Illustrated portrait of Michaella in a white tee and black flared jeans',
      width: 543,
      height: 1516,
    },
    role: 'AI & automation engineer',
    primaryCta: { label: 'Get in touch', href: '#contact' },
    // Casual mode only. Thumbnails: public/drip/<id>.webp, square, about 240 × 240.
    drip: {
      label: 'Cop my drip?',
      close: 'Hide the drip',
      heading: 'What I am wearing',
      labels: { from: 'from', get: 'get it', shop: 'Shop', none: 'One of one' },
      items: [
        {
          id: 'piercings',
          name: 'Stainless steel sparkle piercings',
          kind: 'Piercings',
          where: 'Custom by me',
          thumb: '/drip/piercings.webp',
          dot: { x: 50, y: 12.2 },
          card: { side: 'left', y: 10, fit: 'above' },
        },
        {
          id: 'necklace',
          name: 'Vnox layered stainless steel necklace',
          kind: 'Necklace',
          where: 'Shopee',
          href: 'https://s.shopee.ph/4VeLBekcUq',
          thumb: '/drip/necklace.webp',
          dot: { x: 61, y: 21.2 },
          card: { side: 'right', y: 13, fit: 'above' },
        },
        {
          id: 'shirt',
          name: 'White short-sleeve turtleneck',
          kind: 'Top',
          where: 'Shopee',
          href: 'https://s.shopee.ph/3LSNnJcAkL',
          thumb: '/drip/shirt.webp',
          dot: { x: 46, y: 29 },
          card: { side: 'left', y: 60 },
        },
        {
          id: 'pants',
          name: 'Flared, relaxed black denim',
          kind: 'Bottoms',
          where: 'TikTok Shop',
          href: 'https://vt.tiktok.com/ZS9f49GheacQE-lA0nR/',
          thumb: '/drip/pants.webp',
          dot: { x: 77, y: 59 },
          card: { side: 'right', y: 67, fit: 'below' },
        },
        {
          id: 'shoes',
          name: 'Converse Run Star Hike high-tops',
          kind: 'Shoes',
          where: 'Farfetch',
          href: 'https://www.farfetch.com/ph/shopping/men/converse-run-star-hike-high-top-sneakers-item-14997354.aspx',
          thumb: '/drip/shoes.webp',
          dot: { x: 14, y: 97 },
          card: { side: 'left', y: 88 },
        },
      ],
    },
  },

  tagline: {
    line1: 'Always on the move.',
    line2: 'Your goal, I follow.',
    supporting:
      'Software engineer building AI automations and integrations for whole organizations. I also train the people who use them.',
  },

  // The card fan. Recruiter mode deals the projects; casual mode deals Gaming and Hobbies.
  fan: { recruiterGroup: 'Personal Projects' },

  modes: { label: 'View', recruiter: 'Recruiter', casual: 'Casual' },

  worlds: {
    recruiter: {
      title: 'Around Tech',
      intro: 'All about me in the industry. Ship it! (iykyk)',
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
      intro: 'Hobby hoarding and my career in gaming.',
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
          'Finished a 6 month admin portal roadmap in just 4 months as a full-stack engineer at YOU_SOURCE, and also raised unit test coverage from 36% to 78% in 5 months',
        href: '#exp-yousource',
      },
      {
        claim: 'Keeps a codebase healthy',
        evidence:
          'My 25+ code reviews and 10+ refactors at YOU_SOURCE cut technical debt by up to 32%. I also introduced TDD and faster CI feedback',
        href: '#exp-yousource',
      },
      {
        claim: 'Builds secure, tested full-stack apps',
        evidence:
          'I used Postgres row-level security in yours-db and backed it with automated database tests. Triggers check every row against its column types, and CI runs on GitHub Actions',
        href: '#personal-projects',
      },
      {
        claim: 'Knows which AI fits which job',
        evidence:
          "I benchmarked GPT, Claude and DeepSeek on 5 engineering tasks for an internal coding assistant, and built API integrations for Bob, Bloch.ai's agentic platform",
        href: '#case-assistant',
      },
      {
        claim: 'Has rolled out automation across many offices',
        evidence:
          'My n8n bio generator is used across 26 offices and 600+ employees. It scrapes and validates the info, has AI draft the bio, then emails it for a human to approve',
        href: '#case-bios',
      },
      {
        claim: 'Connects AI to the tools a company already uses',
        evidence:
          'My n8n workflows connect to Microsoft Graph, SharePoint, Outlook, Notion and Baserow, and Claude and Perplexity do the research and writing',
        href: '#automations',
      },
      {
        claim: 'Builds tools leaders can rely on',
        evidence:
          'Every AI-drafted bio needs a human to approve it before it gets sent, and executives get my digest on EU legislation every week',
        href: '#case-executives',
      },
      {
        claim: 'Trains other people',
        evidence:
          "I wrote and designed two courses: 10 modules on AI leadership, and KNIME for finance teams, which I also delivered. I ran onboarding too, and built our team's central documentation and tracking",
        href: '#leadership',
      },
      {
        claim: 'Works well with clients and audiences',
        evidence:
          'I worked directly with clients in South Africa. Samsung picked me as 1 of 50 campus ambassadors from 4,000+ applicants, and I then ranked Top 6 nationwide',
        href: '#lead-samsung',
      },
      {
        claim: 'Can handle a live audience',
        evidence: 'I have hosted 80+ live events for Samsung, Predator Gaming, Mineski, UAAP and others',
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
          text: 'Part of the team that introduced n8n automation to marketing and finance firms across Europe',
          chip: '4 firms, 26 offices',
        },
        {
          text: 'Built a bio generator that scrapes the web for info, validates it, and has AI write the draft, which then gets emailed for a human to approve',
          chip: '26 offices, 600+ employees',
        },
        {
          text: "Worked on API integrations, platform connections and UI for Bob, Bloch.ai's agentic AI platform",
          link: { label: 'bob.bloch.ai', href: 'https://bob.bloch.ai' },
        },
        {
          text: 'Automated a digest that summarises new EU legislation for executives',
          chip: 'Weekly',
        },
        {
          text: 'Wrote and designed a 10-module AI leadership course on AI fundamentals, risk, governance and adoption',
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
          text: 'Delivered the 6 month roadmap of the Yebo Fresh admin and delivery portal in just 4 months, and also increased performance of our REST APIs, database and UI by 25%',
        },
        {
          text: 'Switched the backend from Django to Node.js with TypeScript, and also integrated WhatsApp Business, SMS, Postmark email and PDF invoicing',
        },
        {
          text: 'Raised unit test coverage on Pine Connector from 36% to 78% in 5 months, and introduced TDD in the process',
        },
        {
          text: 'Built YS-AI, a 6-module AI training web app with 92%+ satisfaction, and cut deployment time by 37% with Docker and YAML config',
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
          text: "An AI assistant that trains engineers on the company's coding standards and its clients' needs through a set of modules",
        },
        {
          text: 'Runs oral exams with a voice AI interviewer that asks questions with text-to-speech and takes answers with speech-to-text',
        },
        {
          text: 'The interviewer persona comes from a YAML file, and SSML sets how it speaks',
        },
        {
          text: 'Engineers log in using their company Google account',
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
          text: 'Hosted and cast live events for Samsung, Predator Gaming, Mineski, TNC, UAAP, VCT and CFS, in front of hundreds to thousands of people',
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
      intro: 'Where I have worked and studied, and what I shipped.',
    },
    automations: {
      title: 'Automations',
      intro: 'The real systems are confidential, so each card shows the workflow instead of a screenshot.',
    },
  },

  leadership: {
    intro:
      'I have been a student leader since elementary school, and I want to keep making that kind of impact as a professional. When I see a gap, I put my hand up and bring people along.',
    // The marks before a title, spelled out in the legend.
    kinds: { initiative: 'My own initiative', volunteer: 'Volunteer' },
    groups: [
      {
        id: 'lead-bloch',
        heading: 'Bloch.ai',
        period: 'Oct 2025 to present',
        items: [
          {
            title: 'AI leadership course',
            chip: '10 modules',
            text: 'Wrote and designed this for executives. It covers responsible use, governance and adoption',
            kind: 'initiative',
          },
          {
            title: 'KNIME training',
            text: 'Wrote and delivered it for finance and accounting teams, replacing fragile spreadsheets with workflows a reviewer can follow',
            kind: 'initiative',
          },
          {
            title: 'Team onboarding',
            chip: '3 new hires',
            text: "Taught them our tools, workflows, AI best practices and standards, and set up the team's central tracking and documentation",
            kind: 'initiative',
          },
          {
            title: 'Shared workflows',
            text: 'Mapped out our workflows and shared what I learned, so the whole team builds automations the same way',
            kind: 'initiative',
          },
          {
            title: 'n8n rollout',
            chip: '4 firms',
            text: 'Part of the team that introduced automation to marketing and finance firms across Europe',
          },
        ],
      },
      {
        id: 'lead-yousource',
        heading: 'YOU_SOURCE Inc.',
        period: 'Dec 2023 to Jul 2025',
        items: [
          {
            title: 'Test-driven development',
            chip: '36% to 78%',
            text: 'Introduced it on Pine Connector and raised coverage',
            kind: 'initiative',
          },
          {
            title: 'YS-AI training app',
            chip: '60+ employees',
            text: 'Built 6 modules with an AI conversational trainer, scoring and a leaderboard system, to get colleagues introduced and comfortable with AI',
            kind: 'initiative',
          },
          {
            title: 'YS-LLM pilot',
            chip: '50+ engineers',
            text: 'Benchmarked LLMs for our internal coding assistant, and also helped with its pilot',
          },
          {
            title: 'Code review',
            chip: 'Up to 32% less debt',
            text: 'Led review and project management initiatives, with 25+ reviews and 10+ refactors that cut technical debt',
            kind: 'initiative',
          },
          {
            title: 'Client delivery',
            chip: '6 months of work in 4',
            text: 'Worked directly with clients in South Africa on sprints, and kept stakeholders aligned to deliver the roadmap',
          },
        ],
      },
      {
        id: 'lead-student',
        heading: 'Student leadership',
        period: 'Elementary school to 2024',
        items: [
          {
            title: 'President, iTamaraws Esports Club',
            chip: '70+ to 300+ members',
            text: 'Grew the officer team from 18 to 70+ and secured full accreditation',
            kind: 'volunteer',
          },
          {
            title: 'Director for Membership, ACM Student Chapter',
            chip: '470+ members',
            text: 'Grew active membership 36%',
            kind: 'volunteer',
          },
          {
            title: 'Director for Publications, ACM Student Chapter',
            text: 'Chapter named Best Student Organization of the Year',
            kind: 'volunteer',
          },
          { title: 'Outstanding Leadership Award', text: 'College years well spent driving change' },
        ],
      },
      {
        id: 'lead-samsung',
        heading: 'Samsung Galaxy Campus Program',
        period: 'Dec 2023 to Jun 2025',
        items: [
          {
            title: 'Campus ambassador',
            chip: '1 of 50',
            text: 'Selected from 4,000+ applicants nationwide, representing FEU Institute of Technology',
          },
          {
            title: 'Tech content',
            chip: 'Top 6',
            text: 'Named a Top 6 Ambassador nationwide and earned a trip to South Korea',
          },
        ],
      },
      {
        id: 'lead-community',
        heading: 'Community',
        period: '2021 to present',
        items: [
          {
            title: 'Host and caster',
            chip: '80+ events',
            text: 'Hosted and cast esports and tech events for the community',
          },
          {
            title: 'Interviews and commentary',
            text: 'Interviewed players, gave play-by-play and colour commentary, and worked with production teams on the flow of each show',
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
    decisions: 'Decisions',
    result: 'Result',
  },

  caseStudies: [
    {
      id: 'case-bios',
      title: 'Bios for 600+ people, written automatically in days instead of by hand over years',
      problem:
        '26 offices across Europe needed consistent staff bios. Writing them by hand was slow and the quality varied by office.',
      role: 'I designed and built the full workflow in n8n.',
      built: [
        'Detect new employees from a SharePoint list through Microsoft Graph, and research each one on the web with Perplexity',
        'Validate and clean the inputs in a Baserow working database',
        'Draft each bio with Claude to a house style',
        'Email the draft and guidelines to the employee through Microsoft Graph for approval or edits',
        'Publish only approved bios',
      ],
      decisions:
        'A person approves every bio before it goes live, because a wrong fact on a public profile costs more than the time saved. Inputs are validated before drafting, so bad data never reaches the model.',
      result: '600+ bios drafted across 26 offices, each signed off by its owner.',
    },
    {
      id: 'case-assistant',
      title: 'Choosing the right model for the job',
      problem: 'The company wanted an AI coding assistant but had no basis for choosing a model.',
      role: "I researched and benchmarked the models, and contributed to the assistant's build.",
      built:
        'I compared GPT, Claude and DeepSeek on code generation, refactoring, task planning, test creation and documentation. Then came the internal tool itself, piloted with 50+ engineers.',
      decisions:
        'No single model wins every task, and I have found the same in everything I have built since. I use Perplexity for web research and Claude for drafting and long-form writing, and I benchmark before committing a team to any model.',
      result: 'Engineers reported an estimated 25 to 35% gain in task efficiency during the pilot.',
      resultNote: 'Self-reported',
    },
    {
      id: 'case-executives',
      title: 'Making AI usable for executives (Bloch.ai)',
      problem:
        'Leaders were expected to use and approve AI tools without a working understanding of them. They also had to track EU legislation without reading all of it.',
      role: 'I wrote and designed the training, and built the automation.',
      built: [
        'A 10-module AI leadership course: AI fundamentals and myths, why generative AI behaves the way it does, prompts and workflows, reliability, risk and responsible use, research, decision-making, communication, governance and adoption',
        'A governance module leaders can apply right away: responsible-AI principles, a three-tier policy (acceptable, conditional, prohibited), a four-question risk check and an approval workflow, with GDPR and CCPA in mind',
        'An n8n workflow that reads EUR-Lex and EU RSS feeds, filters new legislation by week and sector, summarises it with an LLM and emails executives every week',
      ],
      decisions:
        'I taught AI as a way to extend what people can do, which keeps the conversation off job loss. Every task is sorted before use into great fit, fit with verification, or not suitable. To sort one, people ask what happens if the AI is wrong, how easy the output is to check, and who is accountable. They keep the final decision. Adoption is measured by outcomes (time saved, quality, risk reduced), not by logins.',
    },
  ],

  // Live projects first. Card art: public/projects/<slug>.webp, portrait 660 × 900 (the fan's card shape).
  projects: [
    {
      slug: 'spirit',
      title: 'Spirit',
      status: 'Live',
      description:
        'An anonymous sky of glowing orbs where people leave a thought, feeling or confession for others to find. Mental-health resources are built in.',
      stack: ['JavaScript', 'Three.js', 'Supabase'],
      href: 'https://spirit-our-comfort.vercel.app',
      thumbnail: '/projects/spirit.webp',
    },
    {
      slug: 'yours-db',
      title: 'yours-db',
      status: 'Live',
      description:
        'A personal database where you build sheets with typed columns (text, number, date, choices, checkboxes, links), then search, tick off and bulk-edit rows.',
      stack: ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Vitest', 'GitHub Actions'],
      href: 'https://yours-db.vercel.app',
      thumbnail: '/projects/yours-db.webp',
    },
    {
      slug: 'tsuki-cam',
      title: 'Tsuki Cam',
      status: 'Live',
      description:
        'A moonlit photobooth that runs entirely in your browser. There is no server, so your photos stay on your device. Take a photo or upload one, light your face with a coloured screen light, frame it at 3:4, 1:1 or 4:3, then add filters, skin smoothing and brightening. There are pose ideas to try too.',
      stack: ['React', 'Tailwind', 'Framer Motion', 'react-webcam', 'html-to-image'],
      href: 'https://photo-bot-kappa.vercel.app',
      thumbnail: '/projects/tsuki-cam.webp',
    },
    {
      slug: 'tomorrow',
      title: 'tomorrow',
      status: 'In development',
      description: 'A daily planner where you pick a cat to keep you company while you do your tasks.',
      stack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'Expo Notifications'],
      href: '[deployed link]',
      thumbnail: '/projects/tomorrow.webp',
    },
    {
      slug: 'pastel-affirmations',
      title: 'Pastel Affirmations',
      status: 'Desktop app',
      description:
        'A pixel-art widget that stays on top of your other windows, shows a new affirmation when you ask and saves your favourites.',
      stack: ['Electron', 'Node.js', 'Express', 'affirmations.dev API'],
      href: '[deployed link or download page]',
      thumbnail: '/projects/pastel-affirmations.webp',
    },
    {
      slug: 'viso',
      title: 'Viso',
      status: 'Live',
      description:
        'Ten live-camera filters, including edge detection, optical flow and point clouds. Each is taken apart layer by layer to show how it works.',
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
        'Researches each new employee, drafts a bio with Claude and emails it to them to approve before publishing.',
      stack: ['n8n', 'Microsoft Graph', 'SharePoint', 'Perplexity', 'Claude', 'Baserow'],
      link: { kind: 'case', caseId: 'case-bios' },
    },
    {
      slug: 'eu-digest',
      title: 'EU legislation digest',
      scale: 'Weekly',
      nodes: ['EU RSS feeds', 'Filter by week and sector', 'AI summary', 'Weekly email'],
      description:
        'Reads EUR-Lex and EU RSS feeds, keeps what is new for each sector and emails executives a weekly AI briefing.',
      stack: ['n8n', 'EUR-Lex RSS', 'LLM API', 'Email'],
      link: { kind: 'case', caseId: 'case-executives' },
    },
    {
      slug: 'n8n-rollout',
      title: 'n8n rollout',
      scale: '4 firms, 26 offices',
      nodes: ['Audit', 'Build', 'Train', 'Hand over'],
      description:
        'I was part of the team that introduced n8n automation to marketing and finance firms across Europe.',
      stack: ['n8n', 'Microsoft Graph', 'SharePoint', 'Baserow', 'Notion'],
      link: null,
    },
    {
      slug: 'social-research',
      title: 'Social media research and posters',
      scale: 'Content pipeline',
      nodes: ['RSS feeds', 'Research', 'AI writes', 'Render poster', 'Log to Notion'],
      description:
        'Finds topics in RSS feeds, has Claude write the post and poster copy, renders the poster and logs it in Notion.',
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
    readCase: 'Case study',
    comingSoon: 'Link coming soon',
    scale: 'Scale',
    stack: 'Built with',
  },

  howIWork: {
    principles: [
      'I pick the tool that fits the job, AI included, and I say so when AI is the wrong one.',
      'I have a person check the work where a mistake would be public or costly.',
      'I write things down, so the work can carry on without me.',
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
        tools:
          'Node.js, TypeScript, Express, Python (Django, Django REST Framework), Prisma, PostgreSQL, REST and GraphQL APIs, PHP',
      },
      {
        area: 'Frontend & mobile',
        tools:
          'JavaScript, TypeScript, React, Next.js, Redux Toolkit, Material UI, Tailwind, Three.js, React Native, Expo, Electron, Flutter',
      },
      {
        area: 'Cloud & data',
        tools:
          'Google Cloud (App Engine, Cloud Build, Storage), Supabase (row-level security, SQL functions, realtime), Firebase, Microsoft Entra ID, Vercel',
      },
      {
        area: 'Delivery',
        tools: 'Docker, CI/CD (GitHub Actions, Cloud Build), TDD, Jest, Vitest, Sentry, Azure DevOps, Jira',
      },
    ],
  },

  // Casual mode ("Out of Tech"): one card per moment. Photos: public/casual/<slug>.webp, portrait 660 × 900.
  casual: {
    gaming: [
      {
        slug: 'shoutcasting',
        title: 'On the mic',
        detail:
          'Since 2021, I have hosted and cast 80+ live events for Samsung, Predator Gaming, Mineski, TNC, UAAP, VCT and CFS.',
        image: '/casual/shoutcasting.webp',
      },
      {
        slug: 'gaming',
        title: 'Video games',
        detail: 'When work gets stressful, I play League of Legends and Valorant to get even more stressed :D',
        image: '/casual/gaming.webp',
      },
      {
        slug: 'cosplay',
        title: 'Cosplay',
        detail: 'I love dressing up as my favourite characters, and I put the work in to make them accurate.',
        image: '/casual/cosplay.webp',
      },
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
        detail: 'I build side projects after hours. I even drew the pixel cat for tomorrow by hand.',
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
        detail: 'Currently reading Essentialism by Greg McKeown, about the disciplined pursuit of less.',
        image: '/casual/reading.webp',
      },
    ],
  },

  contact: {
    title: 'Contact',
    code: {
      hello: "Hello, I'm Michaella and I'm an AI & automation engineer.",
      name: 'MichaellaGonzales',
      bases: ['Builder', 'Trainer', 'Leader'],
      info: 'contact_info',
      open: 'open_to',
    },
    // Add the photo at public/contact/selfie.webp (portrait 4:5, 800 × 1000).
    selfie: {
      src: '/contact/selfie.webp',
      alt: 'Selfie of Michaella with dark, teal-tipped hair and a silver star earring',
      caption: 'Say hi!',
    },
    openTo: {
      roles: ['AI and automation engineering', 'Technical Project Management', 'Software and Web Developer'],
      type: ['Full-time', 'Contract'],
      where: 'Remote',
    },
    email: 'mochii.aroundtech@gmail.com',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed. Select the address instead.',
    links: [
      {
        label: 'LinkedIn',
        icon: 'linkedin',
        href: 'https://www.linkedin.com/in/michaella-gonzales-203626296',
        text: 'in/michaella-gonzales-203626296',
      },
      { label: 'GitHub', icon: 'github', href: 'https://github.com/mochiicakes', text: 'github.com/mochiicakes' },
    ],
  },

  // Live from Spotify; setup in README (Recently played).
  recentlyPlayed: {
    title: 'Recently played',
    intro: 'Directly from Spotify. Hover to listen, click to see on Spotify directly.',
    ago: { now: 'Just now', minutes: '{n} min ago', hours: '{n} h ago', days: '{n} d ago' },
    play: 'Listen from here',
    pause: 'Stop listening',
    open: 'Open in Spotify',
    noPreview: 'No preview',
    soundHint: 'Click anywhere once to turn the sound on.',
    empty: 'Nothing to show right now. Check back soon.',
  },

  footer: `© ${new Date().getFullYear()} MG`,
}
