import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

/**
 * AuthProvider — wraps the whole app and exposes auth state + operations.
 *
 * State transitions:
 *   loading=true                     → initial session check in progress
 *   loading=false, user=null         → unauthenticated
 *   loading=false, user=<User>       → authenticated
 *
 * The `profile` field holds the row from public.profiles once fetched.
 * It may be null briefly after login while the profile is being loaded.
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)   // true until first session check

  // ── Fetch profile row from public.profiles ────────────────────────────
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      setProfile(data)
    } catch {
      // Profile may not exist yet (race with trigger) — not a fatal error
      setProfile(null)
    }
  }, [])

  // ── Bootstrap: restore session on mount, then listen for changes ──────
  useEffect(() => {
    let mounted = true

    // 1. Get any existing session from localStorage immediately
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
      if (s?.user) fetchProfile(s.user.id)
    })

    // 2. Subscribe to future auth events (login, logout, token refresh, OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        if (!mounted) return
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          fetchProfile(s.user.id)
        } else {
          setProfile(null)
        }
      },
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // ── Auth operations ───────────────────────────────────────────────────

  /**
   * Register with email + password.
   * The on_auth_user_created DB trigger will create the profile row.
   * Returns { error } — error is null on success.
   */
  const signUp = useCallback(async ({ email, password, fullName }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // redirect used if email confirmation is enabled in Supabase dashboard
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }, [])

  /**
   * Sign in with email + password.
   * Returns { error }.
   */
  const signIn = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  /**
   * Initiate Google OAuth flow.
   * The browser will be redirected to Google and then back to /auth/callback.
   * Returns { error }.
   */
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }, [])

  /**
   * Send a password reset email.
   * Returns { error }.
   */
  const sendPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }, [])

  /**
   * Set a new password after clicking a reset link.
   * Must be called while the user has an active session from the reset link.
   * Returns { error }.
   */
  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error }
  }, [])

  /**
   * Sign out. Clears the Supabase session from localStorage.
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // State is cleaned up by the onAuthStateChange listener above
  }, [])

  /**
   * Update profile fields in public.profiles.
   * Caller provides an object with the fields to update.
   * Returns { error }.
   */
  const updateProfile = useCallback(async (fields) => {
    if (!user) return { error: new Error('Not authenticated') }
    const { error } = await supabase
      .from('profiles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (!error) {
      // Refresh local profile cache
      await fetchProfile(user.id)
    }
    return { error }
  }, [user, fetchProfile])

  const value = {
    user,           // Supabase User object or null
    profile,        // public.profiles row or null
    session,        // Supabase Session or null
    loading,        // true while the initial session check is running
    signUp,
    signIn,
    signInWithGoogle,
    sendPasswordReset,
    updatePassword,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth — consume auth context in any component.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
