import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** A dropdown using the browser's built-in `<select>` (Bootstrap `form-select`). */
function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      data-slot="native-select"
      className={cn('form-select', props['aria-invalid'] && 'is-invalid', className)}
      {...props}
    />
  )
}

export { NativeSelect }
