// Lists every [placeholder] left in src/content.ts, with its line number.
import fs from 'node:fs'

const file = 'src/content.ts'
const lines = fs.readFileSync(file, 'utf8').split('\n')
let count = 0
lines.forEach((line, i) => {
  if (line.trim().startsWith('//')) return
  const found = line.match(/\[[^\]'"]+\]/g)
  if (!found) return
  count += found.length
  const field = line.trim().match(/^([\w]+):/)?.[1] ?? ''
  console.log(`${file}:${i + 1}  ${field ? field + '  ' : ''}${found.join('  ')}`)
})
console.log(`\n${count} placeholder${count === 1 ? '' : 's'} left.`)
