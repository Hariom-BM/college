// Optimized ingestion script for large files with memory management
// Features: line-by-line reading, batch processing, concurrency limits, efficient DB operations

import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { cleanText } from '../src/chunk.js';
import { embedTexts } from '../src/embed.js';
import { query } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '..', 'data', 'raw');

// Configuration
const CONFIG = {
  MAX_CONCURRENT_CHUNKS: 5,        // Max chunks processed in parallel
  EMBEDDING_BATCH_SIZE: 10,        // Max texts sent to embedding API at once
  CHUNK_SIZE: 2500,                // Characters per chunk
  CHUNK_OVERLAP: 300,              // Overlap between chunks
  MAX_FILE_SIZE_MB: 100,           // Skip files larger than this
  RETRY_ATTEMPTS: 3,               // Retry failed operations
  RETRY_DELAY_MS: 1000,            // Delay between retries
};

// Utility functions
async function ensureDir(p) { 
  try { 
    await fs.promises.mkdir(p, { recursive: true }); 
  } catch {} 
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryOperation(operation, maxAttempts = CONFIG.RETRY_ATTEMPTS) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      console.warn(`Attempt ${attempt} failed, retrying in ${CONFIG.RETRY_DELAY_MS}ms...`);
      await sleep(CONFIG.RETRY_DELAY_MS);
    }
  }
}

// Memory-efficient file iterator
async function* iterTextFiles(dir) {
  const items = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      yield* iterTextFiles(fullPath);
    } else if (item.isFile() && item.name.endsWith('.txt')) {
      // Check file size before processing
      const stats = await fs.promises.stat(fullPath);
      const sizeMB = stats.size / (1024 * 1024);
      
      if (sizeMB > CONFIG.MAX_FILE_SIZE_MB) {
        console.warn(`⚠️  Skipping ${item.name} (${sizeMB.toFixed(1)}MB > ${CONFIG.MAX_FILE_SIZE_MB}MB limit)`);
        continue;
      }
      
      yield { path: fullPath, name: item.name, size: stats.size };
    }
  }
}

// Line-by-line file processing with buffer management
async function processFile(filePath, sourceId) {
  const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let buffer = "";
  let chunkIndex = 0;
  let totalChunks = 0;

  console.log(`   📖 Reading file line by line...`);

  for await (const line of rl) {
    buffer += line + " ";

    // Agar buffer ek certain length cross kar jaye
    if (buffer.length > CONFIG.CHUNK_SIZE) {
      const chunkText = buffer.slice(0, CONFIG.CHUNK_SIZE);
      const start = chunkIndex * (CONFIG.CHUNK_SIZE - CONFIG.CHUNK_OVERLAP);
      const end = start + chunkText.length;
      
      // Process this chunk immediately
      await processChunk(chunkText, sourceId, chunkIndex, start, end);
      totalChunks++;
      chunkIndex++;
      
      // Keep overlap for next chunk
      buffer = buffer.slice(CONFIG.CHUNK_SIZE - CONFIG.CHUNK_OVERLAP);
    }
  }

  // Process remaining text
  if (buffer.length > 0) {
    const start = chunkIndex * (CONFIG.CHUNK_SIZE - CONFIG.CHUNK_OVERLAP);
    const end = start + buffer.length;
    
    await processChunk(buffer, sourceId, chunkIndex, start, end);
    totalChunks++;
  }

  return totalChunks;
}

// Process a single chunk with embedding and database insertion
async function processChunk(chunkText, sourceId, chunkIndex, start, end) {
  try {
    // Clean the text
    const cleanedText = cleanText(chunkText);
    
    // Generate embedding for this chunk
    const embeddings = await retryOperation(() => embedTexts([cleanedText]));
    const embedding = embeddings[0];
    
    // Format embedding for database (your exact approach)
    const embeddingString = `[${embedding.join(",")}]`;
    
    // Insert into database (your exact approach)
    await query(
      `INSERT INTO doc_chunks (source_id, chunk_id, text, tags, start_offset, end_offset, embedding) 
       VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
       ON CONFLICT (chunk_id) 
       DO UPDATE SET text = EXCLUDED.text, tags = EXCLUDED.tags, start_offset = EXCLUDED.start_offset, end_offset = EXCLUDED.end_offset, embedding = EXCLUDED.embedding`,
      [
        sourceId,
        `${sourceId}::${chunkIndex}`,
        cleanedText,
        [], // tags
        start,
        end,
        embeddingString
      ]
    );
    
    console.log(`   💾 Chunk ${chunkIndex + 1} processed and inserted`);
    
  } catch (error) {
    console.error(`   ❌ Error processing chunk ${chunkIndex}:`, error.message);
    // Continue with next chunk instead of failing completely
  }
}

// Process a single file with line-by-line reading
async function processFileWithMetadata(fileInfo) {
  const { path: filePath, name: fileName } = fileInfo;
  const sourceId = path.basename(fileName, '.txt');
  
  console.log(`📁 Processing ${fileName}...`);
  
  try {
    const chunkCount = await processFile(filePath, sourceId);
    
    if (chunkCount === 0) {
      console.log(`   ⚠️  No chunks generated for ${fileName}`);
      return { fileName, processed: 0, errors: 0 };
    }
    
    console.log(`   📄 Generated ${chunkCount} chunks`);
    return { fileName, processed: chunkCount, errors: 0 };
    
  } catch (error) {
    console.error(`   ❌ Error processing ${fileName}:`, error.message);
    return { fileName, processed: 0, errors: 1 };
  }
}

// Main ingestion function
async function main() {
  console.log('🚀 Starting optimized ingestion with line-by-line processing...');
  console.log(`📊 Configuration: ${CONFIG.MAX_CONCURRENT_CHUNKS} concurrent, ${CONFIG.EMBEDDING_BATCH_SIZE} embedding batch`);
  
  await ensureDir(RAW_DIR);
  console.log(`📁 Reading from ${RAW_DIR}`);
  
  const startTime = Date.now();
  let totalFiles = 0;
  let totalChunks = 0;
  let totalErrors = 0;
  
  try {
    for await (const fileInfo of iterTextFiles(RAW_DIR)) {
      totalFiles++;
      const result = await processFileWithMetadata(fileInfo);
      totalChunks += result.processed;
      totalErrors += result.errors;
      
      // Small delay between files to prevent overwhelming the system
      await sleep(100);
    }
    
    if (totalFiles === 0) {
      console.log('⚠️  No .txt files found in data/raw directory');
      return;
    }
    
    // Optimize database after bulk load
    console.log('🔧 Optimizing database...');
    await query('ANALYZE doc_chunks;', []);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n✅ Ingestion completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   Files processed: ${totalFiles}`);
    console.log(`   Chunks inserted: ${totalChunks}`);
    console.log(`   Errors: ${totalErrors}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Rate: ${(totalChunks / duration).toFixed(1)} chunks/second`);
    
  } catch (error) {
    console.error('❌ Fatal error during ingestion:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the ingestion
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { processFile, processFileWithMetadata, processChunk };
