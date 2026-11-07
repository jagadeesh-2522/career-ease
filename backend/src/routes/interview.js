import { Router }      from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { chatInterview } from '../services/interview.js'

export const interviewRouter = Router()

/**
 * POST /api/interview/chat
 *
 * Body: { history: Array<{ role: 'user'|'model', text: string }> }
 *   history must contain at least one entry.
 *   The last entry must have role='user' — it is the new question.
 *   Older entries provide conversation context.
 *
 * Response: { reply: string }
 *
 * The frontend is responsible for storing and managing conversation history.
 * The backend is stateless — it never persists chat messages.
 */
interviewRouter.post('/chat', requireAuth, async (req, res) => {
  const { history } = req.body

  // ── Input validation ─────────────────────────────────────────────
  if (!Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: 'history must be a non-empty array.' })
  }

  // Validate each turn — reject any unexpected structure early
  for (const [i, turn] of history.entries()) {
    if (!turn || typeof turn.text !== 'string' || !turn.text.trim()) {
      return res.status(400).json({ error: `history[${i}].text must be a non-empty string.` })
    }
    if (turn.role !== 'user' && turn.role !== 'model') {
      return res.status(400).json({ error: `history[${i}].role must be 'user' or 'model'.` })
    }
  }

  const lastTurn = history[history.length - 1]
  if (lastTurn.role !== 'user') {
    return res.status(400).json({ error: 'The last history entry must have role: "user".' })
  }

  // Cap total history to keep prompts within token limits
  const MAX_TURNS = 20
  const trimmedHistory = history.length > MAX_TURNS
    ? history.slice(history.length - MAX_TURNS)
    : history

  // ── Call Gemini ──────────────────────────────────────────────────
  try {
    const reply = await chatInterview(trimmedHistory)
    return res.json({ reply })
  } catch (err) {
    const msg = err.message ?? ''

    // 429 rate limit / quota
    if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
      return res.status(429).json({
        error: 'The AI service is receiving too many requests right now. Please wait a moment and try again.',
      })
    }

    // 503 overloaded
    if (msg.includes('503') || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('overload')) {
      return res.status(503).json({
        error: 'The AI service is temporarily busy. Please try again in a few seconds.',
      })
    }

    // API key not configured
    if (msg.includes('GEMINI_API_KEY')) {
      return res.status(503).json({
        error: 'AI integration is not configured on this server.',
      })
    }

    console.error('[interview/chat] Gemini error:', msg)
    return res.status(502).json({ error: 'The AI service returned an unexpected error. Please try again.' })
  }
})
