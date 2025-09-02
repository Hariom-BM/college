// Database setup script for Gemini embeddings
// This script ensures the correct schema is in place for the ingestion system

import { query } from '../src/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🔧 Setting up database for Gemini embeddings...\n');
  
  try {
    // Enable pgvector extension
    console.log('📦 Enabling pgvector extension...');
    await query('CREATE EXTENSION IF NOT EXISTS vector;', []);
    console.log('✅ pgvector extension enabled');
    
    // Create the doc_chunks table with 768-dimensional vectors
    console.log('\n📋 Creating doc_chunks table...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS doc_chunks (
        id BIGSERIAL PRIMARY KEY,
        source_id TEXT,
        chunk_id TEXT UNIQUE,
        text TEXT,
        tags TEXT[],
        start_offset INT,
        end_offset INT,
        embedding vector(768)
      );
    `;
    await query(createTableSQL, []);
    console.log('✅ doc_chunks table created/verified');
    
    // Create indexes for performance
    console.log('\n🚀 Creating performance indexes...');
    
    // Vector similarity search index
    const vectorIndexSQL = `
      CREATE INDEX IF NOT EXISTS doc_chunks_ivfflat
      ON doc_chunks USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `;
    await query(vectorIndexSQL, []);
    console.log('✅ Vector similarity index created');
    
    // Source ID index for metadata queries
    const sourceIndexSQL = `
      CREATE INDEX IF NOT EXISTS doc_chunks_source_idx 
      ON doc_chunks(source_id);
    `;
    await query(sourceIndexSQL, []);
    console.log('✅ Source ID index created');
    
    // Check if table has data
    console.log('\n📊 Checking table status...');
    const countResult = await query('SELECT COUNT(*) as count FROM doc_chunks;', []);
    const count = parseInt(countResult.rows[0].count);
    console.log(`📈 Table contains ${count} chunks`);
    
    if (count > 0) {
      // Analyze table for better query performance
      console.log('\n🔍 Analyzing table for optimal performance...');
      await query('ANALYZE doc_chunks;', []);
      console.log('✅ Table analysis completed');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Schema Summary:');
    console.log('   - Table: doc_chunks');
    console.log('   - Vector dimensions: 768 (Gemini embedding-001)');
    console.log('   - Indexes: vector similarity, source_id');
    console.log('   - Ready for ingestion!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n🔍 Troubleshooting tips:');
    console.error('   1. Check DATABASE_URL in your .env file');
    console.error('   2. Ensure PostgreSQL is running');
    console.error('   3. Verify you have CREATE EXTENSION permissions');
    console.error('   4. Check if pgvector is installed in PostgreSQL');
    process.exit(1);
  }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
