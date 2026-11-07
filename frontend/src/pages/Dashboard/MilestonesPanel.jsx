import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Flag } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Upcoming learning milestones panel.
 */
export function MilestonesPanel({ milestones = [] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming Milestones</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {milestones.length === 0 ? (
          <EmptyState
            icon={<Flag size={28} />}
            title="No milestones yet"
            body="Generate your career roadmap to see personalised learning milestones here."
          />
        ) : (
          <ol className="space-y-3" aria-label="Upcoming milestones">
            {milestones.map((m, i) => (
              <li key={m.id} className="flex items-start gap-3">
                {/* Step indicator */}
                <div
                  className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5',
                    m.completed
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-gradient-to-br from-[#896BC5] to-[#D96D94] text-white',
                  )}
                  aria-label={m.completed ? 'Completed' : `Step ${i + 1}`}
                >
                  {m.completed ? '✓' : i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{m.title}</p>
                  {m.due && (
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Due {m.due}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
