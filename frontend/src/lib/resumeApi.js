/**
 * Resume Intelligence API client.
 * All requests carry the Supabase JWT from the active session.
 * The backend verifies this token before processing any request.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function authHeaders(session) {
  if (!session?.access_token) throw new Error('Not authenticated.')
  return { Authorization: `Bearer ${session.access_token}` }
}

/**
 * Upload a file and trigger AI analysis.
 * @param {File}   file     Browser File object (PDF or DOCX)
 * @param {object} session  Supabase session object from useAuth()
 * @param {function} onProgress  Optional callback(percent: number)
 * @returns {Promise<{ resumeId, analysisId, analysis }>}
 */
export async function uploadAndAnalyse(file, session, onProgress) {
  const headers = await authHeaders(session)
  const formData = new FormData()
  formData.append('resume', file)

  // Use XMLHttpRequest so we can report upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      try {
        const body = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(body)
        } else {
          reject(new Error(body.error ?? `Server error (${xhr.status})`))
        }
      } catch {
        reject(new Error('Invalid response from server.'))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Network error. Check your connection.')))
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled.')))

    xhr.open('POST', `${API_BASE}/api/resume/analyse`)
    xhr.setRequestHeader('Authorization', headers.Authorization)
    xhr.send(formData)
  })
}

/**
 * Fetch the authenticated user's resume history.
 * @param {object} session  Supabase session
 * @returns {Promise<{ resumes: Array }>}
 */
export async function getResumeList(session) {
  const headers = await authHeaders(session)
  const res = await fetch(`${API_BASE}/api/resume/list`, { headers })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Failed to load resume history.')
  return body
}

/**
 * Fetch the full analysis for a specific resume.
 * @param {string} resumeId  UUID of the resume row
 * @param {object} session
 * @returns {Promise<{ analysis, analysisId, createdAt }>}
 */
export async function getAnalysis(resumeId, session) {
  const headers = await authHeaders(session)
  const res = await fetch(`${API_BASE}/api/resume/${resumeId}/analysis`, { headers })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Failed to load analysis.')
  return body
}

/**
 * Delete a resume and its analysis data.
 * @param {string} resumeId
 * @param {object} session
 */
export async function deleteResume(resumeId, session) {
  const headers = await authHeaders(session)
  const res = await fetch(`${API_BASE}/api/resume/${resumeId}`, {
    method: 'DELETE',
    headers,
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Failed to delete resume.')
  return body
}
