import { content } from '../content'

/**
 * The foot of a page's last screen: the credits, and at the lower left the
 * spot where the golden koi waits (see CursorKoi). Each page ends on its own
 * screen, so there is nothing further to scroll to.
 */
export function ScreenFoot() {
  return (
    <div className="screen-foot">
      <div className="koi-home" aria-hidden="true" />
      <p className="footer">{content.footer}</p>
    </div>
  )
}
