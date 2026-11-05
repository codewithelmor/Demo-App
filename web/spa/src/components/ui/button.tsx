import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'secondary' | 'success' | 'warning' | 'outline' | 'ghost' | 'destructive'
type Size = 'default' | 'sm' | 'icon'

const variantClass: Record<Variant, string> = {
  default: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  warning: 'btn-warning',
  outline: 'btn-outline-secondary',
  ghost: 'btn-link text-decoration-none',
  destructive: 'btn-danger',
}
const sizeClass: Record<Size, string> = {
  default: '',
  sm: 'btn-sm',
  icon: 'd-inline-flex align-items-center justify-content-center px-3',
}

/**
 * Class names for each button look (Bootstrap `btn` classes). Also used on links
 * (`<Link className={buttonVariants()}>`) so a link can look like a button.
 */
function buttonVariants({
  variant,
  size,
}: { variant?: Variant | null | undefined; size?: Size | null | undefined } = {}) {
  return cn('btn', variantClass[variant ?? 'default'], sizeClass[size ?? 'default'])
}

/** All normal `<button>` props, plus `variant`, `size` and `asChild`. */
type ButtonProps = ComponentProps<'button'> & {
  variant?: Variant | null | undefined
  size?: Size | null | undefined
  /** When true, the button's styles and behaviour are applied to its single child element instead of a `<button>`. */
  asChild?: boolean
}

/**
 * The standard button. Variants: `default` (main action), `secondary` (used on the navbar), `outline`, `ghost`, `destructive` (dangerous action).
 * Sizes: `default`, `sm`, `icon` (for icon-only buttons; give them an `aria-label`).
 */
function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
