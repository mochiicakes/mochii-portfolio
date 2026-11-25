/**
 * Shows `count` things in turn, each for `ms`, round and round. While anything
 * holds it, it waits, then gives the one showing its full time again. Once
 * stopped it never moves again.
 */
export function takeTurns(count: number, ms: number, show: (i: number) => void) {
  const holds = new Set<string>()
  let i = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let stopped = false

  const wait = () => {
    clearTimeout(timer)
    if (stopped || holds.size > 0 || count < 2) return
    timer = setTimeout(() => {
      i = (i + 1) % count
      show(i)
      wait()
    }, ms)
  }
  wait()

  return {
    /** Holds it, or lets go, for one reason; it moves only when there are none. */
    hold(reason: string, on: boolean) {
      if (on === holds.has(reason)) return
      if (on) holds.add(reason)
      else holds.delete(reason)
      wait()
    },
    stop() {
      stopped = true
      clearTimeout(timer)
    },
  }
}
