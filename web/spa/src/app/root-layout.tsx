/** The frame around every page: skip link, header with navigation, and the main content area. */
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigation } from 'react-router'
import { CartLink } from '@/components/cart-link'
import { useSession } from '@/lib/session'
import { SignOutButton } from '@/features/auth/sign-out-button'
import { useFocusHeadingOnNavigate } from '@/hooks/use-focus-heading-on-navigate'
import { cn } from '@/lib/utils'

/** CSS classes for a navigation link. React Router tells us whether the link points at the current page. */
const navLinkClass = ({ isActive }: { isActive: boolean }) => cn('nav-link', isActive && 'active')

/**
 * The app shell, rendered around every page (the page itself appears where `<Outlet />` is).
 *
 * - The skip link lets keyboard and screen-reader users jump over the header straight to `<main>`.
 * - The navigation, cart link and sign-out button only show when someone is signed in, and the links
 *   depend on the user's role (Customer or Admin).
 * - `aria-busy` tells assistive technology that the page content is loading during a navigation.
 */
export function RootLayout() {
  useFocusHeadingOnNavigate()
  const navigation = useNavigation()
  const user = useSession()
  // Whether the menu is open on small screens (it is always visible from the lg breakpoint up).
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState<string | undefined>(undefined)
  const open = openOn === pathname

  return (
    <div className="min-vh-100">
      <a href="#main" className="skip-link btn btn-light position-absolute top-0 start-0 m-2">
        Skip to main content
      </a>
      <header>
        <nav aria-label="Main" className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
          <div className="container-fluid">
            <span className="navbar-brand fw-semibold">Orders Shop</span>
            {user && (
              <>
                <button
                  type="button"
                  className="navbar-toggler"
                  aria-controls="navbar-menu"
                  aria-expanded={open}
                  aria-label="Toggle navigation"
                  onClick={() => {
                    setOpenOn(open ? undefined : pathname)
                  }}
                >
                  <span className="navbar-toggler-icon" />
                </button>
                {/* Bootstrap's collapse JavaScript is not loaded; React toggles the show class. The menu closes by itself when the page changes. */}
                <div id="navbar-menu" className={cn('collapse navbar-collapse', open && 'show')}>
                  <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                      <NavLink to="/products" className={navLinkClass}>
                        Products
                      </NavLink>
                    </li>
                    {user.roles.includes('Customer') && (
                      <li className="nav-item">
                        <NavLink to="/orders" className={navLinkClass}>
                          My orders
                        </NavLink>
                      </li>
                    )}
                    {user.roles.includes('Admin') && (
                      <li className="nav-item">
                        <NavLink to="/admin" className={navLinkClass}>
                          Back office
                        </NavLink>
                      </li>
                    )}
                  </ul>
                  <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2">
                    <CartLink />
                    {user.roles.includes('Customer') && (
                      <NavLink to="/account" className={navLinkClass}>
                        My account
                      </NavLink>
                    )}
                    <span className="navbar-text">{user.email}</span>
                    <SignOutButton />
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>
      </header>
      <main id="main" className="container py-4" aria-busy={navigation.state === 'loading'}>
        <Outlet />
      </main>
    </div>
  )
}
