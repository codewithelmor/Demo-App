/** The "page not found" page (HTTP 404 equivalent). */
import { LinkButton } from '@/components/ui/button'

/**
 * SY-1: shown when the URL matches no route, or when the API says a resource does not exist.
 * The heading has `tabIndex={-1}` so code can move keyboard/screen-reader focus to it.
 */
export function NotFoundPage() {
  return (
    <section className="d-grid max-w-prose gap-3">
      <title>Page not found · Orders Shop</title>
      <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
        Page not found
      </h1>
      <p>Check the address, or go back to the start.</p>
      <div>
        <LinkButton to="/">Go to the start</LinkButton>
      </div>
    </section>
  )
}
