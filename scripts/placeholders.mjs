// Lists every [placeholder] left in src/content.ts, with its line number.
// With --check (run by `npm run build`), exits with an error while any remain.
// An `href` placeholder is allowed: its card shows "Link coming soon" by design.
import fs from 'node:fs'

const check = process.argv.includes('--check')
const file = 'src/content.ts'
const lines = fs.readFileSync(file, 'utf8').split('\n')
let count = 0
let allowed = 0
lines.forEach((line, i) => {
  if (line.trim().startsWith('//')) return
  // Arrays of numbers, like coverLetters: [4, 5], are code, not copy.
  const found = line.match(/\[[^\]'"]+\]/g)?.filter((m) => !/^\[[\d,\s]+\]$/.test(m))
  if (!found?.length) return
  const field = line.trim().match(/^([\w]+):/)?.[1] ?? ''
  const ok = field === 'href'
  if (ok) allowed += found.length
  else count += found.length
  console.log(`${file}:${i + 1}  ${field ? field + '  ' : ''}${found.join('  ')}${ok ? '  (allowed: shows "Link coming soon")' : ''}`)
})
console.log(`\n${count} placeholder${count === 1 ? '' : 's'} left${allowed ? `, ${allowed} allowed link${allowed === 1 ? '' : 's'}` : ''}.`)
if (check && count > 0) {
  console.error('Fill or remove the placeholders above before building for production.')
  process.exit(1)
}
