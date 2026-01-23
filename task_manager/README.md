# CRO A/B Test Generator

A tool to convert messy experiment requirements into clean, production-ready JavaScript A/B tests.

## Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Open Browser
The app will automatically open at `http://localhost:5173`

If it doesn't open automatically, manually navigate to:
- `http://localhost:5173`
- or `http://127.0.0.1:5173`

## Troubleshooting

### "This site can't be reached" Error

1. **Check if server is running:**
   - Look at terminal - you should see: `Local: http://localhost:5173/`
   - If not, run `npm run dev` again

2. **Check if port is in use:**
   - Close other apps using port 5173
   - Or change port in `vite.config.js`

3. **Verify dependencies:**
   - Make sure `node_modules` folder exists
   - If not, run `npm install`

4. **Try different URL:**
   - `http://127.0.0.1:5173`
   - `http://localhost:5173`

5. **Check firewall/antivirus:**
   - Temporarily disable to test

### Dependencies Not Installed

If you see import errors:
```bash
npm install
```

### Port Already in Use

Change port in `vite.config.js`:
```js
server: {
  port: 3000, // or any other port
}
```

## Usage

1. Enter test name (e.g., `fl-t-53`)
2. Describe your A/B test requirement
3. Click "Generate A/B Test Code"
4. Copy the generated code
5. Verify checkpoints
