import { cn } from '@/lib/utils'

const glassInputBase = {
  width: '100%',
  background: 'var(--bg-card)',
  backdropFilter: 'var(--blur-glass)',
  WebkitBackdropFilter: 'var(--blur-glass)',
  border: '1px solid var(--border-card)',
  boxShadow: 'var(--shadow-card)',
  borderRadius: '0.75rem',
  fontSize: '0.875rem',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.18s, box-shadow 0.18s',
}

export function Input({ className, icon, style, ...props }) {
  const handleFocus = e => {
    e.target.style.borderColor = '#896BC5'
    e.target.style.boxShadow = '0 0 0 3px rgba(137,107,197,0.18), var(--shadow-card)'
  }
  const handleBlur = e => {
    e.target.style.borderColor = ''
    e.target.style.boxShadow = 'var(--shadow-card)'
  }

  if (icon) {
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{
          position: 'absolute',
          left: '0.875rem',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}>
          {icon}
        </span>
        <input
          className={cn(className)}
          style={{
            ...glassInputBase,
            padding: '0.625rem 0.875rem 0.625rem 2.5rem',
            ...style,
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
    )
  }

  return (
    <input
      className={cn(className)}
      style={{
        ...glassInputBase,
        padding: '0.625rem 0.875rem',
        ...style,
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  )
}
