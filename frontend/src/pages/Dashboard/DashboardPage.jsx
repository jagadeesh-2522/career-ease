import { FileText, MessageSquare, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCard } from './MetricCard'
import { ActivitySection } from './ActivitySection'
import { SkillsPanel } from './SkillsPanel'
import { NotificationsPanel } from './NotificationsPanel'
import { MilestonesPanel } from './MilestonesPanel'
import { ActivityChart } from '@/components/charts/ActivityChart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

/* ── Metric card definitions ───────────────────────────────────── */
// Job Matches (index 2) and Roadmap Progress (index 4) are temporarily hidden.
// Restore by adding them back here.
const METRICS = [
  {
    index: 1,
    icon: FileText,
    label: 'Resume Score',
    isEmpty: true,
    value: null,
    subtext: 'Upload a resume to get your score',
  },
  {
    index: 3,
    icon: MessageSquare,
    label: 'Interview Performance',
    isEmpty: true,
    value: null,
    subtext: 'Complete a mock interview first',
  },
]

/* ── Welcome banner ────────────────────────────────────────────── */
function WelcomeCard() {
  return (
    <div
      className="glass"
      style={{
        borderRadius: 'var(--radius-card)',
        padding: '1.5rem 1.75rem',
        /* Override glass background with a richer accent gradient */
        background:
          'linear-gradient(135deg, rgba(137,107,197,0.28) 0%, rgba(217,109,148,0.20) 55%, rgba(91,155,213,0.15) 100%)',
        border: '1px solid rgba(255,255,255,0.28)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Decorative blobs inside the card */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-40%', right: '-5%',
        width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,109,148,0.30) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-50%', left: '30%',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,155,213,0.22) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
           className="sm:flex-row sm:items-center">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.015em',
            marginBottom: '0.375rem',
          }}>
            Welcome to Lumino 🎉
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            Start by uploading your resume. Lumino will analyse it, score it, and help you
            find matching jobs, practise interviews, and build your personalised career roadmap.
          </p>
        </div>
        <Link to="/resume" style={{ flexShrink: 0, alignSelf: 'flex-start' }}
              className="sm:self-center">
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.375rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #896BC5 0%, #D96D94 100%)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 18px rgba(137,107,197,0.45)',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Upload size={15} />
            Upload Resume
          </button>
        </Link>
      </div>
    </div>
  )
}

/* ── Dashboard page ─────────────────────────────────────────────── */
export function DashboardPage() {
  const activities    = []
  const skills        = []
  const notifications = []
  const milestones    = []
  const chartData     = []

  return (
    <div className="flex flex-col" style={{ gap: '1.25rem', paddingTop: '0.75rem', paddingBottom: '2rem' }}>

      {/* ── Welcome ─────────────────────────────────── */}
      <WelcomeCard />

      {/* ── 4 Metric cards ──────────────────────────── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        style={{ gap: '1rem' }}
        aria-label="Key performance metrics"
      >
        {METRICS.map(m => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* ── Chart + Skills ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_290px]" style={{ gap: '1rem', alignItems: 'start' }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Career Progress Analytics</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div style={{ height: '288px' }}>
              <ActivityChart data={chartData} />
            </div>
          </CardContent>
        </Card>
        <SkillsPanel skills={skills} />
      </div>

      {/* ── Activity + Right column ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px]" style={{ gap: '1rem', alignItems: 'start' }}>
        <ActivitySection activities={activities} />
        <div className="flex flex-col" style={{ gap: '1rem' }}>
          <NotificationsPanel notifications={notifications} />
          <MilestonesPanel milestones={milestones} />
        </div>
      </div>

    </div>
  )
}
