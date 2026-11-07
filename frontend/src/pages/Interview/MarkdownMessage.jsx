/**
 * MarkdownMessage — lightweight Markdown renderer for AI chat responses.
 *
 * Handles the subset of Markdown that Gemini actually produces:
 *   ## Headings (levels 1–3)
 *   **bold** and *italic*
 *   - / * / + bullet lists and 1. numbered lists
 *   `inline code` and ```code blocks```
 *   blank-line separated paragraphs
 *
 * Does NOT require any external library. Renders to React elements.
 * The original text is never mutated — this only affects display.
 */

import React from 'react'

/* ── Inline formatting (bold, italic, code) ────────────────────── */
function renderInline(text) {
  // Split on **bold**, *italic*, `code`
  const parts = []
  // Combined regex: captures bold (**…**), italic (*…*), inline-code (`…`)
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g
  let last = 0
  let match

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    if (match[1] !== undefined) {
      parts.push(<strong key={match.index}>{match[1]}</strong>)
    } else if (match[2] !== undefined) {
      parts.push(<em key={match.index}>{match[2]}</em>)
    } else if (match[3] !== undefined) {
      parts.push(
        <code
          key={match.index}
          style={{
            fontFamily: 'monospace',
            fontSize:   '0.875em',
            background: 'var(--bg-hover)',
            padding:    '0.1em 0.35em',
            borderRadius: '0.25em',
          }}
        >
          {match[3]}
        </code>
      )
    }
    last = match.index + match[0].length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

/* ── Block-level renderer ───────────────────────────────────────── */
export function MarkdownMessage({ text }) {
  if (!text) return null

  const lines  = text.split('\n')
  const blocks = []
  let listItems  = []
  let listType   = null   // 'ul' | 'ol'
  let codeLines  = []
  let inCode     = false

  const flushList = () => {
    if (!listItems.length) return
    const Tag = listType === 'ol' ? 'ol' : 'ul'
    blocks.push(
      <Tag
        key={`list-${blocks.length}`}
        style={{
          paddingLeft: '1.375rem',
          margin:      '0.375rem 0',
          display:     'flex',
          flexDirection: 'column',
          gap:         '0.2rem',
        }}
      >
        {listItems.map((item, i) => (
          <li key={i} style={{ lineHeight: 1.6 }}>
            {renderInline(item)}
          </li>
        ))}
      </Tag>
    )
    listItems = []
    listType  = null
  }

  const flushCode = () => {
    if (!codeLines.length) return
    blocks.push(
      <pre
        key={`code-${blocks.length}`}
        style={{
          fontFamily:   'monospace',
          fontSize:     '0.85em',
          background:   'var(--bg-hover)',
          border:       '1px solid var(--border-subtle)',
          borderRadius: '0.5rem',
          padding:      '0.75rem 1rem',
          overflowX:    'auto',
          margin:       '0.375rem 0',
          whiteSpace:   'pre',
          lineHeight:   1.5,
        }}
      >
        {codeLines.join('\n')}
      </pre>
    )
    codeLines = []
  }

  for (let i = 0; i < lines.length; i++) {
    const raw  = lines[i]
    const line = raw.trimEnd()

    // ── Code fence ─────────────────────────────────────────────
    if (line.startsWith('```')) {
      if (inCode) {
        inCode = false
        flushCode()
      } else {
        flushList()
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeLines.push(raw)
      continue
    }

    // ── Heading ────────────────────────────────────────────────
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      flushList()
      const level = headingMatch[1].length
      const Tag   = `h${Math.min(level + 2, 6)}`  // h3/h4/h5 — never h1/h2 (page-level)
      const sizes = { 3: '1.025rem', 4: '0.975rem', 5: '0.9375rem', 6: '0.9rem' }
      blocks.push(
        <Tag
          key={`h-${blocks.length}`}
          style={{
            fontSize:    sizes[Math.min(level + 2, 6)],
            fontWeight:  700,
            color:       'var(--text-primary)',
            marginTop:   '0.625rem',
            marginBottom:'0.2rem',
            lineHeight:  1.3,
          }}
        >
          {renderInline(headingMatch[2])}
        </Tag>
      )
      continue
    }

    // ── Unordered list item ────────────────────────────────────
    const ulMatch = line.match(/^[ \t]*[-*+]\s+(.+)/)
    if (ulMatch) {
      if (listType === 'ol') flushList()
      listType = 'ul'
      listItems.push(ulMatch[1])
      continue
    }

    // ── Ordered list item ──────────────────────────────────────
    const olMatch = line.match(/^[ \t]*\d+\.\s+(.+)/)
    if (olMatch) {
      if (listType === 'ul') flushList()
      listType = 'ol'
      listItems.push(olMatch[1])
      continue
    }

    // ── Horizontal rule ────────────────────────────────────────
    if (/^[-*_]{3,}\s*$/.test(line)) {
      flushList()
      blocks.push(
        <hr
          key={`hr-${blocks.length}`}
          style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }}
        />
      )
      continue
    }

    // ── Empty line — flush list, add paragraph gap ─────────────
    if (line.trim() === '') {
      flushList()
      // Only add spacer if there is already content (avoid leading blank)
      if (blocks.length > 0) {
        blocks.push(<div key={`sp-${blocks.length}`} style={{ height: '0.35rem' }} />)
      }
      continue
    }

    // ── Regular paragraph line ─────────────────────────────────
    flushList()
    blocks.push(
      <p
        key={`p-${blocks.length}`}
        style={{ margin: 0, lineHeight: 1.7 }}
      >
        {renderInline(line)}
      </p>
    )
  }

  // Flush any remaining list or code block
  flushList()
  if (inCode) flushCode()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
      {blocks}
    </div>
  )
}
