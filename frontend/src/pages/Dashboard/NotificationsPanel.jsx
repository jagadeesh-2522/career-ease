import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

/**
 * Notifications panel.
 * Shows empty state for new users.
 */
export function NotificationsPanel({ notifications = [] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={28} />}
            title="You're all caught up"
            body="Notifications about your resume analyses, interviews and milestones will appear here."
          />
        ) : (
          <ul className="space-y-2" aria-label="Notifications">
            {notifications.map(n => (
              <li
                key={n.id}
                className={`flex items-start gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0 ${!n.read ? 'opacity-100' : 'opacity-70'}`}
              >
                <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-2 ${!n.read ? 'bg-[#D96D94]' : 'bg-[var(--border-card)]'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--text-primary)]">{n.message}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{n.timestamp}</p>
                </div>
                {n.type && <Badge variant="lavender">{n.type}</Badge>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
