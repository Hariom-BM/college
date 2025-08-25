import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from './config.js';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);

// OpenAI embedding functions
async function embedTextsOpenAI(texts) {
  if (!Array.isArray(texts)) throw new Error('embedTexts expects array');
  const res = await openai.embeddings.create({
    model: CONFIG.OPENAI_EMBED_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

async function embedQueryOpenAI(text) {
  const res = await openai.embeddings.create({ 
    model: CONFIG.OPENAI_EMBED_MODEL, 
    input: text 
  });
  return res.data[0].embedding;
}

// Gemini embedding functions
async function embedTextsGemini(texts) {
  if (!Array.isArray(texts)) throw new Error('embedTexts expects array');
  const model = genAI.getGenerativeModel({ model: CONFIG.GEMINI_EMBED_MODEL });
  
  const embeddings = [];
  for (const text of texts) {
    const result = await model.embedContent(text);
    const embedding = await result.embedding;
    embeddings.push(embedding.values);
  }
  return embeddings;
}

async function embedQueryGemini(text) {
  const model = genAI.getGenerativeModel({ model: CONFIG.GEMINI_EMBED_MODEL });
  const result = await model.embedContent(text);
  const embedding = await result.embedding;
  return embedding.values;
}

// Export provider-agnostic functions
export async function embedTexts(texts) {
  if (CONFIG.AI_PROVIDER === 'openai') {
    return await embedTextsOpenAI(texts);
  } else if (CONFIG.AI_PROVIDER === 'gemini') {
    return await embedTextsGemini(texts);
  } else {
    throw new Error(`Unsupported AI provider: ${CONFIG.AI_PROVIDER}`);
  }
}

export async function embedQuery(text) {
  if (CONFIG.AI_PROVIDER === 'openai') {
    return await embedQueryOpenAI(text);
  } else if (CONFIG.AI_PROVIDER === 'gemini') {
    return await embedQueryGemini(text);
  } else {
    throw new Error(`Unsupported AI provider: ${CONFIG.AI_PROVIDER}`);
  }
}
