import 'dotenv/config';

export const CONFIG = {
  AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
  
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_EMBED_MODEL: process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
  OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
  
  // Gemini Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_CHAT_MODEL: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash',
  GEMINI_EMBED_MODEL: process.env.GEMINI_EMBED_MODEL || 'embedding-001',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: Number(process.env.PORT || 3000),
  DEFAULT_SCOPE: process.env.DEFAULT_SCOPE || null,
};

// Validate configuration based on provider
if (CONFIG.AI_PROVIDER === 'openai') {
  if (!CONFIG.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
} else if (CONFIG.AI_PROVIDER === 'gemini') {
  if (!CONFIG.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');
} else {
  throw new Error('AI_PROVIDER must be either "openai" or "gemini"');
}

if (!CONFIG.DATABASE_URL) throw new Error('Missing DATABASE_URL');
