import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send, Volume2, Pause, Play,
  Square, Mic, MicOff, AlertCircle, Bot, User, RefreshCw,
} from 'lucide-react'
import { useAuth }              from '@/context/AuthContext'
import { sendInterviewMessage } from '@/lib/interviewApi'
import { useSpeech }            from './useSpeech'
import { useMic }               from './useMic'
import { cleanSpeechText }      from './cleanSpeechText'
import { MarkdownMessage }      from './MarkdownMessage'

/* ── Constants ──────────────────────────────────────────────────── */
const WELCOME_TEXT =
  "Hello! I'm your Lumino AI Interview Assistant. Ask me anything about interviews, " +
  "HR questions, technical concepts, or career preparation. I'll provide helpful " +
  "answers and read them aloud for you."

const WELCOME_MSG = {
  id:         'welcome',
  role:       'model',
  text:       WELCOME_TEXT,
  speechText: WELCOME_TEXT,   // no Markdown in welcome text
}

/* ── Spinner ────────────────────────────────────────────────────── */
function Spinner({ size = 16 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      borderRadius: '50%',
      border: '2px solid rgba(137,107,197,0.25)',
      borderTopColor: '#896BC5',
      animation: 'lumino-spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

/* ── Audio control bar ──────────────────────────────────────────── */
// speechText is the cleaned plain-text version used only for SpeechSynthesis.
// The displayed bubble still shows msg.text (original Markdown).
function AudioControls({ msgId, speech, onSpeak, speechText }) {
  const isActive   = speech.activeId === msgId
  // `speaking` is aliased from `playing` in useSpeech for backward compat.
  // We treat isActive+not-paused as "currently speaking" so the Pause button
  // shows reliably even if the browser's onstart fires with a small delay.
  const isSpeaking = isActive && !speech.paused
  const isPaused   = isActive && speech.paused

  const iconProps = { size: 14, strokeWidth: 2 }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.625rem' }}>
      {/* Stop (when active) or Play (when idle) */}
      {isActive ? (
        <button type="button" onClick={() => speech.stop()} title="Stop" style={ctrlBtn}>
          <Square {...iconProps} />
        </button>
      ) : (
        <button type="button" onClick={() => onSpeak(speechText, msgId)} title="Play" style={ctrlBtn}>
          <Volume2 {...iconProps} />
        </button>
      )}

      {/* Pause — shown while actively speaking */}
      {isSpeaking && (
        <button type="button" onClick={() => speech.pause()} title="Pause" style={ctrlBtn}>
          <Pause {...iconProps} />
        </button>
      )}

      {/* Resume — shown while paused */}
      {isPaused && (
        <button type="button" onClick={() => speech.resume()} title="Resume" style={ctrlBtn}>
          <Play {...iconProps} />
        </button>
      )}

      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.125rem' }}>
        {isSpeaking ? 'Speaking…' : isPaused ? 'Paused' : 'Read aloud'}
      </span>
    </div>
  )
}

const ctrlBtn = {
  background:   'var(--bg-hover)',
  border:       '1px solid var(--border-subtle)',
  borderRadius: '0.5rem',
  width: '28px', height: '28px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  color:  'var(--text-secondary)',
  transition: 'background 0.15s',
}

/* ── Message bubble ─────────────────────────────────────────────── */
function MessageBubble({ msg, speech, onSpeak }) {
  const isUser = msg.role === 'user'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '0.75rem',
        maxWidth: '100%',
        animation: 'fadeSlideIn 0.22s ease',
      }}
    >
      {/* Avatar */}
      <div
        aria-hidden="true"
        style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isUser
            ? 'linear-gradient(135deg, #896BC5 0%, #D96D94 100%)'
            : 'linear-gradient(135deg, #2EC4B6 0%, #5B9BD5 100%)',
        }}
      >
        {isUser
          ? <User size={16} color="#fff" strokeWidth={2} />
          : <Bot  size={16} color="#fff" strokeWidth={2} />
        }
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: 'calc(100% - 46px)', minWidth: 0 }}>
        <div
          style={{
            padding:      '0.875rem 1rem',
            borderRadius: isUser ? '1rem 0.25rem 1rem 1rem' : '0.25rem 1rem 1rem 1rem',
            background:   isUser
              ? 'linear-gradient(135deg, rgba(137,107,197,0.28) 0%, rgba(217,109,148,0.20) 100%)'
              : 'var(--bg-card)',
            backdropFilter:       'var(--blur-glass)',
            WebkitBackdropFilter: 'var(--blur-glass)',
            border:       '1px solid var(--border-card)',
            boxShadow:    'var(--shadow-card)',
            fontSize:     '0.9rem',
            lineHeight:   1.7,
            color:        'var(--text-primary)',
            wordBreak:    'break-word',
          }}
        >
          {/* Render Markdown for AI messages; plain text for user messages */}
          {isUser
            ? <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
            : <MarkdownMessage text={msg.text} />
          }
        </div>

        {/* Audio controls — use speechText (cleaned) for TTS, not display text */}
        {!isUser && speech.supported && msg.speechText && (
          <AudioControls
            msgId={msg.id}
            speech={speech}
            onSpeak={onSpeak}
            speechText={msg.speechText}
          />
        )}
      </div>
    </div>
  )
}

