import Paper from '@mui/material/Paper'
import { TextLink } from '@/components/text-link'
import { ResendConfirmationForm } from '@/features/auth/resend-confirmation-form'

/** AN-6: the page for asking for a new confirmation email. The form itself is `ResendConfirmationForm`. */
export function ResendConfirmationRoute() {
  return (
    <Paper
      component="section"
      variant="outlined"
      className="mx-auto d-grid max-w-md gap-4"
      sx={{ p: 2 }}
    >
      <title>Resend confirmation · Orders Shop</title>
      <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
        Resend confirmation email
      </h1>
      <p className="small text-body-secondary">Enter the email you used to create your account.</p>
      <ResendConfirmationForm submitLabel="Send confirmation email" />
      <p>
        <TextLink to="/sign-in">Back to sign in</TextLink>
      </p>
    </Paper>
  )
}
