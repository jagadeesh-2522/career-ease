import { HelpCircle, BookOpen, MessageCircle, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const FAQ = [
  {
    q: 'What file formats does Lumino support for resumes?',
    a: 'Lumino supports PDF and DOCX resume formats. For best results, use text-based PDFs rather than scanned image PDFs.',
  },
  {
    q: 'How does the Resume Score work?',
    a: 'Your resume is analysed by an AI model that evaluates structure, content relevance, keyword optimisation, and readability. The score is out of 100.',
  },
  {
    q: 'Is my resume data stored securely?',
    a: 'Yes. Your data is stored in Supabase with Row-Level Security policies, meaning only you can access your own data.',
  },
  {
    q: 'Can I save multiple resume versions?',
    a: 'Yes. Lumino supports multiple resume versions so you can track how your resume improves over time.',
  },
  {
    q: 'How does the AI Mock Interview work?',
    a: 'Select a job role, interview type (technical, behavioural, etc.) and difficulty level. The AI generates contextual questions and adapts them based on your previous answers.',
  },
]

export function HelpPage() {
  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Help & Support</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Find answers to common questions about Lumino.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BookOpen,      label: 'Documentation',  desc: 'Read the full guide' },
          { icon: MessageCircle, label: 'Community',       desc: 'Join the discussion' },
          { icon: Mail,          label: 'Contact Support', desc: 'Get in touch with us' },
        ].map(item => (
          <Card key={item.label} glow className="cursor-default">
            <CardContent className="flex items-center gap-3 py-4">
              <item.icon size={20} className="text-[var(--color-lilac)] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <dl className="space-y-5">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-[var(--border-subtle)] last:border-0 pb-4 last:pb-0">
                <dt className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                  {item.q}
                </dt>
                <dd className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
