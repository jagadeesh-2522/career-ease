import { cn } from '@/lib/utils'

export function EmptyState({ icon, title, body, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center py-8 px-6',
        className,
      )}
    >
      {icon && (
        <span style={{ color: 'var(--text-muted)', opacity: 0.40 }}>
          {icon}
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {title}
        </p>
        {body && (
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            maxWidth: '24ch',
            lineHeight: 1.55,
            margin: '0 auto',
          }}>
            {body}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: '0.25rem' }}>{action}</div>}
    </div>
  )
}
