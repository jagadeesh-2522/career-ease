import { useRef, useState, useCallback } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const MAX_BYTES     = 5 * 1024 * 1024   // 5 MB
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const ALLOWED_EXT = ['.pdf', '.docx']

function validateFile(file) {
  if (!file) return 'No file selected.'
  if (!ALLOWED_TYPES.has(file.type)) return 'Only PDF and DOCX files are accepted.'
  if (file.size === 0)               return 'This file appears to be empty.'
  if (file.size > MAX_BYTES)         return `File is too large. Maximum size is 5 MB (this file is ${(file.size / 1024 / 1024).toFixed(1)} MB).`
  return null
}

function formatBytes(bytes) {
  if (bytes < 1024)            return `${bytes} B`
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/**
 * Drag-and-drop + click-to-select upload zone.
 *
 * Props:
 *   onUpload(file)  — called when user selects a valid file
 *   uploading       — boolean, disables interactions while upload is in progress
 *   uploadProgress  — 0–100, shown while uploading
 *   error           — string | null, external error from upload failure
 */
export function ResumeUploadZone({ onUpload, uploading, uploadProgress, error: externalError }) {
  const inputRef       = useRef(null)
  const [dragging,  setDragging]   = useState(false)
  const [selected,  setSelected]   = useState(null)   // { name, size, type }
  const [localError, setLocalError] = useState(null)

  const errorMsg = localError || externalError

  const handleFile = useCallback((file) => {
    const err = validateFile(file)
    if (err) {
      setLocalError(err)
      setSelected(null)
      return
    }
    setLocalError(null)
    setSelected({ name: file.name, size: file.size, type: file.type })
    onUpload(file)
  }, [onUpload])

  const onInputChange = (e) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    // Reset input so the same file can be re-selected after an error
    e.target.value = ''
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true)  }
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false) }

  const clearSelection = () => {
    setSelected(null)
    setLocalError(null)
  }

  const borderColor = errorMsg
    ? 'rgba(217,109,148,0.60)'
    : dragging
    ? 'rgba(137,107,197,0.80)'
    : selected
    ? 'rgba(46,196,182,0.60)'
    : 'rgba(137,107,197,0.35)'

  const bgColor = dragging
    ? 'rgba(137,107,197,0.08)'
    : 'transparent'

  return (
    <div>
      {/* Drop zone */}
      <div
        role="button"
        aria-label="Upload resume — click or drag a file here"
        tabIndex={uploading ? -1 : 0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border:       `2px dashed ${borderColor}`,
          borderRadius: 'var(--radius-card)',
          background:   bgColor,
          padding:      '3rem 2rem',
          cursor:       uploading ? 'not-allowed' : 'pointer',
          transition:   'border-color 0.2s, background 0.2s',
          display:      'flex',
          flexDirection: 'column',
          alignItems:   'center',
          gap:          '1rem',
          textAlign:    'center',
          userSelect:   'none',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXT.join(',')}
          style={{ display: 'none' }}
          onChange={onInputChange}
          disabled={uploading}
        />

        {/* Icon */}
        <div
          style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: selected && !errorMsg
              ? 'rgba(46,196,182,0.12)'
              : 'rgba(137,107,197,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {selected && !errorMsg
            ? <FileText size={30} color="#2EC4B6" />
            : <Upload   size={30} color="#896BC5" />
          }
        </div>

        {/* Labels */}
        {selected && !errorMsg ? (
          <div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selected.name}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {formatBytes(selected.size)} · {selected.type.includes('pdf') ? 'PDF' : 'DOCX'}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Drag and drop your resume here
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              or click to select a file
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
              PDF or DOCX · Maximum 5 MB
            </p>
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{
              height: '6px', borderRadius: '9999px',
              background: 'var(--border-subtle)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${uploadProgress}%`,
                background: 'linear-gradient(90deg, #896BC5, #D96D94)',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              {uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Analysing with AI…'}
            </p>
          </div>
        )}
      </div>

      {/* File selected — action row */}
      {selected && !uploading && !errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.875rem', gap: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Ready to analyse
          </p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); clearSelection() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}
            aria-label="Remove selected file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            marginTop: '0.875rem',
            background: 'rgba(217,109,148,0.10)',
            border: '1px solid rgba(217,109,148,0.25)',
            borderRadius: '0.625rem',
            padding: '0.75rem 1rem',
            fontSize: '0.8125rem',
            color: '#D96D94',
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{errorMsg}</span>
          {localError && (
            <button
              type="button"
              onClick={clearSelection}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, flexShrink: 0 }}
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
