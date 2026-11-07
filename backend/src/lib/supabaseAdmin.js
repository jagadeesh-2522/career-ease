import { createClient } from '@supabase/supabase-js'

const _url = process.env.SUPABASE_URL              ?? ''
const _key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

let _adminClient = null

/**
 * Lazy-initialised Supabase admin client.
 * Uses the SERVICE ROLE key — bypasses RLS for backend operations.
 * Only created when first used, so missing env vars cause request-time
 * errors rather than crashing the server at startup.
 */
export function getSupabaseAdmin() {
  if (_adminClient) return _adminClient
  if (!_url || !_key) {
    throw Object.assign(
      new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env'),
      { status: 503 }
    )
  }
  _adminClient = createClient(_url, _key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return _adminClient
}

/**
 * Named export for convenience — same lazy client.
 * Usage: import { supabaseAdmin } from './supabaseAdmin.js'
 */
export const supabaseAdmin = new Proxy({}, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop]
  }
})
