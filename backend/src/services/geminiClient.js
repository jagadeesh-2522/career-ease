import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Shared lazy-initialised Gemini client.
 * Imported by both gemini.js (resume analysis) and interview.js (chat).
 * The API key is read from the environment — never hardcoded.
 */
let _genAI = null

export function getClient() {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.includes('placeholder')) {
      throw new Error('GEMINI_API_KEY is not configured.')
    }
    _genAI = new GoogleGenerativeAI(apiKey)
  }
  return _genAI
}
