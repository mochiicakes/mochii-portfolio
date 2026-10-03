import { splitPlaceholders } from '../../lib/placeholder'

/** Renders text, showing any [placeholder] as a dashed chip. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {splitPlaceholders(text).map((part, i) =>
        part.placeholder ? (
          <span key={i} className="ph" title="Placeholder: replace in src/content.ts">
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
    </>
  )
}
