# RAG JS Starter (Neon + OpenAI/Gemini)

## 1) Setup
- Create Neon Postgres DB -> run `sql/schema.sql`
- `cp env.example .env` and fill keys
- `npm i`

## 2) Configure AI Provider

### Option A: OpenAI
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_EMBED_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
```

### Option B: Gemini
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_CHAT_MODEL=gemini-1.5-flash
GEMINI_EMBED_MODEL=embedding-001
```

## 3) Ingest your content
- Put `.txt` lesson files into `data/raw/` (create folder)
- Run: `npm run ingest`

## 4) Start API
- `npm run dev`
- POST `http://localhost:3000/ask` with JSON:
```json
{
  "question": "What is load balancing?",
  "scope": "lecture-10" ,
  "k": 8
}
```

## 5) Notes
- Adjust `vector(1536)` in SQL if you use a different embedding model.
- Use a proper tokenizer for chunking in production.
- Add auth/rate limits before exposing publicly.
- Gemini embedding model `embedding-001` produces 768-dimensional vectors, so update the SQL schema accordingly if switching from OpenAI.
