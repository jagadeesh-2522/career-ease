import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import logoSrc from '@/assets/logo.png'

/* Inline Google wordmark SVG — unchanged from Phase 1 */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

function FieldError({ message }) {
  if (!message) return null
  return (
    <p role="alert" style={{ fontSize: '0.75rem', color: '#D96D94', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <AlertCircle size={12} style={{ flexShrink: 0 }} />
      {message}
    </p>
  )
}

export function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname ?? '/'

  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,         setError]         = useState('')

  // ── Validation helpers ─────────────────────────────────────────────
  const validate = () => {
    if (!email.trim()) return 'Email address is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.'
    if (!password) return 'Password is required.'
    return null
  }

  // ── Email / password login ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    const { error: authError } = await signIn({ email: email.trim(), password })
    setLoading(false)

    if (authError) {
      // Map common Supabase error messages to user-friendly text
      if (authError.message.toLowerCase().includes('invalid login credentials')) {
        setError('Incorrect email or password. Please try again.')
      } else if (authError.message.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email address before signing in. Check your inbox.')
      } else {
        setError(authError.message)
      }
      return
    }

    navigate(from, { replace: true })
  }

  // ── Google OAuth ───────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    const { error: authError } = await signInWithGoogle()
    // If OAuth initiated successfully the page will redirect — no need to setLoading(false).
    // If there was an immediate error (e.g., provider not configured), show it.
    if (authError) {
      setGoogleLoading(false)
      setError('Google sign-in is not available. Please check that the Google provider is configured in your Supabase project.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, var(--bg-grad-a) 0%, var(--bg-grad-b) 33%, var(--bg-grad-c) 66%, var(--bg-grad-d) 100%)',
      }}
    >
      {/* Background blobs — unchanged from Phase 1 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-16 h-80 w-80 rounded-full bg-[#896BC5]/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-[#D96D94]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo — unchanged from Phase 1 */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logoSrc}
            alt="Lumino logo"
            style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '0.875rem' }}
          />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {APP_NAME}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} noValidate>

            {/* Global error banner */}
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
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                {error}
              </div>
            )}

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem',
                width: '100%',
                padding: '0.625rem 1rem',
                borderRadius: '0.75rem',
                background: 'var(--bg-card)',
                backdropFilter: 'var(--blur-glass)',
                WebkitBackdropFilter: 'var(--blur-glass)',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-card)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer',
                opacity: (loading || googleLoading) ? 0.6 : 1,
                transition: 'opacity 0.15s, transform 0.15s',
                marginBottom: '1.25rem',
              }}
              onMouseEnter={e => { if (!loading && !googleLoading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {googleLoading
                ? <span style={{ width: '17px', height: '17px', borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'lumino-spin 0.7s linear infinite', display: 'inline-block' }} />
                : <GoogleIcon />
              }
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
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
                disabled={loading || googleLoading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.75rem', color: '#896BC5', fontWeight: 500, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  icon={<Lock size={15} />}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  disabled={loading || googleLoading}
                  autoComplete="current-password"
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

            <Button
              variant="primary"
              type="submit"
              loading={loading}
              disabled={loading || googleLoading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Sign In
            </Button>

            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                style={{ color: '#896BC5', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
      <style>{`@keyframes lumino-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
