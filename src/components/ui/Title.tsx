/** A title with its last word lit in ice. A single word stays white. */
export function Title({ text }: { text: string }) {
  const cut = text.lastIndexOf(' ')
  if (cut < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, cut + 1)}
      <span className="title-ice">{text.slice(cut + 1)}</span>
    </>
  )
}
