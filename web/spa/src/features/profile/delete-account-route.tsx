import FormHelperText from '@mui/material/FormHelperText'
import Alert from '@mui/material/Alert'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { FormAlert } from '@/components/form-alert'
import { FormField } from '@/components/form-field'
import { PasswordInput } from '@/components/password-input'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button, LinkButton } from '@/components/ui/button'
import { AccountLayout } from '@/features/profile/account-nav'
import { eraseAccount } from '@/features/profile/profile-api'
import { deleteAccountSchema, type DeleteAccountValues } from '@/features/profile/profile-schemas'
import { useEndSession } from '@/hooks/use-end-session'
import { useServerFailure } from '@/hooks/use-server-failure'

/**
 * CU-10 (EP-37). Two confirmations: the "I understand" box with the password, then the dialog.
 * Erasing is permanent, so it needs the password, a checked box, and a final dialog.
 */
export function DeleteAccountRoute() {
  const understoodId = useId()
  const endSession = useEndSession()
  const [confirming, setConfirming] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm<DeleteAccountValues>({
    mode: 'onChange',
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { currentPassword: '', understood: false },
  })
  const { failure, secondsLeft, locked, fail, clear } = useServerFailure(setError, [
    'currentPassword',
  ])

  const mutation = useMutation({
    mutationFn: eraseAccount,
    // The API erased the account and the BFF ended the session. The cart is cleared (UX-D2, NFR-F41).
    onSuccess: () => endSession('account-erased', { clearCart: true }),
    onError: (error) => {
      // Back to the page: the error is on the password field, or in the alert (open orders, 429).
      setConfirming(false)
      fail(error)
    },
  })

  const openOrders = failure?.error.slug === 'customer-has-open-orders'

  return (
    <AccountLayout>
      <title>Delete your account · Orders Shop</title>
      <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
        Delete your account
      </h1>
      <section aria-labelledby="what-happens" className="d-grid gap-2">
        <h2 id="what-happens" className="fs-5 fw-medium">
          What happens
        </h2>
        <ul className="ps-4 small">
          <li>Your name, email and phone are erased.</li>
          <li>Your order records are kept without your personal data, for accounting.</li>
          <li>You are signed out and cannot sign in again.</li>
          <li>Open orders must be cancelled or finished first.</li>
        </ul>
      </section>

      {openOrders ? (
        <Alert severity="error" role="alert" className="gap-2">
          <p>Cancel or finish your open orders first.</p>
          <Link to="/orders" className="text-decoration-underline">
            Go to My orders
          </Link>
        </Alert>
      ) : (
        <FormAlert failure={failure} />
      )}

      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(() => {
            clear()
            setConfirming(true)
          })(event)
        }}
        className="d-grid gap-3"
      >
        <FormField
          label="Current password"
          error={errors.currentPassword?.message}
          render={(a11y) => (
            <PasswordInput
              autoComplete="current-password"
              {...a11y}
              {...register('currentPassword')}
            />
          )}
        />
        <div>
          <div className="d-flex align-items-center gap-2">
            <input
              id={understoodId}
              type="checkbox"
              className="check-input"
              aria-invalid={errors.understood ? true : undefined}
              aria-describedby={errors.understood ? `${understoodId}-error` : undefined}
              {...register('understood')}
            />
            <label htmlFor={understoodId}>I understand this cannot be undone.</label>
          </div>
          {errors.understood && (
            <FormHelperText id={`${understoodId}-error`} error sx={{ fontWeight: 600 }}>
              {errors.understood.message}
            </FormHelperText>
          )}
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button type="submit" variant="destructive" disabled={mutation.isPending || locked}>
            Delete my account
          </Button>
          {locked && (
            <span aria-hidden="true" className="small text-body-secondary">
              You can try again in {secondsLeft} s
            </span>
          )}
          <LinkButton to="/account" variant="outline">
            Keep my account
          </LinkButton>
        </div>
      </form>

      <AlertDialog
        open={confirming}
        onOpenChange={(open) => {
          // Do not close while the request runs.
          if (!open && mutation.isPending) return
          setConfirming(open)
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            // After a wrong password, focus goes to the password field instead of back to the button.
            if (errors.currentPassword) {
              event.preventDefault()
              setFocus('currentPassword')
            }
          }}
        >
          <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
          <AlertDialogDescription>
            Your name, email and phone are erased and you cannot sign in again. Your order records
            are kept without your personal data. This cannot be undone.
          </AlertDialogDescription>
          <div className="d-flex flex-wrap justify-content-end gap-2">
            {/* Focus starts here, on the safe button. */}
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" disabled={mutation.isPending}>
                Keep my account
              </Button>
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={mutation.isPending}
              aria-busy={mutation.isPending}
              onClick={() => {
                if (mutation.isPending) return
                mutation.mutate(getValues('currentPassword'))
              }}
            >
              {mutation.isPending ? 'Deleting…' : 'Delete account'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AccountLayout>
  )
}
