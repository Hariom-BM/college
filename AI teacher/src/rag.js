import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from './config.js';
import { query } from './db.js';
import { embedQuery } from './embed.js';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);

<<<<<<< HEAD
// ------------------- RETRIEVE -------------------
export async function retrieve({ q, k = 8, scope = null }) {
  try {
    const qEmb = await embedQuery(q);

    const { rows } = await query(
      `SELECT chunk_id, source_id, text, start_offset, end_offset,
              (embedding <=> $1) AS distance
       FROM doc_chunks
       WHERE ($2::text IS NULL OR source_id = $2)
       ORDER BY embedding <=> $1
       LIMIT $3`,
      [qEmb, scope, k]
    );

    console.log(`Retrieved ${rows.length} rows from DB`);

    return rows.map(row => ({
      chunk_id: row.chunk_id,
      source_id: row.source_id,
      text: row.text,
      start_offset: row.start_offset,
      end_offset: row.end_offset,
      distance: row.distance
    }));
  } catch (error) {
    console.error('Database retrieval error:', error.message);
=======
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
>>>>>>> c1b8c95bd17e963c4abb27f0a859ddfe1c014f86
    return [];
  }
}

<<<<<<< HEAD
// ------------------- OPENAI COMPLETION -------------------
=======
// OpenAI chat completion
>>>>>>> c1b8c95bd17e963c4abb27f0a859ddfe1c014f86
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

<<<<<<< HEAD
// ------------------- GEMINI STREAMING COMPLETION -------------------
async function chatCompletionGeminiStream(system, user) {
  const model = genAI.getGenerativeModel({ model: CONFIG.GEMINI_CHAT_MODEL });
  const prompt = `${system}\n\n${user}`;

  const streamingResp = await model.generateContentStream(prompt);

  let finalText = '';
  for await (const chunk of streamingResp.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText); // 🔴 real-time stream print
    finalText += chunkText;          // ✅ collect for return
  }

  return finalText;
}

// ------------------- ANSWER FUNCTION -------------------
=======
// Gemini chat completion
async function chatCompletionGemini(system, user) {
  const model = genAI.getGenerativeModel({ model: CONFIG.GEMINI_CHAT_MODEL });
  
  const prompt = `${system}\n\n${user}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

>>>>>>> c1b8c95bd17e963c4abb27f0a859ddfe1c014f86
export async function answer({ q, scope = CONFIG.DEFAULT_SCOPE, k = 8 }) {
  const results = await retrieve({ q, k, scope });

  let context = '';
  if (results && results.length > 0) {
<<<<<<< HEAD
    context = results
      .map((r, i) => `# SOURCE ${i + 1} | ${r.source_id} [${r.start_offset}-${r.end_offset}]\n${r.text}`)
      .join('\n\n');
  } else {
    context = `# GENERAL KNOWLEDGE
This is a general question about ${q.toLowerCase().includes('ai') ? 'artificial intelligence' : 'various topics'}.
Please provide a helpful response based on your general knowledge.`;
  }

  // 🚨 Limit context size
  const MAX_CONTEXT_CHARS = 8000;
  if (context.length > MAX_CONTEXT_CHARS) {
    console.warn(`Context too large (${context.length}), truncating...`);
    context = context.slice(0, MAX_CONTEXT_CHARS) + "\n...[truncated]";
  }

  console.log(`Final context length: ${context.length}`);

=======
    context = results.map((r, i) => `# SOURCE ${i+1} | ${r.source_id} [${r.start_offset}-${r.end_offset}]\n${r.text}`).join('\n\n');
  } else {
    // Fallback context when no database results
    context = `# GENERAL KNOWLEDGE
This is a general question about ${q.toLowerCase().includes('ai') ? 'artificial intelligence' : 'various topics'}. 
Please provide a helpful response based on your general knowledge.`;
  }

>>>>>>> c1b8c95bd17e963c4abb27f0a859ddfe1c014f86
  const system = `You are an AI teaching assistant. Answer the question using the provided CONTEXT. If the answer is not in the context, provide a helpful general response. Keep answers concise and cite sources by SOURCE number when available.`;

  const user = `QUESTION:\n${q}\n\nCONTEXT:\n${context}`;

  let answer;
  if (CONFIG.AI_PROVIDER === 'openai') {
    answer = await chatCompletionOpenAI(system, user);
  } else if (CONFIG.AI_PROVIDER === 'gemini') {
<<<<<<< HEAD
    answer = await chatCompletionGeminiStream(system, user);
=======
    answer = await chatCompletionGemini(system, user);
>>>>>>> c1b8c95bd17e963c4abb27f0a859ddfe1c014f86
  } else {
    throw new Error(`Unsupported AI provider: ${CONFIG.AI_PROVIDER}`);
  }

  return {
    answer,
<<<<<<< HEAD
    sources: results
      ? results.map((r, i) => {
          const distance = parseFloat(r.distance) || 0;
          const confidence = Math.max(0, 1 - distance).toFixed(3);
          return {
            source: i + 1,
            source_id: r.source_id,
            chunk_id: r.chunk_id,
            text: r.text || '',
            start: r.start_offset,
            end: r.end_offset,
            distance: distance,
            confidence: confidence,
          };
        })
      : [],
=======
    sources: results ? results.map((r, i) => ({
      source: i + 1,
      source_id: r.source_id,
      chunk_id: r.chunk_id,
      start: r.start_offset,
      end: r.end_offset,
      distance: r.distance,
    })) : [],
>>>>>>> c1b8c95bd17e963c4abb27f0a859ddfe1c014f86
  };
}
