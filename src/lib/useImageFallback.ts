import { useState } from 'react'

/**
 * Tracks whether an image file exists, so its slot can show a painted stand-in
 * instead. Pass the result's `ref` and `onError` to the <img>.
 *
 * The ref catches an image that failed before React hydrated (onError missed).
 * It cannot trust `complete && naturalWidth === 0` alone: Chrome reports that
 * for a lazy image it has not started loading yet. So it asks once more with a
 * plain request, and gives up only if that fails too.
 *
 * Failure is kept per path, so a new path gets a fresh try.
 */
export function useImageFallback(src: string) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const fail = () => setFailedSrc(src)
  const ref = (img: HTMLImageElement | null) => {
    if (!img || !img.complete || img.naturalWidth > 0) return
    const probe = new Image()
    probe.onerror = fail
    probe.src = src
  }
  return { failed: failedSrc === src, ref, onError: fail }
}
