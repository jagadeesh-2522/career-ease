import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Zap } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

/**
 * Skills to Improve panel.
 * Shows an empty state until the user has run at least one Resume analysis.
 */
export function SkillsPanel({ skills = [] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Skills to Improve</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {skills.length === 0 ? (
          <EmptyState
            icon={<Zap size={28} />}
            title="No skills analysed yet"
            body="Upload and analyse your resume to see which skills to focus on."
          />
        ) : (
          <ul className="space-y-2" aria-label="Skills to improve">
            {skills.map(skill => (
              <li
                key={skill.name}
                className="flex items-center justify-between gap-2 py-1.5 border-b border-[var(--border-subtle)] last:border-0"
              >
                <span className="text-sm text-[var(--text-primary)] font-medium">
                  {skill.name}
                </span>
                <Badge variant={skill.priority === 'high' ? 'rose' : skill.priority === 'medium' ? 'peach' : 'lavender'}>
                  {skill.priority}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
