// Minimal ingestion: read plain .txt files from ./data/raw and load into DB.
// Each file becomes multiple chunks with embeddings.

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanText, chunkText } from '../src/chunk.js';
import { embedTexts } from '../src/embed.js';
import { query } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '..', 'data', 'raw');

async function ensureDir(p) { try { await fs.mkdir(p, { recursive: true }); } catch {} }

async function* iterTextFiles(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      yield* iterTextFiles(full);
    } else if (it.isFile() && it.name.endsWith('.txt')) {
      yield full;
    }
  }
}

async function upsertChunk({ source_id, chunk_id, text, tags = [], start, end, embedding }) {
  const embStr = `[${embedding.join(',')}]`;
  await query(
    `INSERT INTO doc_chunks (source_id, chunk_id, text, tags, start_offset, end_offset, embedding)
     VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
     ON CONFLICT (chunk_id)
     DO UPDATE SET text = EXCLUDED.text, tags = EXCLUDED.tags, start_offset = EXCLUDED.start_offset, end_offset = EXCLUDED.end_offset, embedding = EXCLUDED.embedding`,
    [source_id, chunk_id, text, tags, start, end, embStr]
  );
}

async function main() {
  await ensureDir(RAW_DIR);
  console.log('Reading from', RAW_DIR);

  for await (const file of iterTextFiles(RAW_DIR)) {
    const base = path.basename(file, '.txt');
    const source_id = base; // you can map to course/video ids
    const raw = await fs.readFile(file, 'utf8');
    const cleaned = cleanText(raw);
    const chunks = chunkText(cleaned, { maxChars: 2500, overlap: 300 });

    console.log(`→ ${base}: ${chunks.length} chunks`);

    // Embed in batches to avoid rate limits
    const batchSize = 32;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await embedTexts(batch.map((c) => c.text));
      await Promise.all(
        batch.map((c, j) =>
          upsertChunk({
            source_id,
            chunk_id: `${base}::${i + j}`,
            text: c.text,
            tags: [],
            start: c.start,
            end: c.end,
            embedding: embeddings[j],
          })
        )
      );
      console.log(`   - inserted ${Math.min(i + batchSize, chunks.length)} / ${chunks.length}`);
    }
  }

  // Helpful after bulk load
  await query('ANALYZE doc_chunks;', []);
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
