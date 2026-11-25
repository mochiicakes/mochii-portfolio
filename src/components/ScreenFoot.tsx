import { content } from '../content'

/**
 * The foot of a page's last screen: the credits, and above them the spot
 * where the sea angel's heart waits (see CursorAngel). Each page ends on its
 * own screen, so there is nothing further to scroll to.
 */
export function ScreenFoot() {
  return (
    <div className="screen-foot">
      <div className="koi-home" aria-hidden="true" />
      <p className="footer">{content.footer}</p>
    </div>
  )
}
