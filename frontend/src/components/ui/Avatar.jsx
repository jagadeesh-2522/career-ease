import { cn } from '@/lib/utils'

export function Avatar({ src, name, size = 'md', className }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
    xl: 'h-14 w-14 text-lg',
  }

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0',
        'bg-gradient-to-br from-[#896BC5] to-[#D96D94] text-white font-semibold',
        sizes[size],
        className,
      )}
      aria-label={name || 'User avatar'}
    >
      {src ? (
        <img src={src} alt={name || 'User'} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
