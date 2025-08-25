import express from 'express';
import { CONFIG } from './config.js';
import { answer } from './rag.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Serve the chat interface at root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Simple test endpoint without database
app.post('/test', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question is required' });
    
    res.json({
      answer: `This is a test response to: "${question}". The database is not set up yet, but the API is working!`,
      sources: []
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal_error', details: e.message });
  }
});

app.post('/ask', async (req, res) => {
  try {
    const { question, scope = null, k = 8 } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question is required' });
    const result = await answer({ q: question, scope, k });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal_error', details: e.message });
  }
});

app.listen(CONFIG.PORT, () => console.log(`RAG server running on :${CONFIG.PORT}`));
