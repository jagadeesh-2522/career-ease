import { getClient } from './geminiClient.js'

/**
 * Analyse a resume using Gemini Flash.
 * Returns a validated structured analysis object.
 *
 * @param {string} resumeText  Extracted plain text from the resume
 * @returns {Promise<ResumeAnalysis>}
 */
export async function analyseResume(resumeText) {
  const genAI = getClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' })

  const prompt = buildPrompt(resumeText)

  const result   = await model.generateContent(prompt)
  const response = await result.response
  const text     = response.text()

  return parseAndValidate(text)
}

// ── Prompt ──────────────────────────────────────────────────────────────────
function buildPrompt(resumeText) {
  return `You are an expert resume coach and career advisor. Analyse the following resume text carefully and return ONLY a valid JSON object with no markdown code fences, no additional text and no explanation outside the JSON.

RESUME TEXT:
${resumeText.slice(0, 12000)}

Return this exact JSON structure (fill every field based on the actual resume content):

{
  "overallScore": <integer 0-100 reflecting overall resume quality>,
  "scoreExplanation": "<2-3 sentence explanation of the score — what it reflects and what would raise it. Do not claim this is an ATS score.>",
  "sections": {
    "professionalSummary": { "score": <0-100 or null if absent>, "feedback": "<specific feedback>", "present": <true|false> },
    "workExperience":      { "score": <0-100 or null if absent>, "feedback": "<specific feedback>", "present": <true|false> },
    "education":           { "score": <0-100 or null if absent>, "feedback": "<specific feedback>", "present": <true|false> },
    "skills":              { "score": <0-100 or null if absent>, "feedback": "<specific feedback>", "present": <true|false> },
    "projects":            { "score": <0-100 or null if absent>, "feedback": "<specific feedback>", "present": <true|false> },
    "certifications":      { "score": <0-100 or null if absent>, "feedback": "<specific feedback>", "present": <true|false> },
    "achievements":        { "score": <0-100 or null if absent>, "feedback": "<specific feedback>", "present": <true|false> }
  },
  "technicalSkills": ["<skill1>", "<skill2>"],
  "softSkills": ["<skill1>", "<skill2>"],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "missingSections": ["<section name if completely absent>"],
  "grammarAndClarity": { "score": <0-100>, "feedback": "<specific observations about writing quality>" },
  "improvementSuggestions": [
    { "priority": "high|medium|low", "suggestion": "<specific actionable suggestion>" }
  ],
  "suggestedSummary": "<a rewritten professional summary of 2-3 sentences based on the resume content>",
  "bulletPointRewrites": [
    { "original": "<exact original bullet from resume>", "improved": "<rewritten version with stronger impact verbs and metrics>" }
  ]
}

Rules:
- Base every field on the actual resume content. Do not invent experience or credentials.
- If a section is absent, set present=false and score=null.
- Include 3-5 improvement suggestions ordered by priority.
- Include 2-4 bullet point rewrites for the weakest bullets found.
- The suggestedSummary must reflect the candidate's actual background.
- Return ONLY the JSON — no prose, no code fences, no commentary.`
}

// ── Response parsing and validation ─────────────────────────────────────────
function parseAndValidate(text) {
  // Strip accidental markdown code fences if Gemini adds them
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned an invalid response format. Please try again.')
  }

  // Validate required top-level fields
  const required = ['overallScore', 'scoreExplanation', 'sections', 'strengths',
                    'weaknesses', 'improvementSuggestions', 'suggestedSummary']
  for (const field of required) {
    if (parsed[field] === undefined) {
      throw new Error(`AI response missing required field: ${field}`)
    }
  }

  // Clamp overallScore to 0–100
  parsed.overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore)))

  // Ensure array fields are always arrays
  for (const key of ['technicalSkills', 'softSkills', 'strengths', 'weaknesses',
                      'missingSections', 'improvementSuggestions', 'bulletPointRewrites']) {
    if (!Array.isArray(parsed[key])) parsed[key] = []
  }

  return parsed
}
