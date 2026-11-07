import { cn } from '@/lib/utils'

export function Card({ children, className, glow, style, ...props }) {
  return (
    <div
      className={cn('glass', className)}
      style={{
        borderRadius: 'var(--radius-card)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        ...(glow ? {
          cursor: 'default',
        } : {}),
        ...style,
      }}
      {...(glow ? {
        onMouseEnter: e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-elevated)' },
        onMouseLeave: e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'var(--shadow-card)' },
      } : {})}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-6 pt-5 pb-0', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn('label-caps', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('px-6 pb-5 pt-0 flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  )
}
