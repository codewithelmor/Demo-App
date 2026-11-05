import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import { useId, type ReactNode } from 'react'

/**
 * Accessibility attributes {@link FormField} hands to the input it wraps. Spread them on the input:
 * `<Input {...a11y} />`. They link the input to its label, hint and error for screen readers.
 */
export interface FieldA11yProps {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

/** Props for {@link FormField}. */
interface FormFieldProps {
  /** Visible label text, shown above the control. */
  label: string
  /** Error text to show under the field. Omit when the field is valid. */
  error?: string | undefined
  /** Help text shown under the field. */
  hint?: string
  /** Draws the actual control. Receives the id and `aria-*` props to put on it. */
  render: (props: FieldA11yProps) => ReactNode
  /** Extra utility classes for the outer element, for example `flex-grow-1`. */
  className?: string
}

/**
 * One label, one control, an optional hint, and an error that is linked to the control,
 * so screen readers read the error when the field gets focus. It is not a live region itself: a form-level
 * alert or the error summary announces the failure once, and focus moves to the first invalid field.
 *
 * Example: `<FormField label="Email" error={errors.email?.message} render={(a11y) => <Input {...a11y} />} />`
 */
export function FormField({ label, error, hint, render, className }: FormFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const control = render({
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  })

  return (
    <div className={className}>
      <FormLabel
        htmlFor={id}
        error={Boolean(error)}
        sx={{ display: 'block', mb: 0.5, fontSize: '0.875rem' }}
      >
        {label}
      </FormLabel>
      <div className="position-relative">{control}</div>
      {hint && <FormHelperText id={hintId}>{hint}</FormHelperText>}
      {error && (
        <FormHelperText id={errorId} error sx={{ fontWeight: 600 }}>
          {error}
        </FormHelperText>
      )}
    </div>
  )
}
