import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind class names intelligently, resolving conflicts.
 * Usage: cn('px-2 py-1', condition && 'bg-rose', 'px-4') → 'py-1 bg-rose px-4'
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
