import { cn } from '@/lib/utils'

const variants = {
  default:  { background: 'rgba(188,165,232,0.18)', color: 'var(--text-muted)' },
  primary:  { background: 'rgba(137,107,197,0.18)', color: '#896BC5' },
  rose:     { background: 'rgba(217,109,148,0.18)', color: '#D96D94' },
  peach:    { background: 'rgba(246,185,159,0.22)', color: '#b86035' },
  lavender: { background: 'rgba(188,165,232,0.22)', color: '#7c5abf' },
  teal:     { background: 'rgba(46,196,182,0.18)',  color: '#1a9e94' },
  success:  { background: 'rgba(52,211,153,0.15)',  color: '#059669' },
  warning:  { background: 'rgba(251,191,36,0.18)',  color: '#b45309' },
  error:    { background: 'rgba(239,68,68,0.15)',   color: '#dc2626' },
}

export function Badge({ children, variant = 'default', className, ...props }) {
  const style = variants[variant] ?? variants.default
  return (
    <span
      className={cn(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}
