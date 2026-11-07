import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { uploadAndAnalyse, getResumeList, getAnalysis, deleteResume } from '@/lib/resumeApi'
import { ResumeUploadZone }      from './ResumeUploadZone'
import { ResumeAnalysisReport }  from './ResumeAnalysisReport'
import { ResumeHistoryList }     from './ResumeHistoryList'

/* ── Inline config-missing notice ────────────────────────────────────────── */
const API_URL     = import.meta.env.VITE_API_URL ?? ''
const isApiMissing = !API_URL || API_URL.includes('localhost:4000')
  ? false   // localhost is fine — it just needs to be running
  : false

export function ResumePage() {
  const { session } = useAuth()

  // ── State ──────────────────────────────────────────────────────────────
  const [resumes,         setResumes]        = useState([])
  const [historyLoading,  setHistoryLoading] = useState(true)
  const [historyError,    setHistoryError]   = useState(null)

  const [uploading,       setUploading]      = useState(false)
  const [uploadProgress,  setUploadProgress] = useState(0)
  const [uploadError,     setUploadError]    = useState(null)

  const [selectedResume,  setSelectedResume] = useState(null)   // { id, file_name, created_at }
  const [analysis,        setAnalysis]       = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError,   setAnalysisError]  = useState(null)
  const [analysedAt,      setAnalysedAt]     = useState(null)

  const [deleting,        setDeleting]       = useState(null)   // id being deleted

  // Clear upload error on mount so a stale value from a previous navigation
  // never shows before the user has attempted an upload in this session.
  useEffect(() => { setUploadError(null) }, [])

  // ── Load analysis for a selected resume ─────────────────────────────────
  // Defined before loadHistory so loadHistory can reference it in its dependency array.
  const loadAnalysis = useCallback(async (resume) => {
    setSelectedResume(resume)
    setAnalysis(null)
    setAnalysisError(null)
    setAnalysisLoading(true)
    try {
      const { analysis: data, createdAt } = await getAnalysis(resume.id, session)
      setAnalysis(data)
      setAnalysedAt(createdAt)
    } catch (err) {
      setAnalysisError(err.message)
    } finally {
      setAnalysisLoading(false)
    }
  }, [session])

  // ── Load history ────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!session) return
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const { resumes: list } = await getResumeList(session)
      setResumes(list ?? [])
      // Auto-select the most recent analysed resume.
      // `await` ensures any error thrown by loadAnalysis is caught here,
      // not silently swallowed or attributed to the wrong state variable.
      const latest = list?.find(r => r.status === 'analysed')
      if (latest && !selectedResume) {
        await loadAnalysis(latest)
      }
    } catch (err) {
      setHistoryError(err.message)
    } finally {
      setHistoryLoading(false)
    }
  }, [session, loadAnalysis, selectedResume])

  useEffect(() => { loadHistory() }, [loadHistory])

  // ── Handle file upload + analysis ───────────────────────────────────────
  const handleUpload = async (file) => {
    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    setAnalysis(null)
    setSelectedResume(null)

    try {
      const { resumeId, analysis: data, analysisId } = await uploadAndAnalyse(
        file,
        session,
        (pct) => setUploadProgress(pct),
      )

      setAnalysis(data)
      setAnalysedAt(new Date().toISOString())
      setSelectedResume({ id: resumeId, file_name: file.name, created_at: new Date().toISOString() })

      // Refresh history to show the new entry
      await loadHistory()
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // ── Handle delete ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume and its analysis? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteResume(id, session)
      setResumes(prev => prev.filter(r => r.id !== id))
      if (selectedResume?.id === id) {
        setSelectedResume(null)
        setAnalysis(null)
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`)
    } finally {
      setDeleting(null)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem', paddingBottom: '2rem' }}>

      {/* ── Page header ───────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Resume Intelligence
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Upload your resume to receive an AI-powered score, detailed section feedback and improvement suggestions.
        </p>
      </div>

      {/* ── History load error ────────────────────────────── */}
      {historyError && (
        <div
          role="alert"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
            background: 'rgba(217,109,148,0.10)', border: '1px solid rgba(217,109,148,0.25)',
            borderRadius: '0.75rem', padding: '0.875rem 1rem',
            fontSize: '0.8125rem', color: '#D96D94',
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ flex: 1 }}>{historyError}</span>
          <button
            type="button"
            onClick={loadHistory}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', gap: '0.25rem', alignItems: 'center', fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 600 }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ── Upload zone (always visible) ──────────────────── */}
      <Card>
        <CardContent>
          <ResumeUploadZone
            onUpload={handleUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
            error={uploadError}
          />
          {uploading && uploadProgress === 100 && (
            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Analysing your resume with AI… this may take 10–30 seconds.
            </p>
          )}
          {!uploading && uploadError && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.875rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setUploadError(null)}
                style={{ gap: '0.375rem' }}
              >
                <RefreshCw size={13} />
                Try again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Analysis loading state ────────────────────────── */}
      {analysisLoading && (
        <Card>
          <CardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2.5rem' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid rgba(137,107,197,0.25)', borderTopColor: '#896BC5', animation: 'lumino-spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading analysis…</span>
          </CardContent>
          <style>{`@keyframes lumino-spin { to { transform: rotate(360deg); } }`}</style>
        </Card>
      )}

      {/* ── Analysis error ────────────────────────────────── */}
      {analysisError && !analysisLoading && (
        <div
          role="alert"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
            background: 'rgba(217,109,148,0.10)', border: '1px solid rgba(217,109,148,0.25)',
            borderRadius: '0.75rem', padding: '0.875rem 1rem',
            fontSize: '0.8125rem', color: '#D96D94',
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
          {analysisError}
        </div>
      )}

      {/* ── Analysis report ───────────────────────────────── */}
      {analysis && !analysisLoading && (
        <ResumeAnalysisReport
          analysis={analysis}
          fileName={selectedResume?.file_name ?? 'Resume'}
          analysedAt={analysedAt}
        />
      )}

      {/* ── History list ──────────────────────────────────── */}
      {!historyLoading && resumes.length > 0 && (
        <ResumeHistoryList
          resumes={resumes}
          selectedId={selectedResume?.id}
          onSelect={loadAnalysis}
          onDelete={handleDelete}
          deleting={deleting}
        />
      )}

    </div>
  )
}
