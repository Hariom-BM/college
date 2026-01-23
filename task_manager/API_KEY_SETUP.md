# API Key Setup Guide

## तीन तरीके से API Key Add करें:

### Method 1: UI में Add करें (Recommended) ✅
1. App खोलें
2. "AI-Powered Analysis" section में जाएं
3. "Enable AI analysis" checkbox enable करें
4. "OpenAI API Key" field में अपना key paste करें
5. Key automatically browser में save हो जाएगी

### Method 2: Code में Direct Add करें (Testing के लिए)
**File:** `ABTestGenerator.jsx`

Line 14-15 में:
```javascript
const DEFAULT_API_KEY = 'sk-your-api-key-here'; // यहाँ add करें
```

⚠️ **Warning:** Production में code में key नहीं रखनी चाहिए!

### Method 3: Environment Variable (Best Practice)
**File:** `.env` (create करें project root में)

```
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

फिर `ABTestGenerator.jsx` में:
```javascript
const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
```

## API Key कहाँ से मिलेगी?

1. https://platform.openai.com/api-keys पर जाएं
2. Login करें
3. "Create new secret key" click करें
4. Key copy करें (एक बार ही दिखेगी!)

## Security Notes:

- ✅ Key browser localStorage में save होती है (सिर्फ आपके browser में)
- ✅ Code में hardcode न करें (git में commit न हो)
- ✅ .env file को .gitignore में add करें
- ✅ Production में server-side API calls use करें

## Current Setup:

App currently uses **Method 1** (UI input) - सबसे safe और easy!
