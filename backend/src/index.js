import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { resumeRouter }    from './routes/resume.js'
import { interviewRouter } from './routes/interview.js'

const app  = express()
const PORT = process.env.PORT ?? 4000

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

const corsOptions = {
  origin: (origin, cb) => {
    // Allow requests with no Origin header (e.g. same-origin requests, Postman)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    // Reject with false — do NOT throw; throwing causes Express to return 500
    cb(null, false)
  },
  credentials:     true,
  allowedHeaders:  ['Content-Type', 'Authorization'],
  exposedHeaders:  ['Content-Type'],
  methods:         ['GET', 'POST', 'DELETE', 'OPTIONS'],
}

// Apply CORS to every request
app.use(cors(corsOptions))

// Handle OPTIONS preflight requests explicitly BEFORE any routes or auth middleware.
// Without this, preflight OPTIONS hits the route handler and can fail
// (e.g. 404 from the route not matching, or auth middleware rejecting the request).
app.options('*', cors(corsOptions))

app.use(express.json({ limit: '1mb' }))

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/resume',    resumeRouter)
app.use('/api/interview', interviewRouter)

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// ── Error handler ────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message)
  const status = err.status ?? 500
  res.status(status).json({ error: err.message ?? 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[Lumino backend] listening on http://localhost:${PORT}`)

  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder')) {
    console.warn('[Lumino backend] ⚠ SUPABASE_URL not configured')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
    console.warn('[Lumino backend] ⚠ SUPABASE_SERVICE_ROLE_KEY not configured')
  }
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('placeholder')) {
    console.warn('[Lumino backend] ⚠ GEMINI_API_KEY not configured')
  }
})
