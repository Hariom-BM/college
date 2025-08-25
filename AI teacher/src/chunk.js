// Super-simple cleaner + chunker for demo (character-based).
// For production, switch to token-based chunking with tiktoken or approximate via byte length.

export function cleanText(raw) {
  return raw
    .replace(/\s+/g, ' ')          // collapse whitespace
    .replace(/\u200b/g, '')        // zero-width
    .trim();
}

export function chunkText(text, { maxChars = 2500, overlap = 300 } = {}) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + maxChars, text.length);
    const slice = text.slice(i, end);
    chunks.push({ text: slice, start: i, end });
    i = end - overlap; // backtrack for overlap
    if (i < 0) i = 0;
    if (i >= text.length) break;
  }
  return chunks;
}
