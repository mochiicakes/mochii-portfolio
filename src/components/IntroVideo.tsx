import { useState, type MouseEvent } from 'react'
import { content } from '../content'

/**
 * The introductory video, under the Around Tech header. It shows YouTube's
 * still with a play mark, and loads the player only when pressed, so the page
 * does not pay for YouTube up front. Without JavaScript the still links to the
 * video on YouTube.
 */
export function IntroVideo() {
  const v = content.introVideo
  const [playing, setPlaying] = useState(false)
  const play = (e: MouseEvent) => {
    e.preventDefault()
    setPlaying(true)
  }
  return (
    <figure className="intro-video">
      <div className="intro-video-frame pane">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0&playsinline=1`}
            title={v.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <a className="intro-video-cover" href={`https://www.youtube.com/watch?v=${v.youtubeId}`} onClick={play}>
            <img src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
            <span className="intro-video-play" aria-hidden="true" />
            <span className="sr-only">Play: {v.title}</span>
          </a>
        )}
      </div>
      <figcaption className="intro-video-caption">{v.caption}</figcaption>
    </figure>
  )
}
