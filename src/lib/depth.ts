/**
 * How deep the water is at this scroll position: 0 at the surface (the top of
 * the page), 1 at the bottom. It takes at least two windows of scrolling to
 * reach the bottom, so a short page stays near the surface.
 */
export function depthAt(scrollY: number, pageHeight: number, windowHeight: number) {
  const room = pageHeight - windowHeight
  if (room <= 0) return 0
  return Math.min(1, Math.max(0, scrollY / Math.max(room, windowHeight * 2)))
}
