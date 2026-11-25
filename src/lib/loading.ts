// What the loading screen waits for, and how its lines follow one another.

/** Things drawn in the page, which say so themselves when they are done. */
export type Drawn = 'light' | 'flowers'

function signal() {
  let resolve = () => {}
  const promise = new Promise<void>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

const drawn: Record<Drawn, ReturnType<typeof signal>> = { light: signal(), flowers: signal() }

export const markReady = (name: Drawn) => drawn[name].resolve()
export const whenReady = (name: Drawn) => drawn[name].promise

/** Every image path in some content, each once. */
export function images(value: unknown): string[] {
  const found = new Set<string>()
  const walk = (v: unknown) => {
    if (typeof v === 'string') {
      if (/^\/.*\.(webp|png|jpe?g)$/.test(v)) found.add(v)
    } else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(value)
  return [...found]
}

/** Fetches and decodes images. One that fails is skipped: its slot has a stand-in. */
export const loadImages = (paths: string[]) =>
  Promise.all(
    paths.map((src) => {
      const img = new Image()
      img.src = src
      return img.decode().catch(() => {})
    }),
  )

export const loadFonts = () =>
  Promise.all(
    ['300 1em "Inter Variable"', 'italic 300 1em "Inter Variable"', '400 1em "Sixtyfour Variable"'].map((font) =>
      document.fonts.load(font).catch(() => {}),
    ),
  )

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export type Step = { line: string; done: Promise<unknown> }

/**
 * Shows each step's line until that step is done, and at least `minMs` so it can
 * be read. Whatever happens, it is over `capMs` after it began.
 */
export async function prepare(
  steps: Step[],
  show: (line: string) => void,
  { minMs, capMs }: { minMs: number; capMs: number },
) {
  let late = false
  const cap = wait(capMs).then(() => {
    late = true
  })
  for (const { line, done } of steps) {
    if (late) return
    show(line)
    const settled = done.catch(() => {})
    await Promise.race([Promise.all([settled, wait(minMs)]), cap])
  }
}

const SEEN_KEY = 'mg-loaded'

/** Whether the loading screen has already been seen this visit. */
export function seenLoading(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === 'seen'
  } catch {
    return false
  }
}

export function markLoadingSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, 'seen')
  } catch {
    // Storage blocked: it takes its full time again after a reload.
  }
}
