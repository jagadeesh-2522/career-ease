import { createClient } from '@supabase/supabase-js'

const _url = process.env.SUPABASE_URL              ?? ''
const _key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// Lazy-initialised — only created when a request actually arrives.
// This prevents startup crashes when env vars are missing.
let _verifierClient = null

function getVerifier() {
  if (_verifierClient) return _verifierClient
  if (!_url || !_key) {
    throw Object.assign(
      new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env'),
      { status: 503 }
    )
  }
  _verifierClient = createClient(_url, _key, { auth: { autoRefreshToken: false, persistSession: false } })
  return _verifierClient
}

/**
 * requireAuth middleware.
 * Verifies the Supabase JWT from the Authorization header.
 * Attaches req.user and req.userId on success.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Missing authorisation token.' })
  }

  try {
    const client = getVerifier()
    const { data: { user }, error } = await client.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token.' })
    }
    req.user   = user
    req.userId = user.id
    next()
  } catch (err) {
    if (err.status === 503) return res.status(503).json({ error: err.message })
    return res.status(401).json({ error: 'Token verification failed.' })
  }
}
