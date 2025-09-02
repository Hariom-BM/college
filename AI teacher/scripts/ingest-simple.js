// Simplified ingestion script with better memory management
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanText, chunkText } from '../src/chunk.js';
import { embedTexts } from '../src/embed.js';
import { query } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '..', 'data', 'raw');

async function ensureDir(p) { 
    try { 
        await fs.mkdir(p, { recursive: true }); 
    } catch {} 
}

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

async function processFile(file) {
    const base = path.basename(file, '.txt');
    const source_id = base;
    
    console.log(`Processing: ${base}`);
    
    try {
        const raw = await fs.readFile(file, 'utf8');
        const cleaned = cleanText(raw);
        const chunks = chunkText(cleaned, { maxChars: 1000, overlap: 200 }); // Smaller chunks

        console.log(`  → ${chunks.length} chunks created`);

        // Process chunks in very small batches
        const batchSize = 5; // Much smaller batch size
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            
            try {
                const embeddings = await embedTexts(batch.map((c) => c.text));
                
                for (let j = 0; j < batch.length; j++) {
                    const chunk = batch[j];
                    await upsertChunk({
                        source_id,
                        chunk_id: `${base}::${i + j}`,
                        text: chunk.text,
                        tags: [],
                        start: chunk.start,
                        end: chunk.end,
                        embedding: embeddings[j],
                    });
                }
                
                console.log(`    - processed ${Math.min(i + batchSize, chunks.length)} / ${chunks.length} chunks`);
                
                // Small delay to prevent overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`    - Error processing batch ${i}-${i + batchSize}:`, error.message);
            }
        }
        
        console.log(`  ✅ Completed: ${base}`);
        
    } catch (error) {
        console.error(`  ❌ Error processing ${base}:`, error.message);
    }
}

async function main() {
    await ensureDir(RAW_DIR);
    console.log('Reading from', RAW_DIR);

    const files = [];
    for await (const file of iterTextFiles(RAW_DIR)) {
        files.push(file);
    }

    console.log(`Found ${files.length} text files`);

    // Process files one by one to manage memory
    for (const file of files) {
        await processFile(file);
        // Small delay between files
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Helpful after bulk load
    try {
        await query('ANALYZE doc_chunks;', []);
        console.log('✅ Database analysis completed');
    } catch (error) {
        console.log('⚠️  Database analysis failed:', error.message);
    }

    console.log('🎉 Ingestion completed!');
}

main().catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
});
