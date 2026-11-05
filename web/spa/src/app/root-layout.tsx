/** The frame around every page: skip link, header with navigation, and the main content area. */
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Menu } from 'lucide-react'
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
  // Whether the menu is open on small screens (it is always visible from the md breakpoint up).
  const { pathname } = useLocation()
  const [openOn, setOpenOn] = useState<string | undefined>(undefined)
  const open = openOn === pathname

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <AppBar position="static" component="header">
        <Toolbar
          component="nav"
          aria-label="Main"
          sx={{ flexWrap: 'wrap', gap: 1, py: { xs: 1, md: 0 } }}
        >
          <Typography variant="h6" component="span" sx={{ mr: 2 }}>
            Orders Shop
          </Typography>
          {user && (
            <>
              <IconButton
                color="inherit"
                aria-controls="navbar-menu"
                aria-expanded={open}
                aria-label="Toggle navigation"
                sx={{ display: { md: 'none' }, ml: 'auto' }}
                onClick={() => {
                  setOpenOn(open ? undefined : pathname)
                }}
              >
                <Menu aria-hidden="true" />
              </IconButton>
              <Box
                id="navbar-menu"
                sx={{
                  display: { xs: open ? 'flex' : 'none', md: 'flex' },
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'center' },
                  flexGrow: 1,
                  gap: 1,
                  width: { xs: '100%', md: 'auto' },
                }}
              >
                <ul className="nav-list me-auto">
                  <li>
                    <NavLink to="/products" className={navLinkClass}>
                      Products
                    </NavLink>
                  </li>
                  {user.roles.includes('Customer') && (
                    <li>
                      <NavLink to="/orders" className={navLinkClass}>
                        My orders
                      </NavLink>
                    </li>
                  )}
                  {user.roles.includes('Admin') && (
                    <li>
                      <NavLink to="/admin" className={navLinkClass}>
                        Back office
                      </NavLink>
                    </li>
                  )}
                </ul>
                <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                  <CartLink />
                  {user.roles.includes('Customer') && (
                    <NavLink to="/account" className={navLinkClass}>
                      My account
                    </NavLink>
                  )}
                  <Typography variant="body2" component="span" sx={{ opacity: 0.85 }}>
                    {user.email}
                  </Typography>
                  <SignOutButton />
                </div>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        id="main"
        maxWidth="xl"
        sx={{ py: 4 }}
        aria-busy={navigation.state === 'loading'}
      >
        <Outlet />
      </Container>
    </Box>
  )
}
