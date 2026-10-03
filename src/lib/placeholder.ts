const PLACEHOLDER = /\[[^\]]+\]/

/** True when the whole string, or any part of it, is a [placeholder]. */
export function hasPlaceholder(text: string): boolean {
  return PLACEHOLDER.test(text)
}

/** Splits text into plain runs and [placeholder] runs, in order. */
export function splitPlaceholders(text: string): { text: string; placeholder: boolean }[] {
  return text
    .split(/(\[[^\]]+\])/g)
    .filter(Boolean)
    .map((part) => ({ text: part, placeholder: PLACEHOLDER.test(part) }))
}
