import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * A single-line text box (Bootstrap `form-control`). Turns red when marked `aria-invalid`.
 * Floating labels need a placeholder to detect "empty", so a blank one is set when none is given;
 * {@link FormField} puts the label after the input.
 */
function Input({ className, type = 'text', placeholder = ' ', ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      placeholder={placeholder}
      className={cn('form-control', props['aria-invalid'] && 'is-invalid', className)}
      {...props}
    />
  )
}

export { Input }
