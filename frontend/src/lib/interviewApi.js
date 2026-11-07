/**
 * Interview chat API client.
 * Sends conversation history to the backend which calls Gemini.
 * The API key never reaches the frontend.
 *
 * Retries automatically on 429 and 503 responses (up to 3 times,
 * with 2 s / 4 s / 8 s delays) before surfacing an error to the caller.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const RETRY_DELAYS_MS = [2000, 4000, 8000]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Send the full conversation history and receive the AI reply.
 *
 * @param {Array<{ role: 'user'|'model', text: string }>} history
 * @param {object} session  Supabase session from useAuth()
 * @returns {Promise<string>} The AI reply text
 * @throws  {Error}          After all retries are exhausted or on non-retryable errors
 */
export async function sendInterviewMessage(history, session) {
  if (!session?.access_token) throw new Error('Not authenticated.')

  let lastError
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    let res, body

    // ── Fetch ─────────────────────────────────────────────────────
    try {
      res = await fetch(`${API_BASE}/api/interview/chat`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ history }),
      })
    } catch (fetchErr) {
      // Only genuine network failures (offline, DNS failure, CORS preflight abort)
      // reach here — not HTTP error status codes.
      throw new Error('Network error — the backend could not be reached. Please check that the backend server is running.')
    }

    // ── Parse response body ────────────────────────────────────────
    // Attempt JSON parse separately so a malformed body gives a useful message.
    try {
      body = await res.json()
    } catch {
      // Response arrived but body is not valid JSON (empty body, HTML error page, etc.)
      throw new Error(`Unexpected response from server (HTTP ${res.status}). Please check the backend logs.`)
    }

    if (res.ok) return body.reply

    const errorMsg  = body.error ?? `Server error (${res.status})`
    const retryable = res.status === 429 || res.status === 503

    if (!retryable || attempt === RETRY_DELAYS_MS.length) {
      throw new Error(errorMsg)
    }

    lastError = new Error(errorMsg)
    await sleep(RETRY_DELAYS_MS[attempt])
  }

  throw lastError
}
