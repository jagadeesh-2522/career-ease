import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * useSpeech — wrapper around the browser's SpeechSynthesis API.
 *
 * Returns:
 *   supported  boolean       — false on browsers without SpeechSynthesis
 *   playing    boolean       — true while audio is actively playing (not paused, not stopped)
 *   paused     boolean       — true while audio is paused mid-utterance
 *   activeId   string|null   — id of the utterance currently under control
 *   speak(text, id)          — begin speaking; cancels any ongoing speech first
 *   pause()                  — pause current utterance
 *   resume()                 — resume paused utterance
 *   stop()                   — cancel all speech immediately
 *
 * NOTE ON CHROME RELIABILITY
 * SpeechSynthesis onstart / onpause / onresume events are unreliable in
 * Chrome. We therefore drive `playing` and `paused` state from our own
 * intent rather than relying solely on those events:
 *   • speak()  → immediately set playing=true, paused=false
 *   • pause()  → immediately set playing=false, paused=true
 *   • resume() → immediately set playing=true, paused=false
 *   • stop()   → immediately set playing=false, paused=false, activeId=null
 * The utterance event handlers (`onend`, `onerror`) still clean up when
 * speech finishes naturally.
 */
export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const utterRef  = useRef(null)
  const [playing,   setPlaying]   = useState(false)
  const [paused,    setPaused]    = useState(false)
  const [activeId,  setActiveId]  = useState(null)

  // Cancel speech when the component unmounts
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    utterRef.current = null
    setPlaying(false)
    setPaused(false)
    setActiveId(null)
  }, [supported])

  const speak = useCallback((text, id) => {
    if (!supported) return

    // Cancel anything currently playing
    window.speechSynthesis.cancel()
    utterRef.current = null

    const utt   = new SpeechSynthesisUtterance(text)
    utt.rate    = 0.95
    utt.pitch   = 1.0
    utt.volume  = 1.0

    // Pick a natural English voice when available
    const voices    = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Enhanced'))
    ) ?? voices.find(v => v.lang.startsWith('en'))
    if (preferred) utt.voice = preferred

    // ── Immediately update state from intent (do not wait for onstart) ──
    // Chrome's `onstart` fires asynchronously and sometimes not at all
    // before the first render cycle. Setting state here ensures the Pause
    // button is visible as soon as speak() is called.
    setActiveId(id)
    setPlaying(true)
    setPaused(false)

    // Clean up when speech ends naturally or errors
    utt.onend   = () => { setPlaying(false); setPaused(false); setActiveId(null); utterRef.current = null }
    utt.onerror = () => { setPlaying(false); setPaused(false); setActiveId(null); utterRef.current = null }

    // Mirror Chrome events in case they do fire (keeps state accurate)
    utt.onpause  = () => { setPlaying(false); setPaused(true) }
    utt.onresume = () => { setPlaying(true);  setPaused(false) }

    utterRef.current = utt
    window.speechSynthesis.speak(utt)
  }, [supported])

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
    // Update state from intent immediately — do not wait for onpause
    setPlaying(false)
    setPaused(true)
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
    // Update state from intent immediately — do not wait for onresume
    setPlaying(true)
    setPaused(false)
  }, [supported])

  // Expose `speaking` as an alias for backward compatibility with any
  // existing references — it equals `playing`.
  return { supported, playing, speaking: playing, paused, activeId, speak, pause, resume, stop }
}
