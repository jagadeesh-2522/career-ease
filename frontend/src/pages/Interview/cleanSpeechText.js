/**
 * cleanSpeechText — strip Markdown formatting so SpeechSynthesis reads
 * the response naturally without saying "asterisk" or "hash".
 *
 * This function operates on a COPY of the text only — it never modifies
 * the original display text that appears in the chat bubble.
 *
 * @param  {string} text  Original AI response (may contain Markdown)
 * @returns {string}      Plain text safe for SpeechSynthesisUtterance
 */
export function cleanSpeechText(text) {
  if (!text) return ''

  return text
    // ── Headings: "## Title" → "Title" ──────────────────────────────
    .replace(/^#{1,6}\s+/gm, '')

    // ── Bold / italic: **text**, __text__, *text*, _text_ → text ────
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')   // bold-italic
    .replace(/___(.+?)___/g,        '$1')
    .replace(/\*\*(.+?)\*\*/g,      '$1')   // bold
    .replace(/__(.+?)__/g,          '$1')
    .replace(/\*(.+?)\*/g,          '$1')   // italic
    .replace(/_(.+?)_/g,            '$1')

    // ── Inline code: `code` → code ──────────────────────────────────
    .replace(/`([^`]+)`/g, '$1')

    // ── Code blocks: ```lang … ``` → contents only ──────────────────
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')

    // ── Links: [label](url) → label ─────────────────────────────────
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

    // ── Images: ![alt](url) → alt ───────────────────────────────────
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

    // ── Horizontal rules: ---, ***, ___ → (pause) ───────────────────
    .replace(/^(?:[-*_]){3,}\s*$/gm, '.')

    // ── Blockquotes: "> text" → "text" ──────────────────────────────
    .replace(/^>\s?/gm, '')

    // ── Unordered bullets: "- item" or "* item" → "item." ───────────
    // Convert each bullet into a sentence-ending phrase for natural flow
    .replace(/^[ \t]*[-*+]\s+(.+)$/gm, '$1.')

    // ── Ordered lists: "1. item" → "item." ──────────────────────────
    .replace(/^[ \t]*\d+\.\s+(.+)$/gm, '$1.')

    // ── Remove leftover Markdown table pipes ─────────────────────────
    .replace(/\|/g, ' ')

    // ── Collapse excess whitespace / blank lines ─────────────────────
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}
