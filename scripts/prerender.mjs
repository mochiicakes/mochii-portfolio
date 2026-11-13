// Pre-renders the page into dist/index.html after `vite build`, so the full
// content is in the HTML and reads fine even if JavaScript fails to load.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist')
const ssrDir = path.resolve('dist-ssr')
const { render, meta } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const file = path.join(dist, 'index.html')
let html = fs.readFileSync(file, 'utf8')

// The site's address, for the canonical link, share tags, robots.txt and sitemap.
// SITE_URL wins; otherwise Vercel's production domain, which Vercel sets on every build.
const host = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || ''
const site = host ? (host.startsWith('http') ? host : `https://${host}`).replace(/\/+$/, '') : ''

const social = [
  ['property', 'og:type', 'website'],
  ['property', 'og:title', meta.title],
  ['property', 'og:description', meta.description],
  ...(site
    ? [
        ['property', 'og:url', `${site}/`],
        ['property', 'og:image', `${site}/og.jpg`],
        ['property', 'og:image:width', '1200'],
        ['property', 'og:image:height', '630'],
        ['property', 'og:image:alt', `${meta.name}, ${meta.role}`],
        ['name', 'twitter:image', `${site}/og.jpg`],
      ]
    : []),
  ['name', 'twitter:card', site ? 'summary_large_image' : 'summary'],
]
  .map(([attr, key, value]) => `<meta ${attr}="${key}" content="${escape(value)}" />`)
  .join('\n    ')

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: meta.name,
  jobTitle: meta.role,
  description: meta.description,
  email: `mailto:${meta.email}`,
  sameAs: meta.links,
  ...(site ? { url: `${site}/`, image: `${site}/og.jpg` } : {}),
}
const head = [
  social,
  site && `<link rel="canonical" href="${site}/" />`,
  `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`,
]
  .filter(Boolean)
  .join('\n    ')

const appHtml = render()
if (!html.includes('<!--app-html-->')) throw new Error('index.html is missing <!--app-html-->')
html = html
  .replace('<!--app-html-->', () => appHtml)
  .replace(/<title>.*?<\/title>/, () => `<title>${escape(meta.title)}</title>`)
  .replace(
    '<meta name="description" content="" />',
    () => `<meta name="description" content="${escape(meta.description)}" />\n    ${head}`,
  )

fs.writeFileSync(file, html)

// Crawlers: allow everything; the sitemap needs an absolute address, so it waits for one.
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${site ? `\nSitemap: ${site}/sitemap.xml\n` : ''}`)
if (site) {
  fs.writeFileSync(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`,
  )
} else {
  console.warn('No SITE_URL or VERCEL_PROJECT_PRODUCTION_URL: built without canonical, share image tags or sitemap.')
}
fs.rmSync(ssrDir, { recursive: true, force: true })
console.log(`Pre-rendered ${(appHtml.length / 1024).toFixed(1)} kB of HTML into dist/index.html`)
