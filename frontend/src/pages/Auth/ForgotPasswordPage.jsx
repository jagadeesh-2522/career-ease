import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import logoSrc from '@/assets/logo.png'

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()

  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmed = email.trim()
    if (!trimmed) { setError('Please enter your email address.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    const { error: authError } = await sendPasswordReset(trimmed)
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSubmitted(true)
  }

  const pageBackground = {
    background: 'linear-gradient(135deg, var(--bg-grad-a) 0%, var(--bg-grad-b) 33%, var(--bg-grad-c) 66%, var(--bg-grad-d) 100%)',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={pageBackground}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-16 h-80 w-80 rounded-full bg-[#896BC5]/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[#D96D94]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logoSrc}
            alt="Lumino logo"
            style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '0.875rem' }}
          />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {APP_NAME}
          </h1>
        </div>

        <div className="glass rounded-2xl p-8">
          {submitted ? (
            /* ── Success state ─────────────────────────────── */
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(46,196,182,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={28} color="#2EC4B6" />
              </div>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Check your email
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  We sent a password reset link to <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>.
                  It may take a few minutes to arrive.
                </p>
              </div>
              <Link
                to="/login"
                style={{ fontSize: '0.875rem', color: '#896BC5', fontWeight: 600, textDecoration: 'none', marginTop: '0.5rem' }}
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ────────────────────────────────── */
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                  Reset your password
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  Enter the email address for your Lumino account and we'll send you a reset link.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  style={{
                    background: 'rgba(217,109,148,0.12)',
                    border: '1px solid rgba(217,109,148,0.30)',
                    borderRadius: '0.625rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem',
                    color: '#D96D94',
                    marginBottom: '1rem',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="space-y-1.5" style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail size={15} />}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              <Button
                variant="primary"
                className="w-full"
                type="submit"
                loading={loading}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Send reset link
              </Button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <Link
                  to="/login"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
