# Optimized RAG Ingestion System

This directory contains an optimized ingestion system for large text files that addresses memory issues and provides efficient processing for your RAG system.

## 🚀 Key Features

- **Memory-safe line-by-line processing**: Processes files line by line without loading entire contents into memory
- **Efficient chunking**: Creates chunks with configurable size and overlap as text is read
- **Batch processing**: Efficient database operations with configurable batch sizes
- **Error handling**: Retry logic and graceful error recovery
- **Progress tracking**: Real-time progress updates and performance metrics
- **Configurable**: Easy tuning via configuration file or environment variables

## 📁 Files

- `ingest-optimized.js` - Main optimized ingestion script with line-by-line processing
- `ingest-config.js` - Configuration and validation
- `test-ingestion.js` - Test script to verify the system works
- `README-INGESTION.md` - This documentation

## 🛠️ Installation & Setup

1. **Ensure dependencies are installed**:
   ```bash
   npm install
   ```

2. **Set up environment variables** (see `.env.example`):
   ```bash
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key
   DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
   ```

3. **Verify database schema**:
   - Ensure `pgvector` extension is enabled
   - Table `doc_chunks` exists with `vector(768)` column for Gemini embeddings

## 🚀 Usage

### Basic Usage

```bash
# Process all .txt files in data/raw directory
node scripts/ingest-optimized.js
```

### Test the System

```bash
# Run a test with a small sample file
node scripts/test-ingestion.js
```

### Environment Variable Overrides

```bash
# Override configuration via environment variables
MAX_CONCURRENT_CHUNKS=3 \
EMBEDDING_BATCH_SIZE=5 \
DB_BATCH_SIZE=25 \
node scripts/ingest-optimized.js
```

## ⚙️ Configuration

### Default Settings

```javascript
{
  MAX_CONCURRENT_CHUNKS: 5,        // Max chunks processed in parallel
  EMBEDDING_BATCH_SIZE: 10,        // Max texts sent to embedding API at once
  DB_BATCH_SIZE: 50,               // Max chunks inserted in single DB transaction
  CHUNK_SIZE: 2500,                // Characters per chunk
  CHUNK_OVERLAP: 300,              // Overlap between chunks
  MAX_FILE_SIZE_MB: 100,           // Skip files larger than this
  RETRY_ATTEMPTS: 3,               // Retry failed operations
  RETRY_DELAY_MS: 1000,            // Delay between retries
}
```

### Tuning Recommendations

#### For Memory-Constrained Systems
```bash
MAX_CONCURRENT_CHUNKS=2 \
EMBEDDING_BATCH_SIZE=5 \
DB_BATCH_SIZE=25 \
node scripts/ingest-optimized.js
```

#### For High-Performance Systems
```bash
MAX_CONCURRENT_CHUNKS=10 \
EMBEDDING_BATCH_SIZE=20 \
DB_BATCH_SIZE=100 \
node scripts/ingest-optimized.js
```

#### For Large Files (>100MB)
```bash
MAX_CONCURRENT_CHUNKS=3 \
EMBEDDING_BATCH_SIZE=5 \
DB_BATCH_SIZE=25 \
MAX_FILE_SIZE_MB=500 \
node scripts/ingest-optimized.js
```

## 🔧 How It Works

### 1. File Processing
- **Line-by-line reading**: Files are read line by line using Node.js readline interface
- **Buffer management**: Text is accumulated in a small buffer until chunk size is reached
- **Size limits**: Files larger than `MAX_FILE_SIZE_MB` are skipped
- **Chunking**: Text is split into chunks with configurable size and overlap

### 2. Memory Management
- **Minimal memory footprint**: Only keeps current line and small buffer in memory
- **Batch processing**: Chunks are processed in small batches to prevent memory buildup
- **Immediate processing**: Chunks are processed as they're generated, not stored all at once
- **Buffer clearing**: Processed chunks are immediately cleared from memory

### 3. Embedding Generation
- **API batching**: Multiple texts are sent to Gemini API in batches
- **Rate limiting**: Built-in delays prevent overwhelming the API
- **Retry logic**: Failed requests are automatically retried

### 4. Database Operations
- **Batch inserts**: Multiple chunks are inserted in single transactions
- **Conflict handling**: Uses `ON CONFLICT` for upsert operations
- **Efficient queries**: Optimized SQL with parameterized queries

## 📊 Performance Monitoring

The script provides real-time feedback:

```
🚀 Starting optimized ingestion with line-by-line processing...
📊 Configuration: 5 concurrent, 10 embedding batch, 50 DB batch
📁 Reading from /path/to/data/raw
📁 Processing javascript-basics.txt...
   📖 Reading file line by line...
   💾 Processed 10 chunks
   💾 Processed 10 chunks
   💾 Processed 5 chunks
   📄 Generated 25 chunks
📁 Processing python-basics.txt...
   📖 Reading file line by line...
   💾 Processed 10 chunks
   💾 Processed 8 chunks
   📄 Generated 18 chunks
🔧 Optimizing database...

✅ Ingestion completed successfully!
📊 Summary:
   Files processed: 2
   Chunks inserted: 43
   Errors: 0
   Duration: 8.7s
   Rate: 4.9 chunks/second
```

## 🚨 Troubleshooting

### Common Issues

#### "JavaScript heap out of memory"
- Reduce `EMBEDDING_BATCH_SIZE` to 5
- Reduce `DB_BATCH_SIZE` to 25
- The line-by-line approach should prevent this, but batch sizes can help

#### API Rate Limits
- Reduce `EMBEDDING_BATCH_SIZE` to 5-10
- Increase `RETRY_DELAY_MS` to 2000-5000

#### Database Connection Issues
- Check `DATABASE_URL` in your `.env` file
- Ensure PostgreSQL is running and accessible
- Verify `pgvector` extension is installed

#### Slow Performance
- Increase `EMBEDDING_BATCH_SIZE` for better API efficiency
- Increase `DB_BATCH_SIZE` for better database performance
- Check network latency to Gemini API

### Debug Mode

Add more verbose logging by modifying the script:

```javascript
// Add this near the top of ingest-optimized.js
const DEBUG = process.env.DEBUG === 'true';

// Then use throughout the code:
if (DEBUG) console.log('Debug info:', someVariable);
```

## 🔄 Migration from Old Script

If you're migrating from the old `ingest.js`:

1. **Backup your data** (if needed)
2. **Test with small files first** using `test-ingestion.js`
3. **Run the optimized script** on your data
4. **Monitor memory usage** and adjust configuration as needed

## 📈 Scaling Considerations

### For Very Large Datasets (>1GB)
- The line-by-line approach handles files of any size efficiently
- Consider splitting files only if you need parallel processing
- Monitor batch processing performance

### For Production Use
- Add monitoring and alerting
- Implement proper logging (Winston, Pino, etc.)
- Add health checks and metrics collection
- Consider using a job queue (Bull, Agenda, etc.)

## 🤝 Contributing

When modifying the ingestion system:

1. **Test with various file sizes** (1KB to 100MB+)
2. **Monitor memory usage** during processing
3. **Verify database performance** with large datasets
4. **Update this documentation** for any new features

## 📚 Additional Resources

- [Node.js Readline Documentation](https://nodejs.org/api/readline.html)
- [PostgreSQL pgvector Documentation](https://github.com/pgvector/pgvector)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Memory Management in Node.js](https://nodejs.org/en/docs/guides/memory-management/)
