// Configuration file for the optimized ingestion script
// Adjust these values based on your system capabilities and requirements

export const INGESTION_CONFIG = {
  // Concurrency and batching
  MAX_CONCURRENT_CHUNKS: 5,        // Max chunks processed in parallel (reduce if memory issues)
  EMBEDDING_BATCH_SIZE: 10,        // Max texts sent to embedding API at once (reduce if API rate limits)
  DB_BATCH_SIZE: 50,               // Max chunks inserted in single DB transaction (increase for better performance)
  
  // Chunking parameters
  CHUNK_SIZE: 2500,                // Characters per chunk
  CHUNK_OVERLAP: 300,              // Overlap between chunks
  
  // File processing limits
  MAX_FILE_SIZE_MB: 100,           // Skip files larger than this (MB)
  
  // Error handling and retries
  RETRY_ATTEMPTS: 3,               // Retry failed operations
  RETRY_DELAY_MS: 1000,            // Delay between retries (ms)
  
  // System tuning
  DELAY_BETWEEN_FILES_MS: 100,     // Delay between processing files (ms)
  BATCH_PROCESSING_DELAY_MS: 50,   // Delay between processing batches (ms)
  
  // Memory management
  MAX_CHUNKS_IN_MEMORY: 1000,      // Max chunks to keep in memory at once
  STREAM_BUFFER_SIZE: 64 * 1024,   // Stream buffer size in bytes (64KB default)
};

// Environment-specific overrides
export function getConfig() {
  const config = { ...INGESTION_CONFIG };
  
  // Override with environment variables if present
  if (process.env.MAX_CONCURRENT_CHUNKS) {
    config.MAX_CONCURRENT_CHUNKS = parseInt(process.env.MAX_CONCURRENT_CHUNKS);
  }
  
  if (process.env.EMBEDDING_BATCH_SIZE) {
    config.EMBEDDING_BATCH_SIZE = parseInt(process.env.EMBEDDING_BATCH_SIZE);
  }
  
  if (process.env.DB_BATCH_SIZE) {
    config.DB_BATCH_SIZE = parseInt(process.env.DB_BATCH_SIZE);
  }
  
  if (process.env.MAX_FILE_SIZE_MB) {
    config.MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB);
  }
  
  if (process.env.CHUNK_SIZE) {
    config.CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE);
  }
  
  if (process.env.CHUNK_OVERLAP) {
    config.CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP);
  }
  
  return config;
}

// Validation function
export function validateConfig(config) {
  const errors = [];
  
  if (config.MAX_CONCURRENT_CHUNKS < 1 || config.MAX_CONCURRENT_CHUNKS > 20) {
    errors.push('MAX_CONCURRENT_CHUNKS should be between 1 and 20');
  }
  
  if (config.EMBEDDING_BATCH_SIZE < 1 || config.EMBEDDING_BATCH_SIZE > 50) {
    errors.push('EMBEDDING_BATCH_SIZE should be between 1 and 50');
  }
  
  if (config.DB_BATCH_SIZE < 1 || config.DB_BATCH_SIZE > 200) {
    errors.push('DB_BATCH_SIZE should be between 1 and 200');
  }
  
  if (config.CHUNK_SIZE < 100 || config.CHUNK_SIZE > 10000) {
    errors.push('CHUNK_SIZE should be between 100 and 10000');
  }
  
  if (config.CHUNK_OVERLAP < 0 || config.CHUNK_OVERLAP >= config.CHUNK_SIZE) {
    errors.push('CHUNK_OVERLAP should be >= 0 and < CHUNK_SIZE');
  }
  
  if (config.MAX_FILE_SIZE_MB < 1 || config.MAX_FILE_SIZE_MB > 1000) {
    errors.push('MAX_FILE_SIZE_MB should be between 1 and 1000');
  }
  
  if (errors.length > 0) {
    throw new Error('Configuration validation failed:\n' + errors.join('\n'));
  }
  
  return true;
}
