import { cn } from '@/lib/utils'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  onClick,
  ...props
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontWeight: 700,
    borderRadius: '0.75rem',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease',
    border: 'none',
    userSelect: 'none',
  }

  const sizes = {
    sm:   { height: '34px', padding: '0 0.875rem', fontSize: '0.8125rem', gap: '0.375rem' },
    md:   { height: '40px', padding: '0 1.125rem', fontSize: '0.875rem',  gap: '0.5rem'   },
    lg:   { height: '46px', padding: '0 1.5rem',   fontSize: '0.9375rem', gap: '0.625rem' },
    icon: { height: '42px', width: '42px', padding: '0',                  gap: 0          },
  }

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #896BC5 0%, #D96D94 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 16px rgba(137,107,197,0.42)',
    },
    secondary: {
      background: 'var(--bg-card)',
      backdropFilter: 'var(--blur-glass)',
      WebkitBackdropFilter: 'var(--blur-glass)',
      border: '1px solid var(--border-card)',
      boxShadow: 'var(--shadow-card)',
      color: 'var(--text-primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.25)',
      color: '#ef4444',
    },
  }

  const combinedStyle = {
    ...base,
    ...sizes[size],
    ...variants[variant],
  }

  return (
    <button
      className={cn(className)}
      style={combinedStyle}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={e => {
        if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      {...props}
    >
      {loading && (
        <span style={{
          width: '14px', height: '14px',
          borderRadius: '50%',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
          marginRight: '0.375rem',
        }} />
      )}
      {children}
    </button>
  )
}
