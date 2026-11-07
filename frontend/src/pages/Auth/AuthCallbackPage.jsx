import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * AuthCallbackPage — handles the redirect back from:
 *   - Google OAuth flow
 *   - Email confirmation link
 *
 * Supabase JS detectSessionInUrl=true will automatically exchange
 * the URL fragment/code for a session. This page waits for that,
 * then redirects to the dashboard (or intended destination).
 *
 * Route: /auth/callback
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    // The Supabase client detects the auth code in the URL and exchanges it.
    // We listen for the resulting session via onAuthStateChange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/', { replace: true })
        }
        if (event === 'TOKEN_REFRESHED' && session) {
          navigate('/', { replace: true })
        }
      },
    )

    // Fallback: if there is an error in the URL hash, display it
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const errorDesc  = hashParams.get('error_description')
    if (errorDesc) {
      setError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
    }

    // Fallback timeout — if nothing happens in 8 seconds, go to login
    const timeout = setTimeout(() => {
      navigate('/login', { replace: true })
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--bg-grad-a) 0%, var(--bg-grad-b) 33%, var(--bg-grad-c) 66%, var(--bg-grad-d) 100%)',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '320px', textAlign: 'center' }}>
        {error ? (
          <>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#D96D94', fontFamily: 'Poppins, sans-serif' }}>
              Authentication error
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'Poppins, sans-serif' }}>
              {error}
            </p>
            <a
              href="/login"
              style={{ fontSize: '0.875rem', color: '#896BC5', fontFamily: 'Poppins, sans-serif', textDecoration: 'underline' }}
            >
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '3px solid rgba(137,107,197,0.25)',
              borderTopColor: '#896BC5',
              animation: 'lumino-spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'Poppins, sans-serif' }}>
              Completing sign in…
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes lumino-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
