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
  /** Visible text of the floating label. */
  label: string
  /** Error text to show under the field. Omit when the field is valid. */
  error?: string | undefined
  /** Help text shown under the field. */
  hint?: string
  /** Draws the actual control. Receives the id and `aria-*` props to put on it. */
  render: (props: FieldA11yProps) => ReactNode
  /** Extra Bootstrap classes for the outer element, for example `flex-grow-1`. */
  className?: string
}

/**
 * One floating label, one control, an optional hint, and an error that is linked to the control,
 * so screen readers read the error when the field gets focus. It is not a live region itself: a form-level
 * alert or the error summary announces the failure once, and focus moves to the first invalid field.
 *
 * Bootstrap floating labels need the control first and the label after it, inside `.form-floating`.
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
      <div className="form-floating">
        {control}
        <label htmlFor={id}>{label}</label>
      </div>
      {hint && (
        <div id={hintId} className="form-text">
          {hint}
        </div>
      )}
      {error && (
        <div id={errorId} className="invalid-feedback d-block fw-semibold">
          {error}
        </div>
      )}
    </div>
  )
}
