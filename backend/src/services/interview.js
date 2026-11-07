import { getClient } from './geminiClient.js'

/**
 * System instruction that makes Gemini behave as an interview coach.
 * Injected as a system role message at the start of every conversation.
 */
const SYSTEM_INSTRUCTION = `You are a helpful, encouraging AI interview coach named Lumino Assistant.
Your purpose is to help students, freshers and job seekers prepare for interviews.

Capabilities:
- Answer HR, behavioural, technical and general career questions clearly and concisely.
- Provide sample interview answers when requested, tailored to the question type.
- Explain technical concepts in beginner-friendly language.
- Give constructive feedback on answer quality if the user shares their draft answer.
- Suggest improvements to interview answers.
- Support common job domains: software engineering, data science, marketing, finance, operations, design and general roles.

Behaviour rules:
- Always be encouraging and professional.
- Keep answers focused and easy to read — use short paragraphs or bullet points where appropriate.
- If you are uncertain about a fact, say so rather than inventing information.
- Do not make up company-specific insider information.
- Do not promise job outcomes or salary figures.
- Limit responses to approximately 300 words unless the user explicitly asks for more detail.
- Do not repeat the user's question back to them verbatim.`

// ── Retry helper ─────────────────────────────────────────────────────────────
const RETRY_DELAYS_MS = [2000, 4000, 8000]   // 3 attempts, exponential back-off

/**
 * Returns true for errors that are worth retrying (transient infrastructure issues).
 * Returns false for errors that will not improve with a retry.
 */
function isRetryable(err) {
  const msg = err.message ?? ''
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.toLowerCase().includes('high demand') ||
    msg.toLowerCase().includes('overload') ||
    msg.toLowerCase().includes('quota') ||
    msg.toLowerCase().includes('rate limit') ||
    msg.toLowerCase().includes('resource exhausted')
  )
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Send a conversation turn to Gemini and return the assistant reply.
 * Automatically retries up to 3 times for 503/429 transient errors.
 *
 * @param {Array<{ role: 'user'|'model', text: string }>} history
 *   All previous turns in the conversation, oldest first.
 *   The last entry must be the new user message.
 * @returns {Promise<string>} The assistant's reply text
 */
export async function chatInterview(history) {
  if (!history?.length) {
    throw new Error('Conversation history is required.')
  }

  const lastTurn = history[history.length - 1]
  if (lastTurn.role !== 'user') {
    throw new Error('Last history entry must be a user message.')
  }

  let lastError
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await _callGemini(history)
    } catch (err) {
      lastError = err
      const isLast = attempt === RETRY_DELAYS_MS.length
      if (isLast || !isRetryable(err)) {
        throw err   // non-retryable or exhausted — surface immediately
      }
      const delay = RETRY_DELAYS_MS[attempt]
      console.warn(
        `[interview/chat] Attempt ${attempt + 1} failed (${err.message.slice(0, 80)}). ` +
        `Retrying in ${delay / 1000}s…`
      )
      await sleep(delay)
    }
  }

  throw lastError   // shouldn't reach here, but satisfies the linter
}

// ── Core Gemini call (single attempt) ────────────────────────────────────────
async function _callGemini(history) {
  const genAI = getClient()
  const model = genAI.getGenerativeModel({
    model:             'gemini-3.5-flash-lite',
    systemInstruction: SYSTEM_INSTRUCTION,
  })

  // Convert flat history to Gemini's Content[] — exclude the last (new) user turn
  const geminiHistory = history.slice(0, -1).map(turn => ({
    role:  turn.role,
    parts: [{ text: turn.text }],
  }))

  const chat   = model.startChat({ history: geminiHistory })
  const result = await chat.sendMessage(history[history.length - 1].text)
  return (await result.response).text()
}
