import { useImageFallback } from '../../lib/useImageFallback'
import { Rich } from './Rich'

/**
 * A screenshot or photo, or a painted stand-in with `label` written on it
 * until the file exists.
 */
export function Thumb({ src, alt, label, className = '' }: { src: string; alt: string; label: string; className?: string }) {
  const { failed, ref, onError } = useImageFallback(src)
  return (
    <span className={`thumb ${className}`}>
      <span className="thumb-art" aria-hidden="true">
        <Rich text={label} />
      </span>
      {!failed && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={onError}
        />
      )}
    </span>
  )
}
