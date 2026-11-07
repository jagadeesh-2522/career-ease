import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { ClipboardList, FileText, MessageSquare, Briefcase, Map } from 'lucide-react'

const TYPE_META = {
  resume:    { label: 'Resume',    icon: FileText,      variant: 'primary' },
  interview: { label: 'Interview', icon: MessageSquare, variant: 'rose' },
  job:       { label: 'Job Match', icon: Briefcase,     variant: 'peach' },
  roadmap:   { label: 'Roadmap',   icon: Map,           variant: 'lavender' },
}

/**
 * Recent activity list. Accepts an array of activity objects:
 * { id, type, title, description, timestamp }
 */
export function ActivitySection({ activities = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {activities.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={28} />}
            title="No activity yet"
            body="Your recent sessions across all modules will appear here."
          />
        ) : (
          <ul className="space-y-3" aria-label="Recent activity">
            {activities.map(item => {
              const meta = TYPE_META[item.type] ?? TYPE_META.resume
              const Icon = meta.icon
              return (
                <li key={item.id} className="flex items-start gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0">
                  <div className="h-8 w-8 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-[var(--text-secondary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.title}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{item.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <span className="text-[10px] text-[var(--text-muted)]">{item.timestamp}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
