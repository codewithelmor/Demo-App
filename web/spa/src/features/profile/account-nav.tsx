import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { cn } from '@/lib/utils'

/** The account pages the side navigation links to. */
const links = [
  { to: '/account', label: 'Profile', paths: ['/account', '/account/edit'] },
  { to: '/account/password', label: 'Change password', paths: ['/account/password'] },
  { to: '/account/delete', label: 'Delete account', paths: ['/account/delete'] },
]

/** The list of account pages (information architecture, My account). "Profile" stays current on the edit page too. */
export function AccountNav() {
  const { pathname } = useLocation()
  return (
    <nav aria-label="Account" className="w-100">
      <ul className="nav nav-pills flex-md-column">
        {links.map((link) => {
          const current = link.paths.includes(pathname)
          return (
            <li key={link.to} className="nav-item">
              <Link
                to={link.to}
                aria-current={current ? 'page' : undefined}
                className={cn('nav-link', current && 'active')}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** The page frame: the account links next to the page. */
export function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="sidebar-layout">
      <AccountNav />
      <div className="d-grid max-w-xl align-content-start gap-3">{children}</div>
    </div>
  )
}
