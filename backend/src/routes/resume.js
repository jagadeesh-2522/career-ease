import { Router }       from 'express'
import multer           from 'multer'
import { requireAuth }  from '../middleware/requireAuth.js'
import { extractText }  from '../services/extractText.js'
import { analyseResume } from '../services/gemini.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

export const resumeRouter = Router()

// ── Multer config — in-memory storage, validate before touching disk ────────
const MAX_SIZE = 5 * 1024 * 1024   // 5 MB

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(Object.assign(new Error('Only PDF and DOCX files are accepted.'), { status: 400 }))
    }
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/resume/analyse
// Upload a resume file, extract text, run Gemini analysis, persist results.
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.post(
  '/analyse',
  requireAuth,
  upload.single('resume'),
  async (req, res) => {
    // Multer file-size errors arrive as generic errors — surface them cleanly
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' })
    }

    const { originalname, mimetype, size, buffer } = req.file
    const userId = req.userId

    // ── 1. Extract text ──────────────────────────────────────────────────
    let resumeText
    try {
      resumeText = await extractText(buffer, mimetype)
    } catch (err) {
      return res.status(422).json({ error: err.message })
    }

    // ── 2. Upload file to Supabase Storage (private bucket) ──────────────
    const storagePath = `${userId}/${Date.now()}_${sanitiseFilename(originalname)}`
    let storageUrl = null

    try {
      const { error: storageErr } = await supabaseAdmin
        .storage
        .from('resumes')
        .upload(storagePath, buffer, {
          contentType:  mimetype,
          cacheControl: '3600',
          upsert:       false,
        })

      if (storageErr) {
        // Storage not critical — log and continue without file URL
        console.warn('[resume/analyse] Storage upload skipped:', storageErr.message)
      } else {
        storageUrl = storagePath
      }
    } catch (err) {
      console.warn('[resume/analyse] Storage error:', err.message)
    }

    // ── 3. Insert resume metadata row ────────────────────────────────────
    const { data: resumeRow, error: insertErr } = await supabaseAdmin
      .from('resumes')
      .insert({
        user_id:        userId,
        file_name:      originalname,
        file_size_bytes: size,
        mime_type:      mimetype,
        storage_path:   storageUrl,
        // Store a truncated preview of the text — not the full content
        text_preview:   resumeText.slice(0, 500),
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('[resume/analyse] DB insert error:', insertErr.message)
      return res.status(500).json({ error: 'Failed to save resume record.' })
    }

    const resumeId = resumeRow.id

    // ── 4. Run Gemini analysis ───────────────────────────────────────────
    let analysis
    try {
      analysis = await analyseResume(resumeText)
    } catch (err) {
      // Mark resume row as failed then surface the error
      await supabaseAdmin
        .from('resumes')
        .update({ status: 'failed' })
        .eq('id', resumeId)

      if (err.message.includes('GEMINI_API_KEY')) {
        return res.status(503).json({
          error: 'AI analysis is not available. The Gemini API key is not configured.',
          resumeId,
        })
      }
      return res.status(502).json({ error: err.message, resumeId })
    }

    // ── 5. Persist analysis results ──────────────────────────────────────
    const { data: analysisRow, error: analysisErr } = await supabaseAdmin
      .from('resume_analyses')
      .insert({
        resume_id:   resumeId,
        user_id:     userId,
        overall_score: analysis.overallScore,
        analysis_json: analysis,
      })
      .select('id')
      .single()

    if (analysisErr) {
      console.error('[resume/analyse] Analysis insert error:', analysisErr.message)
      return res.status(500).json({ error: 'Failed to save analysis results.' })
    }

    // Mark resume as analysed
    await supabaseAdmin
      .from('resumes')
      .update({ status: 'analysed', latest_analysis_id: analysisRow.id })
      .eq('id', resumeId)

    return res.status(200).json({
      resumeId,
      analysisId: analysisRow.id,
      analysis,
    })
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/resume/list
// Return the authenticated user's resume history (most recent first).
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.get('/list', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('resumes')
    .select(`
      id,
      file_name,
      file_size_bytes,
      status,
      created_at,
      resume_analyses!resume_analyses_resume_id_fkey ( id, overall_score, created_at )
    `)
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    // DIAGNOSTIC: log the real Supabase error so we can identify the root cause.
    // Remove this block once the issue is resolved.
    console.error('[resume/list] Supabase error:', {
      message: error.message,
      code:    error.code,
      details: error.details,
      hint:    error.hint,
    })
    return res.status(500).json({ error: 'Failed to retrieve resume history.' })
  }

  return res.json({ resumes: data })
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/resume/:resumeId/analysis
// Return the full analysis for a specific resume.
// Verifies ownership via user_id filter — users cannot access others' data.
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.get('/:resumeId/analysis', requireAuth, async (req, res) => {
  const { resumeId } = req.params

  const { data, error } = await supabaseAdmin
    .from('resume_analyses')
    .select('id, overall_score, analysis_json, created_at, resume_id')
    .eq('resume_id', resumeId)
    .eq('user_id', req.userId)   // ownership check
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Analysis not found or access denied.' })
  }

  return res.json({ analysis: data.analysis_json, analysisId: data.id, createdAt: data.created_at })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/resume/:resumeId
// Delete a resume and its analysis. Verifies ownership.
// ─────────────────────────────────────────────────────────────────────────────
resumeRouter.delete('/:resumeId', requireAuth, async (req, res) => {
  const { resumeId } = req.params

  // Fetch to get storage path and verify ownership
  const { data: row, error: fetchErr } = await supabaseAdmin
    .from('resumes')
    .select('id, storage_path, user_id')
    .eq('id', resumeId)
    .eq('user_id', req.userId)
    .single()

  if (fetchErr || !row) {
    return res.status(404).json({ error: 'Resume not found or access denied.' })
  }

  // Remove from storage if a file was stored
  if (row.storage_path) {
    const { error: storageErr } = await supabaseAdmin
      .storage
      .from('resumes')
      .remove([row.storage_path])

    if (storageErr) {
      console.warn('[resume/delete] Storage removal error:', storageErr.message)
    }
  }

  // Delete resume row — cascade deletes resume_analyses via FK
  const { error: deleteErr } = await supabaseAdmin
    .from('resumes')
    .delete()
    .eq('id', resumeId)

  if (deleteErr) {
    return res.status(500).json({ error: 'Failed to delete resume.' })
  }

  return res.json({ success: true })
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function sanitiseFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100)
}
