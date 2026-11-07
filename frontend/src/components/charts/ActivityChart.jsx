import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

/* Chart line colours — match metric card gradients for visual consistency */
const LINES = [
  { key: 'resumeScore',    name: 'Resume Score',    color: '#D96D94', gradId: 'gA' },
  { key: 'interviewScore', name: 'Interview Score', color: '#896BC5', gradId: 'gB' },
  { key: 'jobMatches',     name: 'Job Matches',     color: '#2EC4B6', gradId: 'gC' },
]

function GlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid var(--border-card)',
      boxShadow: 'var(--shadow-elevated)',
      borderRadius: '0.875rem',
      padding: '0.875rem 1.125rem',
      minWidth: '155px',
    }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        {label}
      </p>
      {payload.map(entry => (
        <div key={entry.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.25rem', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{entry.name}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ActivityChart({ data = [] }) {
  if (!data.length) {
    return (
      <EmptyState
        icon={<TrendingUp size={38} />}
        title="No activity data yet"
        body="Your career analytics will appear here after you use Resume, Interview, or Roadmap features."
        className="h-full min-h-[200px]"
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <defs>
          {LINES.map(l => (
            <linearGradient key={l.gradId} id={l.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={l.color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={l.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
        <XAxis
          dataKey="week"
          axisLine={false} tickLine={false}
          tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: '"Poppins", sans-serif' }}
        />
        <YAxis
          axisLine={false} tickLine={false}
          tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: '"Poppins", sans-serif' }}
        />
        <Tooltip content={<GlassTooltip />} />
        <Legend
          iconType="circle" iconSize={8}
          wrapperStyle={{ fontSize: '12px', fontFamily: '"Poppins", sans-serif', paddingTop: '14px', color: 'var(--text-secondary)' }}
        />
        {LINES.map(l => (
          <Area
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color}
            strokeWidth={2.5}
            fill={`url(#${l.gradId})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: l.color }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