/* ── Typing indicator ───────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #2EC4B6 0%, #5B9BD5 100%)',
      }}>
        <Bot size={16} color="#fff" strokeWidth={2} />
      </div>
      <div style={{
        padding: '0.875rem 1.125rem',
        borderRadius: '0.25rem 1rem 1rem 1rem',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        border:     '1px solid var(--border-card)',
        boxShadow:  'var(--shadow-card)',
        display:    'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <Spinner />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Thinking…</span>
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────────── */
export function InterviewPage() {
  const { session }  = useAuth()
  const speech       = useSpeech()

  const [messages,   setMessages]   = useState([WELCOME_MSG])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  // retryQuestion holds the failed user question so the Retry button can resubmit it
  const [retryQuestion, setRetryQuestion] = useState(null)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const msgCounter = useRef(0)

  // ── Mic: append recognised final text to the input field ────────
  // lastMicText is a ref so submitFromMic can read it synchronously
  // without depending on React state being up-to-date.
  const lastMicTextRef = useRef('')

  const handleMicResult = useCallback((finalText) => {
    lastMicTextRef.current = finalText
    setInput(finalText)
    // Resize the textarea to fit the new content
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }, [])

  const mic = useMic({ onResult: handleMicResult })

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Speak the welcome message once on first load
  useEffect(() => {
    if (speech.supported) {
      const t = setTimeout(() => speech.speak(WELCOME_TEXT, 'welcome'), 600)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.supported])

  const handleSpeak = useCallback((speechText, id) => {
    speech.speak(speechText, id)
  }, [speech])

  // ── Core submit logic ────────────────────────────────────────────
  const doSubmit = useCallback(async (questionText, historySnapshot) => {
    setError(null)
    setRetryQuestion(null)
    setLoading(true)

    // Stop the mic if it was recording
    if (mic.listening) {
      mic.stopListening()
      mic.clearTranscript()
    }

    try {
      const reply = await sendInterviewMessage(historySnapshot, session)

      const speechText = cleanSpeechText(reply)
      const aiMsg = {
        id:         `a-${++msgCounter.current}`,
        role:       'model',
        text:       reply,       // original Markdown — shown in chat bubble
        speechText,              // cleaned plain text — passed to TTS only
      }
      setMessages(prev => [...prev, aiMsg])

      if (speech.supported) {
        speech.speak(speechText, aiMsg.id)
      }
    } catch (err) {
      setError(err.message)
      setRetryQuestion(questionText)    // preserve so Retry can resubmit
      // The user message was already added to state — do not add it again on retry
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [session, speech, mic])

  // ── Submit from the text input ───────────────────────────────────
  const submit = useCallback(() => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    const userMsg     = { id: `u-${++msgCounter.current}`, role: 'user', text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)

    const history = nextMessages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, text: m.text }))

    doSubmit(text, history)
  }, [input, loading, messages, doSubmit])

  // ── Retry the failed question without re-adding the user message ─
  const retry = useCallback(() => {
    if (!retryQuestion || loading) return

    // The user message is already in `messages` from the failed attempt
    const history = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, text: m.text }))

    doSubmit(retryQuestion, history)
  }, [retryQuestion, loading, messages, doSubmit])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  // ── Mic toggle ───────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!mic.supported) return
    if (mic.listening) {
      // Stop recording
      mic.stopListening()

      // Submit the recognised text directly from the ref — this avoids
      // any React state-batching delay between handleMicResult setting
      // `input` and the user clicking the Send button.
      const voiceText = lastMicTextRef.current.trim()
      if (voiceText && !loading) {
        // Clear the input field visually
        setInput('')
        lastMicTextRef.current = ''
        if (inputRef.current) inputRef.current.style.height = 'auto'

        // Add user message and submit — same path as the typed flow
        const userMsg      = { id: `u-${++msgCounter.current}`, role: 'user', text: voiceText }
        const nextMessages = [...messages, userMsg]
        setMessages(nextMessages)

        const history = nextMessages
          .filter(m => m.id !== 'welcome')
          .map(m => ({ role: m.role, text: m.text }))

        doSubmit(voiceText, history)
      }
    } else {
      lastMicTextRef.current = ''
      mic.clearTranscript()
      setInput('')
      mic.startListening()
    }
  }, [mic, loading, messages, doSubmit])

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 72px)',
      paddingBottom: '1rem',
    }}>
      <style>{`
        @keyframes lumino-spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,109,148,0.55); }
          50%       { box-shadow: 0 0 0 8px rgba(217,109,148,0); }
        }
      `}</style>

      {/* ── Page title ─────────────────────────────────── */}
      <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          AI Mock Interviewer
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Ask any interview question — HR, technical, behavioural or career-related.
          {!speech.supported && (
            <span style={{ marginLeft: '0.5rem', color: '#F6B99F' }}>
              (Text-to-speech not available in this browser.)
            </span>
          )}
        </p>
      </div>

      {/* ── Chat window ────────────────────────────────── */}
      <div
        className="glass"
        style={{
          flex: 1, overflowY: 'auto',
          borderRadius: 'var(--radius-card)',
          padding: '1.25rem',
          display: 'flex', flexDirection: 'column',
          gap: '1.25rem', minHeight: 0,
        }}
        aria-live="polite"
        aria-label="Interview conversation"
      >
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            speech={speech}
            onSpeak={handleSpeak}
          />
        ))}

        {loading && <TypingIndicator />}

        {/* Error banner with Retry button */}
        {error && !loading && (
          <div
            role="alert"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              background: 'rgba(217,109,148,0.10)',
              border:     '1px solid rgba(217,109,148,0.25)',
              borderRadius: '0.75rem',
              padding:    '0.875rem 1rem',
              fontSize:   '0.8125rem',
              color:      '#D96D94',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ flex: 1 }}>{error}</span>
            {retryQuestion && (
              <button
                type="button"
                onClick={retry}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#D96D94', fontWeight: 700, fontSize: '0.8125rem',
                  fontFamily: 'inherit', flexShrink: 0,
                }}
              >
                <RefreshCw size={13} />
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Mic error — separate from AI error */}
      {mic.error && (
        <div style={{
          marginTop: '0.5rem', flexShrink: 0,
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          background: 'rgba(246,185,159,0.12)',
          border:     '1px solid rgba(246,185,159,0.30)',
          borderRadius: '0.75rem',
          padding:    '0.625rem 0.875rem',
          fontSize:   '0.8125rem',
          color:      '#b86035',
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          {mic.error}
        </div>
      )}

      {/* Listening indicator */}
      {mic.listening && (
        <div style={{
          marginTop: '0.5rem', flexShrink: 0, textAlign: 'center',
          fontSize: '0.8125rem', color: '#D96D94',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: '#D96D94',
            animation: 'mic-pulse 1.2s ease-in-out infinite',
          }} />
          Listening… speak now. Click the microphone again to send.
        </div>
      )}

      {/* ── Input bar ──────────────────────────────────── */}
      <div
        className="glass"
        style={{
          flexShrink: 0,
          marginTop: '0.75rem',
          borderRadius: 'var(--radius-card)',
          padding: '0.75rem',
          display: 'flex', alignItems: 'flex-end', gap: '0.625rem',
        }}
      >
        {/* Microphone button — permission requested only on click */}
        {mic.supported ? (
          <button
            type="button"
            onClick={toggleMic}
            disabled={loading}
            title={mic.listening ? 'Stop recording' : 'Start voice input'}
            aria-label={mic.listening ? 'Stop recording' : 'Start voice input'}
            aria-pressed={mic.listening}
            style={{
              width: '40px', height: '40px',
              borderRadius: '0.75rem',
              border:       'none',
              background:   mic.listening
                ? 'linear-gradient(135deg, #D96D94 0%, #896BC5 100%)'
                : 'var(--bg-hover)',
              color:        mic.listening ? '#fff' : 'var(--text-secondary)',
              cursor:       loading ? 'not-allowed' : 'pointer',
              display:      'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink:   0,
              opacity:      loading ? 0.5 : 1,
              animation:    mic.listening ? 'mic-pulse 1.2s ease-in-out infinite' : 'none',
              transition:   'background 0.15s, color 0.15s',
            }}
          >
            {mic.listening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
        ) : (
          /* Mic not supported — render a dim non-interactive indicator */
          <div style={{ color: 'var(--text-muted)', paddingBottom: '0.5rem', flexShrink: 0 }}>
            <Mic size={18} style={{ opacity: 0.25 }} />
          </div>
        )}

        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mic.listening ? 'Listening…' : 'Ask your interview question…'}
          rows={1}
          disabled={loading}
          aria-label="Type your interview question"
          style={{
            flex: 1,
            background: 'transparent',
            border:     'none',
            outline:    'none',
            resize:     'none',
            fontSize:   '0.9375rem',
            color:      'var(--text-primary)',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            padding:    '0.375rem 0',
            maxHeight:  '120px',
            overflowY:  'auto',
          }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />

        <button
          type="button"
          onClick={submit}
          disabled={!input.trim() || loading}
          aria-label="Send message"
          style={{
            width: '40px', height: '40px',
            borderRadius: '0.75rem',
            border:       'none',
            background:   !input.trim() || loading
              ? 'var(--bg-hover)'
              : 'linear-gradient(135deg, #896BC5 0%, #D96D94 100%)',
            color:   !input.trim() || loading ? 'var(--text-muted)' : '#fff',
            cursor:  !input.trim() || loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          {loading ? <Spinner size={17} /> : <Send size={17} />}
        </button>
      </div>

      <p style={{
        textAlign:  'center',
        fontSize:   '0.6875rem',
        color:      'var(--text-muted)',
        marginTop:  '0.5rem',
        flexShrink: 0,
      }}>
        AI responses are for practice purposes only and may contain inaccuracies.
        Press Enter to send · Shift+Enter for new line
        {mic.supported && ' · Click the microphone to use voice input'}
      </p>
    </div>
  )
}
