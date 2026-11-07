import {
  CheckCircle2, AlertTriangle, TrendingUp, Lightbulb,
  Zap, BookOpen, Target, FileText, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

/* ── Score ring ──────────────────────────────────────────────────────────── */
function ScoreRing({ score }) {
  const size  = 120
  const r     = 48
  const circ  = 2 * Math.PI * r
  const fill  = circ * (1 - (score ?? 0) / 100)

  const colour =
    score >= 75 ? '#2EC4B6' :
    score >= 50 ? '#896BC5' :
    score >= 30 ? '#F6B99F' : '#D96D94'

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="10" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={colour}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={fill}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.875rem', fontWeight: 800, color: colour, lineHeight: 1 }}>
          {score ?? '—'}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          / 100
        </span>
      </div>
    </div>
  )
}

/* ── Section score bar ───────────────────────────────────────────────────── */
function SectionBar({ label, score, feedback, present }) {
  const [open, setOpen] = useState(false)
  const colour = !present ? 'var(--text-muted)' : score >= 70 ? '#2EC4B6' : score >= 45 ? '#896BC5' : '#D96D94'

  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
        }}
      >
        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </span>
        {!present ? (
          <Badge variant="error">Missing</Badge>
        ) : (
          <>
            <div style={{ width: '80px', height: '6px', borderRadius: '9999px', background: 'var(--border-subtle)', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ height: '100%', width: `${score}%`, background: colour, borderRadius: '9999px', transition: 'width 0.8s ease' }} />
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: colour, minWidth: '2.5rem', textAlign: 'right' }}>
              {score}
            </span>
          </>
        )}
        {open ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
      </button>
      {open && feedback && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '0.5rem', paddingLeft: '0.25rem' }}>
          {feedback}
        </p>
      )}
    </div>
  )
}

/* ── Tag chips ───────────────────────────────────────────────────────────── */
function TagList({ items, variant = 'default' }) {
  if (!items?.length) return <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None identified.</p>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {items.map((item, i) => <Badge key={i} variant={variant}>{item}</Badge>)}
    </div>
  )
}

/* ── Main report component ───────────────────────────────────────────────── */
export function ResumeAnalysisReport({ analysis, fileName, analysedAt }) {
  if (!analysis) return null

  const {
    overallScore, scoreExplanation,
    sections, technicalSkills, softSkills,
    strengths, weaknesses, missingSections,
    grammarAndClarity, improvementSuggestions,
    suggestedSummary, bulletPointRewrites,
  } = analysis

  const sectionLabels = {
    professionalSummary: 'Professional Summary',
    workExperience:      'Work Experience',
    education:           'Education',
    skills:              'Skills',
    projects:            'Projects',
    certifications:      'Certifications',
    achievements:        'Achievements',
  }

  const priorityVariant = { high: 'rose', medium: 'warning', low: 'lavender' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Header ────────────────────────────────────────── */}
      <Card>
        <CardContent style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          <ScoreRing score={overallScore} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Resume Score — {fileName}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '0.5rem' }}>
              {scoreExplanation}
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Analysed {analysedAt ? new Date(analysedAt).toLocaleString() : 'just now'}
            </p>
          </div>
          {missingSections?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignSelf: 'flex-start' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Missing
              </p>
              {missingSections.map(s => <Badge key={s} variant="error">{s}</Badge>)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Two-column grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Section scores */}
        <Card>
          <CardHeader><CardTitle>Section Assessment</CardTitle></CardHeader>
          <CardContent className="pt-3">
            {Object.entries(sectionLabels).map(([key, label]) => {
              const s = sections?.[key]
              return s ? (
                <SectionBar
                  key={key}
                  label={label}
                  score={s.score}
                  feedback={s.feedback}
                  present={s.present}
                />
              ) : null
            })}
            {/* Grammar */}
            {grammarAndClarity && (
              <SectionBar
                label="Grammar & Clarity"
                score={grammarAndClarity.score}
                feedback={grammarAndClarity.feedback}
                present={true}
              />
            )}
          </CardContent>
        </Card>

        {/* Strengths + Weaknesses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card>
            <CardHeader><CardTitle>Strengths</CardTitle></CardHeader>
            <CardContent className="pt-3">
              {strengths?.length ? (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {strengths.map((s, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={16} color="#2EC4B6" style={{ flexShrink: 0, marginTop: '2px' }} />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No strengths identified.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Areas to Improve</CardTitle></CardHeader>
            <CardContent className="pt-3">
              {weaknesses?.length ? (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {weaknesses.map((w, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <AlertTriangle size={16} color="#F6B99F" style={{ flexShrink: 0, marginTop: '2px' }} />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No issues found.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Skills ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Technical Skills Identified</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <TagList items={technicalSkills} variant="primary" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Soft Skills Identified</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <TagList items={softSkills} variant="lavender" />
          </CardContent>
        </Card>
      </div>

      {/* ── Improvement suggestions ───────────────────────── */}
      {improvementSuggestions?.length > 0 && (
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={16} color="#896BC5" />
              <CardTitle>Improvement Suggestions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {improvementSuggestions.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.875rem',
                    background: 'var(--bg-hover)',
                    borderRadius: '0.75rem',
                  }}
                >
                  <span style={{ marginTop: '2px', flexShrink: 0 }}>
                    <Target size={15} color="var(--text-muted)" />
                  </span>
                  <p style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {item.suggestion}
                  </p>
                  <Badge variant={priorityVariant[item.priority] ?? 'default'}>
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Suggested summary ─────────────────────────────── */}
      {suggestedSummary && (
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} color="#2EC4B6" />
              <CardTitle>Suggested Professional Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <p style={{
              fontSize: '0.9375rem', color: 'var(--text-primary)',
              lineHeight: 1.75,
              borderLeft: '3px solid #896BC5',
              paddingLeft: '1rem',
              fontStyle: 'italic',
            }}>
              {suggestedSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Bullet point rewrites ─────────────────────────── */}
      {bulletPointRewrites?.length > 0 && (
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} color="#D96D94" />
              <CardTitle>Bullet Point Improvements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {bulletPointRewrites.map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#D96D94', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px', flexShrink: 0 }}>Before</span>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55, textDecoration: 'line-through' }}>
                      {item.original}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#2EC4B6', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px', flexShrink: 0 }}>After</span>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.55, fontWeight: 500 }}>
                      {item.improved}
                    </p>
                  </div>
                  {i < bulletPointRewrites.length - 1 && (
                    <div style={{ height: '1px', background: 'var(--border-subtle)', marginTop: '1.25rem' }} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '0.5rem', lineHeight: 1.6 }}>
        This analysis is generated by AI and is intended as guidance only. It does not guarantee job selection or ATS outcomes.
      </p>
    </div>
  )
}
