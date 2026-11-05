import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Looks of a badge, mapped to Bootstrap classes. */
const variants = {
  default: 'text-bg-primary',
  outline: 'border text-body bg-body',
  muted: 'text-bg-light border',
} as const

/** A small label for a status or a count. Variants: `default` (filled), `outline` (default), `muted` (grey). */
function Badge({
  className,
  variant = 'outline',
  ...props
}: ComponentProps<'span'> & { variant?: keyof typeof variants | null | undefined }) {
  return (
    <span
      data-slot="badge"
      className={cn('badge fw-semibold', variants[variant ?? 'outline'], className)}
      {...props}
    />
  )
}

export { Badge }
