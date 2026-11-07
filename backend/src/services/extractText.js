import pdfParse from 'pdf-parse'
import mammoth  from 'mammoth'

const MIN_TEXT_LENGTH = 50   // anything under this is considered unreadable

/**
 * Extract plain text from a PDF or DOCX buffer.
 *
 * @param {Buffer} buffer    Raw file bytes
 * @param {string} mimeType  'application/pdf' | 'application/vnd.openxmlformats...'
 * @returns {Promise<string>} Cleaned, readable text
 * @throws  {Error}           If extraction fails or text is too short to be useful
 */
export async function extractText(buffer, mimeType) {
  let rawText = ''

  if (mimeType === 'application/pdf') {
    const result = await pdfParse(buffer)
    rawText = result.text ?? ''
  } else {
    // DOCX — mammoth extracts clean text from Word documents
    const result = await mammoth.extractRawText({ buffer })
    rawText = result.value ?? ''
  }

  const cleaned = cleanText(rawText)

  if (cleaned.length < MIN_TEXT_LENGTH) {
    throw new Error(
      'Could not extract readable text from this file. ' +
      'It may be a scanned image, password-protected, or empty.',
    )
  }

  return cleaned
}

/**
 * Normalise whitespace and remove non-printable characters.
 * Preserves paragraph structure (double newlines) for better AI context.
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')           // normalise line endings
    .replace(/\r/g, '\n')
    .replace(/[^\x20-\x7E\n]/g, ' ')  // strip non-printable ASCII
    .replace(/[ \t]+/g, ' ')          // collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')       // max two consecutive newlines
    .trim()
}
