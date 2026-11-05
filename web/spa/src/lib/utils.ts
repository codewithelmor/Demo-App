import { clsx, type ClassValue } from 'clsx'

/** Joins CSS class names, skipping falsy values. Example: `cn('btn', isActive && 'active')` gives `'btn active'`. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
