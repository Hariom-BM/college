-- Enable pgvector once per database
CREATE EXTENSION IF NOT EXISTS vector;

-- Adjust dimensions to match your embedding model
-- 1536 for text-embedding-3-small, 3072 for -large
CREATE TABLE IF NOT EXISTS doc_chunks (
  id BIGSERIAL PRIMARY KEY,
  source_id TEXT,              -- e.g., "course:xyz:video:10"
  chunk_id TEXT UNIQUE,
  text TEXT,
  tags TEXT[],
  start_offset INT,
  end_offset INT,
  embedding vector(1536)
);

-- ANN index for fast search (remember to ANALYZE after loading data)
CREATE INDEX IF NOT EXISTS doc_chunks_ivfflat
ON doc_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- For metadata queries
CREATE INDEX IF NOT EXISTS doc_chunks_source_idx ON doc_chunks(source_id);
