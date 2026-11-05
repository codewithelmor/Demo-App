/** The "you do not have access" page (HTTP 403 equivalent). */
import { LinkButton } from '@/components/ui/button'

/**
 * SY-2: shown in place on guarded routes when a signed-in user has the wrong role.
 * "In place" means the URL does not change. No API call is made.
 *
 * `<title>` inside a component sets the browser tab title (React 19 moves it into `<head>`).
 * `tabIndex={-1}` lets code focus the heading (see `useFocusHeadingOnNavigate`) so screen readers announce the new page.
 */
export function ForbiddenPage() {
  return (
    <section className="d-grid max-w-prose gap-3">
      <title>Not allowed · Orders Shop</title>
      <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
        You do not have access to this page.
      </h1>
      <p>This area is for administrators.</p>
      <div>
        <LinkButton to="/products">Go to Products</LinkButton>
      </div>
    </section>
  )
}
