import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from './config.js';
import { query } from './db.js';
import { embedQuery } from './embed.js';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);

function toSqlVector(emb) {
  // pgvector accepts string like '[0.1, 0.2, ...]'
  return `[${emb.join(',')}]`;
}

export async function retrieve({ q, k = 8, scope = null }) {
  try {
    const qEmb = await embedQuery(q);
    const sqlVector = toSqlVector(qEmb);

    const { rows } = await query(
      `SELECT chunk_id, source_id, text, start_offset, end_offset,
              (embedding <=> $1::vector) AS distance
       FROM doc_chunks
       WHERE ($2::text IS NULL OR source_id = $2)
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [sqlVector, scope, k]
    );

    return rows;
  } catch (error) {
    console.error('Database retrieval error:', error.message);
    // Return empty results if database is not available
    return [];
  }
}

// OpenAI chat completion
async function chatCompletionOpenAI(system, user) {
  const chat = await openai.chat.completions.create({
    model: CONFIG.OPENAI_CHAT_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
  });
  return chat.choices[0]?.message?.content || '';
}

// Gemini chat completion
async function chatCompletionGemini(system, user) {
  const model = genAI.getGenerativeModel({ model: CONFIG.GEMINI_CHAT_MODEL });
  
  const prompt = `${system}\n\n${user}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function answer({ q, scope = CONFIG.DEFAULT_SCOPE, k = 8 }) {
  const results = await retrieve({ q, k, scope });

  let context = '';
  if (results && results.length > 0) {
    context = results.map((r, i) => `# SOURCE ${i+1} | ${r.source_id} [${r.start_offset}-${r.end_offset}]\n${r.text}`).join('\n\n');
  } else {
    // Fallback context when no database results
    context = `# GENERAL KNOWLEDGE
This is a general question about ${q.toLowerCase().includes('ai') ? 'artificial intelligence' : 'various topics'}. 
Please provide a helpful response based on your general knowledge.`;
  }

  const system = `You are an AI teaching assistant. Answer the question using the provided CONTEXT. If the answer is not in the context, provide a helpful general response. Keep answers concise and cite sources by SOURCE number when available.`;

  const user = `QUESTION:\n${q}\n\nCONTEXT:\n${context}`;

  let answer;
  if (CONFIG.AI_PROVIDER === 'openai') {
    answer = await chatCompletionOpenAI(system, user);
  } else if (CONFIG.AI_PROVIDER === 'gemini') {
    answer = await chatCompletionGemini(system, user);
  } else {
    throw new Error(`Unsupported AI provider: ${CONFIG.AI_PROVIDER}`);
  }

  return {
    answer,
    sources: results ? results.map((r, i) => ({
      source: i + 1,
      source_id: r.source_id,
      chunk_id: r.chunk_id,
      start: r.start_offset,
      end: r.end_offset,
      distance: r.distance,
    })) : [],
  };
}
