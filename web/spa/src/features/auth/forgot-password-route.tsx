import Paper from '@mui/material/Paper'
import { zodResolver } from '@hookform/resolvers/zod'
import { confirmSubmit } from '@/lib/confirm'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FormAlert } from '@/components/form-alert'
import { FormField } from '@/components/form-field'
import { SubmitRow } from '@/components/submit-row'
import { TextLink } from '@/components/text-link'
import { Input } from '@/components/ui/input'
import { forgotPassword } from '@/features/auth/access-api'
import { emailSchema, type EmailValues } from '@/features/auth/access-schemas'
import { useServerFailure } from '@/hooks/use-server-failure'

/** Neutral result text, the same for every email. */
export const FORGOT_RESULT =
  'If an account exists for this email, we sent a link. It works for 1 hour.'

/**
 * AN-7 (EP-10): the "forgot password" page. The same result for every email, valid or not
 * (anti-enumeration: the page never reveals whether an account exists).
 */
export function ForgotPasswordRoute() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  })
  const { failure, secondsLeft, locked, fail, clear } = useServerFailure(setError, ['email'])

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setSent(true)
    },
    onError: fail,
  })

  const onSubmit = async (values: EmailValues) => {
    if (
      !(await confirmSubmit({
        title: 'Send the reset link?',
        text: 'We will email a link to reset your password.',
        confirmLabel: 'Send link',
      }))
    )
      return
    clear()
    setSent(false)
    mutation.mutate(values.email)
  }

  return (
    <Paper
      component="section"
      variant="outlined"
      className="mx-auto d-grid max-w-md gap-4"
      sx={{ p: 2 }}
    >
      <title>Reset your password · Orders Shop</title>
      <h1 tabIndex={-1} className="fs-3 fw-semibold focus-target">
        Reset your password
      </h1>
      <p className="small text-body-secondary">
        Enter your email and we will send you a link to choose a new password.
      </p>
      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event)
        }}
        className="d-grid gap-3"
      >
        <FormAlert failure={failure} />
        <FormField
          label="Email"
          error={errors.email?.message}
          render={(a11y) => (
            <Input type="email" autoComplete="email" {...a11y} {...register('email')} />
          )}
        />
        <SubmitRow
          label="Send reset link"
          pendingLabel="Sending…"
          pending={mutation.isPending}
          secondsLeft={locked ? secondsLeft : 0}
        />
        <p role="status" className="small">
          {sent ? FORGOT_RESULT : ''}
        </p>
      </form>
      <p>
        <TextLink to="/sign-in">Back to sign in</TextLink>
      </p>
    </Paper>
  )
}
