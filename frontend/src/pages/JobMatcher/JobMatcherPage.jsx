import { Briefcase, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export function JobMatcherPage() {
  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Job Description Matcher</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Paste a job description to see how well your resume matches — with a detailed gap analysis.
        </p>
      </div>

      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={<Briefcase size={40} />}
            title="No job descriptions analysed yet"
            body="Paste or upload a job description and Lumino will compare it against your resume, showing a match score and skill gaps."
          />
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-4">
            Requires a resume upload and Supabase authentication — coming in Phase 2
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={<Search size={28} />}
            title="No match history"
            body="Your previous job description analyses and match scores will appear here."
          />
        </CardContent>
      </Card>
    </div>
  )
}
