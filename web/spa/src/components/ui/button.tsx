import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button'
import type { ComponentProps, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

type Variant = 'default' | 'secondary' | 'success' | 'warning' | 'outline' | 'ghost' | 'destructive'
type Size = 'default' | 'sm' | 'icon'

/** Maps our variant names to Material UI `variant` + `color`. */
const looks: Record<Variant, Pick<MuiButtonProps, 'variant' | 'color'>> = {
  default: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'contained', color: 'secondary' },
  success: { variant: 'contained', color: 'success' },
  warning: { variant: 'contained', color: 'warning' },
  outline: { variant: 'outlined', color: 'primary' },
  ghost: { variant: 'text', color: 'primary' },
  destructive: { variant: 'contained', color: 'error' },
}
const sizes: Record<Size, MuiButtonProps['size']> = {
  default: 'medium',
  sm: 'small',
  icon: 'medium',
}

interface LookProps {
  variant?: Variant | null | undefined
  size?: Size | null | undefined
}

function muiProps({ variant, size }: LookProps): MuiButtonProps {
  return {
    ...looks[variant ?? 'default'],
    size: sizes[size ?? 'default'],
    ...(size === 'icon' ? { sx: { minWidth: 0, px: 1.5 } } : {}),
  }
}

/**
 * The standard button (Material UI Button). Variants: `default` (main action), `secondary`, `outline`,
 * `ghost`, `warning`, `success`, `destructive` (dangerous action). Sizes: `default`, `sm`, `icon`
 * (icon-only buttons need an `aria-label`).
 */
function Button({ variant, size, ...props }: Omit<ComponentProps<'button'>, 'color'> & LookProps) {
  return <MuiButton {...muiProps({ variant, size })} {...props} />
}

/** A router link that looks like a button: `<LinkButton to="/products" variant="outline">Back</LinkButton>`. */
function LinkButton({
  variant,
  size,
  children,
  ...props
}: LinkProps & LookProps & { children?: ReactNode }) {
  return (
    <MuiButton component={Link} {...muiProps({ variant, size })} {...(props as MuiButtonProps)}>
      {children}
    </MuiButton>
  )
}

export { Button, LinkButton }
