-- Enable pgvector once per database
CREATE EXTENSION IF NOT EXISTS vector;

-- Schema for Gemini embeddings (768 dimensions)
-- Use this if you're using Gemini's embedding-001 model
CREATE TABLE IF NOT EXISTS doc_chunks (
  id BIGSERIAL PRIMARY KEY,
  source_id TEXT,              -- e.g., "course:xyz:video:10"
  chunk_id TEXT UNIQUE,
  text TEXT,
  tags TEXT[],
  start_offset INT,
  end_offset INT,
  embedding vector(768)        -- Gemini embedding-001 uses 768 dimensions
);

-- ANN index for fast search (remember to ANALYZE after loading data)
CREATE INDEX IF NOT EXISTS doc_chunks_ivfflat
ON doc_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- For metadata queries
CREATE INDEX IF NOT EXISTS doc_chunks_source_idx ON doc_chunks(source_id);
