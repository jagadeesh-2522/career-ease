import { useState } from 'react'
import { User, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/context/AuthContext'

export function SettingsPage() {
  const { user, profile, updateProfile } = useAuth()

  const [fullName,  setFullName]  = useState(profile?.full_name  || user?.user_metadata?.full_name  || '')
  const [saving,    setSaving]    = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  const displayEmail  = profile?.email  || user?.email || ''
  const avatarUrl     = profile?.avatar_url || user?.user_metadata?.avatar_url || null
  const displayName   = fullName || displayEmail.split('@')[0] || 'User'

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!fullName.trim()) { setError('Full name cannot be empty.'); return }
    if (fullName.trim().length < 2) { setError('Please enter your full name.'); return }

    setSaving(true)
    const { error: updateError } = await updateProfile({ full_name: fullName.trim() })
    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Manage your account and profile information.
        </p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Avatar + name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Avatar src={avatarUrl} name={displayName} size="lg" />
            <div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {displayName}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {displayEmail}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} noValidate>
            {/* Success banner */}
            {success && (
              <div
                role="status"
                style={{
                  background: 'rgba(46,196,182,0.12)',
                  border: '1px solid rgba(46,196,182,0.30)',
                  borderRadius: '0.625rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8125rem',
                  color: '#2EC4B6',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle size={15} style={{ flexShrink: 0 }} />
                Profile updated successfully.
              </div>
            )}

            {/* Error banner */}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Full name */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="fullname"
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}
              >
                Full name
              </label>
              <Input
                id="fullname"
                type="text"
                placeholder="Your full name"
                icon={<User size={15} />}
                value={fullName}
                onChange={e => { setFullName(e.target.value); setError(''); setSuccess(false) }}
                disabled={saving}
                autoComplete="name"
              />
            </div>

            {/* Email — read-only */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="email"
                style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}
              >
                Email address
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
                  (cannot be changed here)
                </span>
              </label>
              <Input
                id="email"
                type="email"
                value={displayEmail}
                icon={<Mail size={15} />}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            <Button
              variant="primary"
              type="submit"
              loading={saving}
              disabled={saving}
              style={{ gap: '0.5rem' }}
            >
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account info card */}
      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.5rem' }}>
            {[
              { label: 'User ID',     value: user?.id ?? '—' },
              { label: 'Provider',    value: user?.app_metadata?.provider ?? 'email' },
              { label: 'Joined',      value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
            ].map(row => (
              <div key={row.label} style={{ display: 'contents' }}>
                <dt style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center' }}>
                  {row.label}
                </dt>
                <dd style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  fontFamily: row.label === 'User ID' ? 'monospace' : 'inherit',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
