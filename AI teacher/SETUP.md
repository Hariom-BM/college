# Setup Guide - RAG JS Starter

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your API keys
```

### 3. Choose Your AI Provider

#### Option A: OpenAI
Edit `.env`:
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_EMBED_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
DATABASE_URL=your-neon-postgres-url
```

#### Option B: Gemini
Edit `.env`:
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_CHAT_MODEL=gemini-1.5-flash
GEMINI_EMBED_MODEL=embedding-001
DATABASE_URL=your-neon-postgres-url
```

### 4. Set Up Database

#### For OpenAI (1536 dimensions):
```sql
-- Run sql/schema.sql on your Neon database
```

#### For Gemini (768 dimensions):
```sql
-- Run sql/schema-gemini.sql on your Neon database
```

### 5. Add Your Content
```bash
# Put .txt files in data/raw/
echo "Your lesson content here..." > data/raw/lesson1.txt
```

### 6. Ingest Content
```bash
npm run ingest
```

### 7. Start Server
```bash
npm run dev
```

### 8. Test API
```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this about?", "k": 5}'
```

## API Keys

### OpenAI
- Get your API key from: https://platform.openai.com/api-keys
- Models: `text-embedding-3-small`, `gpt-4o-mini`, `gpt-4o`

### Gemini
- Get your API key from: https://makersuite.google.com/app/apikey
- Models: `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-pro`
- Embedding model: `embedding-001`

## Database Setup

### Neon (Recommended)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Run the appropriate schema file in the SQL editor

### Local PostgreSQL
1. Install PostgreSQL with pgvector extension
2. Create a database
3. Run the schema file

## Troubleshooting

### Common Issues:
1. **Missing API Key**: Make sure your API key is set in `.env`
2. **Wrong Provider**: Check `AI_PROVIDER` in `.env`
3. **Database Connection**: Verify `DATABASE_URL` format
4. **Vector Dimensions**: Use correct schema for your embedding model

### Error Messages:
- `Missing OPENAI_API_KEY`: Set your OpenAI key in `.env`
- `Missing GEMINI_API_KEY`: Set your Gemini key in `.env`
- `Cannot find package`: Run `npm install`
- `vector dimension mismatch`: Use correct schema file
