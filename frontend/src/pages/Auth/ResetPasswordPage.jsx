import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import logoSrc from '@/assets/logo.png'

export function ResetPasswordPage() {
  const { updatePassword, user } = useAuth()
  const navigate = useNavigate()

  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [success,         setSuccess]         = useState(false)
  const [error,           setError]           = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!password)                      { setError('Please enter a new password.'); return }
    if (password.length < 8)            { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPassword)   { setError('Passwords do not match.'); return }

    setLoading(true)
    const { error: authError } = await updatePassword(password)
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSuccess(true)
    setTimeout(() => navigate('/', { replace: true }), 2500)
  }

  const pageBackground = {
    background: 'linear-gradient(135deg, var(--bg-grad-a) 0%, var(--bg-grad-b) 33%, var(--bg-grad-c) 66%, var(--bg-grad-d) 100%)',
  }

  // If there is no active session, the user probably visited the URL directly
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={pageBackground}>
        <div className="glass rounded-2xl p-8 w-full max-w-md text-center">
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            Invalid or expired link
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            This password reset link is no longer valid. Please request a new one.
          </p>
          <a
            href="/forgot-password"
            style={{ fontSize: '0.875rem', color: '#896BC5', fontWeight: 600, textDecoration: 'none' }}
          >
            Request new link
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={pageBackground}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-16 h-80 w-80 rounded-full bg-[#896BC5]/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[#D96D94]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
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
          {success ? (
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
                  Password updated
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Redirecting you to your dashboard…
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                  Set a new password
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Choose a strong password of at least 8 characters.
                </p>
              </div>

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

              {/* New password */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="password"
                  style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}
                >
                  New password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    icon={<Lock size={15} />}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    disabled={loading}
                    autoComplete="new-password"
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="confirm-password"
                  style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}
                >
                  Confirm new password
                </label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your new password"
                  icon={<Lock size={15} />}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <Button
                variant="primary"
                type="submit"
                loading={loading}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Update password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
