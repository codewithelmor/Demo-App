import Paper from '@mui/material/Paper'
import { TextLink } from '@/components/text-link'
import { LinkButton } from '@/components/ui/button'

/**
 * AN-4: the page shown after registering. The email is neither shown nor stored. The text is the same for
 * new and existing emails, so the page never reveals whether an account exists ("anti-enumeration").
 * In development a hint says where to find the email link (the local setup logs it instead of sending it).
 */
export function CheckEmailRoute() {
  return (
    <Paper
      component="section"
      variant="outlined"
      className="mx-auto d-grid max-w-md gap-3"
      sx={{ p: 2 }}
    >
      <title>Check your email · Orders Shop</title>
      <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
        Check your email
      </h1>
      <p>
        If this email can be used, we sent a link to confirm your account. The link works for 24
        hours.
      </p>
      <p className="small">
        Did not get it? <TextLink to="/resend-confirmation">Resend email</TextLink>
      </p>
      <div>
        <LinkButton to="/sign-in" variant="outline">
          Back to sign in
        </LinkButton>
      </div>
      {import.meta.env.DEV && (
        <p className="small text-body-secondary">
          Local setup: find the link with <code>docker compose logs api</code>.
        </p>
      )}
    </Paper>
  )
}
