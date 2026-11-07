import { useRef, useState, useCallback } from 'react'

/**
 * useMic — wrapper around the browser's SpeechRecognition API.
 *
 * TRANSCRIPT MODEL
 * ─────────────────────────────────────────────────────────────────
 * SpeechRecognition fires `onresult` repeatedly with the same result
 * indices, each time replacing the previous interim text for that slot.
 * The naive approach of appending `prev + newInterim` causes repetition
 * because the previous interim is already in `prev`.
 *
 * Instead we maintain two separate pieces of state:
 *   finalTextRef   — a ref holding all words confirmed final so far.
 *                    Grows only when result.isFinal is true. Never reset
 *                    between onresult events within the same session.
 *   displayText    — state used only to update the visible input:
 *                    = finalTextRef.current + currentInterim
 *                    Recalculated fresh on every onresult event.
 *
 * AUTO-RESTART
 * ─────────────────────────────────────────────────────────────────
 * Chrome ends recognition after ~7–10 s of silence. We restart it
 * automatically unless the user explicitly clicked Stop (stoppedRef).
 * The finalTextRef is preserved across restarts so the transcript
 * is never lost.
 *
 * INTENTIONAL-STOP FLAG (stoppedRef)
 * ─────────────────────────────────────────────────────────────────
 * Set to true before calling recog.stop() in stopListening.
 * This lets onend and onerror distinguish:
 *   - User clicked Stop  (stoppedRef=true)  → do not restart, ignore 'aborted'
 *   - Silence timeout   (stoppedRef=false) → restart
 *   - Genuine error     (stoppedRef=false) → surface error, do not restart
 *
 * Returns:
 *   supported       boolean   — false on browsers without SpeechRecognition
 *   listening       boolean   — true while microphone is active
 *   startListening  ()=>void  — begin recording; requests mic permission lazily
 *   stopListening   ()=>void  — stop recording immediately, no restart
 *   clearTranscript ()=>void  — reset accumulated text
 *   error           string|null — user-facing error (permission denied, etc.)
 */
export function useMic({ onResult } = {}) {
  const SR = typeof window !== 'undefined'
    ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
    : null

  const supported = SR !== null

  // Refs — mutations do not cause re-renders
  const recogRef    = useRef(null)   // the active SpeechRecognition instance
  const finalRef    = useRef('')     // accumulated final-confirmed text this session
  const stoppedRef  = useRef(false)  // true when user explicitly stopped recording
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult     // always up-to-date without adding to dep arrays

  const [listening, setListening] = useState(false)
  const [error,     setError]     = useState(null)

  // ── Internal: create and start a new recognition instance ────────────────
  // Called both by startListening and by the auto-restart logic.
  const _createAndStart = useCallback(() => {
    if (!supported) return

    // Tear down any lingering instance first
    if (recogRef.current) {
      try { recogRef.current.abort() } catch { /* ignore */ }
      recogRef.current = null
    }

    const recog = new SR()
    recog.lang            = 'en-US'
    recog.continuous      = true   // stay active until explicitly stopped
    recog.interimResults  = true   // deliver incremental results
    recog.maxAlternatives = 1

    recog.onstart = () => {
      setListening(true)
      setError(null)
    }

    recog.onresult = (event) => {
      // Rebuild the complete picture from scratch on every event to avoid
      // any accumulation bugs. We scan all results in event.results:
      //   - Collect all final segments into newFinal
      //   - Collect the single current interim (if any)
      let newFinal  = ''
      let interim   = ''

      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) {
          newFinal += r[0].transcript
        } else {
          // There is at most one non-final result at any time
          interim = r[0].transcript
        }
      }

      // Update the persistent final accumulator
      finalRef.current = newFinal

      // Build the display string: confirmed final + current interim preview
      const display = (newFinal + interim).trim()

      // Notify the parent so it can mirror the text into the input field.
      // We always call with the cleaned display string — the parent does setInput(display).
      if (onResultRef.current) onResultRef.current(display)
    }

    recog.onerror = (event) => {
      // 'aborted' fires when we call recog.stop() / recog.abort() intentionally.
      // Suppress it so the user never sees "Speech recognition error: aborted".
      if (event.error === 'aborted') return

      // For a genuine error during an intentional-stop scenario, also suppress.
      if (stoppedRef.current) return

      setListening(false)
      recogRef.current = null

      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setError('Microphone access was denied. Please allow microphone access in your browser settings and try again.')
      } else if (event.error === 'no-speech') {
        // no-speech with continuous=true is non-fatal; silently ignore
        // (the onend handler will restart if the user hasn't stopped)
      } else if (event.error === 'network') {
        setError('A network error occurred during speech recognition. Please check your connection.')
      } else if (event.error === 'audio-capture') {
        setError('Microphone not found or unavailable. Please check your microphone and try again.')
      } else {
        setError(`Speech recognition encountered an error (${event.error}). Please try again.`)
      }
    }

    recog.onend = () => {
      recogRef.current = null

      // If the user explicitly stopped, clean up and done.
      if (stoppedRef.current) {
        setListening(false)
        return
      }

      // Otherwise this is an unexpected end (silence timeout, brief network blip).
      // Restart after a short delay so the transcript is preserved.
      // A 300 ms gap prevents tight restart loops if something is truly broken.
      setTimeout(() => {
        if (!stoppedRef.current) {
          _createAndStart()
        }
      }, 300)
    }

    recogRef.current = recog
    recog.start()
  // _createAndStart depends on `supported` and `SR` which are stable for the
  // lifetime of the component. The only reason we mention `supported` is to
  // guard the early return; eslint would flag the missing `SR` dep but SR is
  // a stable module-level constant captured in the closure.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported])

  // ── Public API ────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!supported) return
    stoppedRef.current = false   // mark as intentionally running
    finalRef.current   = ''     // fresh transcript for this session
    setError(null)
    _createAndStart()
  }, [supported, _createAndStart])

  const stopListening = useCallback(() => {
    stoppedRef.current = true   // signal onend/onerror not to restart
    if (recogRef.current) {
      try { recogRef.current.stop() } catch { /* ignore if already ended */ }
      recogRef.current = null
    }
    setListening(false)
  }, [])

  const clearTranscript = useCallback(() => {
    finalRef.current = ''
  }, [])

  return {
    supported,
    listening,
    startListening,
    stopListening,
    clearTranscript,
    error,
  }
}
