import { Map, Compass } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export function RoadmapPage() {
  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Personalised Career Roadmap</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Get a personalised learning roadmap with verified resources tailored to your target role and current skill gaps.
        </p>
      </div>

      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<Compass size={40} />}
            title="No roadmap generated yet"
            body="Tell Lumino your target role and it will build a personalised roadmap with curated, verified learning resources and milestones."
            action={null}
          />
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-4">
            Requires a resume analysis and Gemini integration — coming in Phase 5
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={<Map size={28} />}
            title="No roadmap history"
            body="Previously generated roadmaps and your progress on each will be shown here."
          />
        </CardContent>
      </Card>
    </div>
  )
}
