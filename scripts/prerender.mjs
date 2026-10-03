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

const social = [
  ['property', 'og:type', 'website'],
  ['property', 'og:title', meta.title],
  ['property', 'og:description', meta.description],
  ['name', 'twitter:card', 'summary'],
]
  .map(([attr, key, value]) => `<meta ${attr}="${key}" content="${escape(value)}" />`)
  .join('\n    ')

const appHtml = render()
if (!html.includes('<!--app-html-->')) throw new Error('index.html is missing <!--app-html-->')
html = html
  .replace('<!--app-html-->', () => appHtml)
  .replace(/<title>.*?<\/title>/, () => `<title>${escape(meta.title)}</title>`)
  .replace(
    '<meta name="description" content="" />',
    () => `<meta name="description" content="${escape(meta.description)}" />\n    ${social}`,
  )

fs.writeFileSync(file, html)
fs.rmSync(ssrDir, { recursive: true, force: true })
console.log(`Pre-rendered ${(appHtml.length / 1024).toFixed(1)} kB of HTML into dist/index.html`)
