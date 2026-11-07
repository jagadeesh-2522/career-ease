/**
 * Metric card — one of the four top-row stat cards.
 *
 * index 1 → rose/pink    (Resume Score)
 * index 2 → coral/peach  (Job Matches)
 * index 3 → lilac/lavender (Interview Performance)
 * index 4 → sky/teal     (Roadmap Progress)
 *
 * Icon containers use solid gradient backgrounds (.metric-icon-N)
 * defined in globals.css, matching IMAGE 3's vivid icon treatment.
 */
export function MetricCard({ icon: Icon, label, value, subtext, isEmpty, index }) {
  return (
    <div
      className="glass"
      style={{
        borderRadius: 'var(--radius-card)',
        flex: '1 1 0',
        minWidth: 0,
        cursor: 'default',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      <div style={{ padding: '1.375rem 1.375rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>

        {/* ── Icon container — vivid gradient blob ──── */}
        <div
          className={`metric-icon-${index}`}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <Icon size={22} color="#ffffff" strokeWidth={2} />
        </div>

        {/* ── Text ─────────────────────────────────── */}
        <div style={{ minWidth: 0, flex: 1, paddingTop: '2px' }}>
          <p className="label-caps" style={{ marginBottom: '0.375rem' }}>
            {label}
          </p>

          {isEmpty ? (
            <>
              <p style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                lineHeight: 1,
                color: 'var(--text-muted)',
                opacity: 0.45,
              }}>
                —
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.5rem',
                lineHeight: 1.4,
              }}>
                {subtext}
              </p>
            </>
          ) : (
            <>
              <p style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                lineHeight: 1,
                color: 'var(--text-primary)',
              }}>
                {value}
              </p>
              {subtext && (
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {subtext}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
