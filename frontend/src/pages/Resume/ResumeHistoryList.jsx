import { FileText, Trash2, ChevronRight, AlertCircle, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

function statusVariant(status) {
  if (status === 'analysed') return 'teal'
  if (status === 'failed')   return 'error'
  return 'default'
}

/**
 * Resume history list.
 *
 * Props:
 *   resumes       — array of resume rows from the API
 *   selectedId    — currently selected/viewed resume id
 *   onSelect(r)   — called when the user clicks a row to view its analysis
 *   onDelete(id)  — called when the user clicks delete
 *   deleting      — id string of the resume currently being deleted (shows spinner)
 */
export function ResumeHistoryList({ resumes, selectedId, onSelect, onDelete, deleting }) {
  if (!resumes?.length) return null

  return (
    <Card>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={15} color="var(--text-muted)" />
          <CardTitle>Analysis History</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }} aria-label="Resume history">
          {resumes.map(r => {
            const latestScore = r.resume_analyses?.[0]?.overall_score
            const isSelected  = r.id === selectedId
            const isDeleting  = r.id === deleting

            return (
              <li key={r.id}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.875rem 0.75rem',
                    borderRadius: '0.75rem',
                    background: isSelected ? 'var(--bg-active-nav, rgba(137,107,197,0.12))' : 'transparent',
                    transition: 'background 0.15s',
                    cursor: r.status === 'analysed' ? 'pointer' : 'default',
                  }}
                  onClick={() => r.status === 'analysed' && onSelect(r)}
                  role={r.status === 'analysed' ? 'button' : undefined}
                  tabIndex={r.status === 'analysed' ? 0 : undefined}
                  onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && r.status === 'analysed') onSelect(r) }}
                  aria-label={`View analysis for ${r.file_name}`}
                  onMouseEnter={e => { if (r.status === 'analysed') e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--bg-active-nav, rgba(137,107,197,0.12))' : 'transparent' }}
                >
                  {/* File icon */}
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '0.625rem',
                    background: 'var(--bg-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileText size={18} color="var(--text-muted)" />
                  </div>

                  {/* File info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.875rem', fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {r.file_name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {new Date(r.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Score or status */}
                  {r.status === 'analysed' && latestScore != null ? (
                    <span style={{
                      fontSize: '1rem', fontWeight: 800,
                      color: latestScore >= 70 ? '#2EC4B6' : latestScore >= 50 ? '#896BC5' : '#D96D94',
                      flexShrink: 0,
                    }}>
                      {latestScore}
                    </span>
                  ) : (
                    <Badge variant={statusVariant(r.status)}>
                      {r.status === 'failed' ? 'Failed' : 'Pending'}
                    </Badge>
                  )}

                  {/* Arrow */}
                  {r.status === 'analysed' && (
                    <ChevronRight size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onDelete(r.id) }}
                    disabled={!!isDeleting}
                    aria-label={`Delete ${r.file_name}`}
                    style={{
                      background: 'none', border: 'none', cursor: isDeleting ? 'not-allowed' : 'pointer',
                      padding: '4px', borderRadius: '4px',
                      color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center',
                      opacity: isDeleting ? 0.5 : 1,
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#D96D94' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                  >
                    {isDeleting
                      ? <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'lumino-spin 0.7s linear infinite', display: 'inline-block' }} />
                      : <Trash2 size={15} />
                    }
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        <style>{`@keyframes lumino-spin { to { transform: rotate(360deg); } }`}</style>
      </CardContent>
    </Card>
  )
}
