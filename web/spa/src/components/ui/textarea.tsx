import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** A multi-line text box (Bootstrap `form-control`). Needs a placeholder for floating labels; see {@link Input}. */
function Textarea({ className, placeholder = ' ', ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      placeholder={placeholder}
      className={cn('form-control', props['aria-invalid'] && 'is-invalid', className)}
      style={{ minHeight: '7rem' }}
      {...props}
    />
  )
}

export { Textarea }
