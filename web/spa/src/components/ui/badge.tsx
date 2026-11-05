import Chip from '@mui/material/Chip'
import type { ComponentProps } from 'react'

/** Looks of a badge: `default` (filled), `outline` (default), `muted` (grey). */
const variants = {
  default: { variant: 'filled', color: 'primary' },
  outline: { variant: 'outlined', color: 'default' },
  muted: { variant: 'filled', color: 'default' },
} as const

/** A small label for a status or a count (Material UI Chip). */
function Badge({
  variant = 'outline',
  children,
}: Omit<ComponentProps<'span'>, 'color'> & { variant?: keyof typeof variants | null | undefined }) {
  const look = variants[variant ?? 'outline']
  return (
    <Chip
      size="small"
      label={children}
      variant={look.variant}
      color={look.color}
      sx={{ fontWeight: 600 }}
    />
  )
}

export { Badge }
