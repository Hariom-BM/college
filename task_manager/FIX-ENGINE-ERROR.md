# Fix "Unsupported Engine" Error

## Problem
You're getting "Unsupported engine" error because your Node.js version is incompatible with the packages.

## Solution Options

### Option 1: Update Node.js (Recommended)
1. Download latest Node.js LTS: https://nodejs.org/
2. Install it
3. Restart terminal/VS Code
4. Run: `npm install`

### Option 2: Use Compatible Versions (Already Updated)
I've updated `package.json` to use older, compatible versions:
- React 18 (instead of 19)
- Vite 4 (instead of 7)
- Compatible with Node.js 16+

**Steps:**
1. Delete `node_modules` folder (if exists)
2. Delete `package-lock.json` (if exists)
3. Run: `npm install`
4. Run: `npm run dev`

### Option 3: Check Your Node Version
Run in terminal:
```bash
node --version
npm --version
```

**Required:**
- Node.js: >= 16.0.0
- npm: >= 7.0.0

**If version is too old:**
- Update Node.js from https://nodejs.org/

## After Fix
Once dependencies install successfully:
```bash
npm run dev
```

Then open: `http://localhost:5173`
