# Source Map Notes (Point Wise)

## What is Source Map?

- Source Map debugging ke liye use hota hai.
- Ye original code ko compiled/transpiled code se map karta hai.
- Browser ko samajh aata hai ki actual code kis line se aaya hai.

---

## Why Source Maps are Important?

- Debugging easy ho jati hai.
- Error original file me dikhta hai.
- JSX ya modern JS ka actual source dekh sakte hain.
- Large projects me debugging manageable ho jati hai.

---

# Problem Without Source Maps

- Babel JSX ko normal JavaScript me convert karta hai.
- Browser transformed code run karta hai.
- DevTools me messy compiled code dikhta hai.
- Actual code locate karna difficult ho jata hai.

Example:

```jsx
<h1>Hello</h1>
```

Convert hota hai:

```js
React.createElement("h1", null, "Hello");
```

---

# Build Process Recap

- Hum `script.js` me JSX likhte hain.
- Babel usko compile karta hai.
- Output `lib/script.js` me generate hota hai.
- Browser sirf compiled file run karta hai.

---

# Install Node Modules

Agar project GitHub se download kiya ho:

```bash
npm install
```

Ya shortcut:

```bash
npm i
```

Ye `node_modules` install karta hai.

---

# Build Command

```bash
npm run build
```

Ye Babel ko run karta hai aur output file generate karta hai.

---

# Source Map Generate Karne Ka First Method

## package.json me

```json
"build": "babel script.js -o lib/script.js --source-maps"
```

---

# Output Files

Build ke baad:

```bash
lib/script.js
lib/script.js.map
```

---

# script.js.map Kya Hai?

- Ye source map file hoti hai.
- Isme:
  - Original code
  - Line mappings
  - File locations

sab store hota hai.

---

# Babel Automatically Add Karta Hai

Compiled JS file ke end me:

```js
//# sourceMappingURL=script.js.map
```

Ye browser ko batata hai source map kaha hai.

---

# Source Map Ka Benefit

DevTools me:

- Original JSX file dikhegi.
- Correct line numbers milenge.
- Debugging easy hogi.

---

# Important Point

Browser actual source file request nahi karta.

Browser:

1. Compiled JS load karta hai.
2. Source map file read karta hai.
3. DevTools me original file recreate karta hai.

---

# Network Tab Observation

Network tab me:

- `lib/script.js` request dikhegi.
- Source map request normally hidden hoti hai.

Agar `.map` file delete kar do:

```bash
DevTools failed to load source map
```

error aata hai.

---

# How Browser Uses Source Maps

Source map file me:

- Original source code
- Mapping info
- File path

store hota hai.

Browser DevTools:

- Mapping read karta hai
- Original file show karta hai

---

# Production Me Source Maps Kyu Avoid Karte Hain?

Production me source maps expose nahi karne chahiye because:

- Original code visible ho jata hai.
- Anyone app logic samajh sakta hai.
- Security & privacy issue ho sakta hai.

---

# Source Maps Disable Karna

DevTools Settings:

```text
Enable JavaScript Source Maps
```

Isko off kar sakte hain.

---

# Second Method to Generate Source Maps

## .babelrc File

```json
{
  "presets": ["@babel/preset-react"],
  "sourceMaps": true
}
```

Ye automatically source maps generate karega.

---

# Watch Mode

## package.json

```json
"build": "babel script.js -o lib/script.js --watch"
```

---

# Watch Mode Benefit

- File changes automatically detect hoti hain.
- Babel automatically rebuild karta hai.
- Manual build baar baar nahi karna padta.

---

# Example

Agar file me change:

```js
width: 200;
```

to:

```js
width: 300;
```

Babel automatically recompile karega.

---

# Main Learnings

- Source Maps debugging easy banate hain.
- Babel JSX ko JavaScript me convert karta hai.
- Browser compiled code run karta hai.
- Source map original code dikhata hai.
- Production me source maps carefully use karne chahiye.

---
