# JSX + Babel Notes (Point Wise)

## 1. What is JSX?

- JSX ka full form hai **JavaScript XML**
- JSX me hum HTML jaisa syntax JavaScript ke andar likhte hain
- JSX code readable aur easy hota hai
- React apps me mostly JSX use hota hai

Example:

```jsx
const h2 = <h2>Hello JSX</h2>;
```

---

## 2. JSX ka fayda

- Code short ho jata hai
- Readability improve hoti hai
- HTML jaisa feel aata hai
- Nested UI easily bana sakte hain

---

## 3. Problem Without Babel

JavaScript directly JSX ko samajh nahi pata.

Example:

```jsx
const h2 = <h2>Hello JSX</h2>;
```

Error aata hai because:

- Browser ko `<h2>` samajh nahi aata JavaScript ke andar

---

## 4. What is Babel?

- Babel ek **JavaScript Compiler** hai
- Babel:
  - JSX ko normal JavaScript me convert karta hai
  - New JavaScript ko old browser-compatible JS me convert karta hai

---

## 5. Babel JSX ko kis me convert karta hai?

JSX convert hota hai:

```js
React.createElement();
```

Example:

```jsx
<h2>Hello JSX</h2>
```

Convert hota hai:

```js
React.createElement("h2", null, "Hello JSX");
```

---

## 6. React Element kya hota hai?

- React element ek simple JavaScript object hota hai
- React us object ko DOM me render karta hai

Example:

```js
root.render(container);
```

---

## 7. Babel CDN ka use

HTML me Babel CDN add karte hain:

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

---

## 8. Important: `type="text/babel"`

Agar JSX likhna hai to script tag me:

```html
<script type="text/babel">
```

Use karna padega.

Without this:

- Browser JSX ko normal JS samjhega
- Error aayega

---

## 9. Script Type ka concept

Default:

```html
type="text/javascript"
```

Agar:

```html
type="text/babel"
```

to browser script run nahi karta.
Babel us script ko handle karta hai.

---

## 10. Babel internally kya karta hai?

Steps:

1. Script file request karta hai
2. JSX read karta hai
3. JSX ko transform karta hai
4. `React.createElement()` banata hai
5. Browser ko normal JS deta hai

---

## 11. Source Map kya hota hai?

- Debugging easy banata hai
- Browser transformed code ko original file se map karta hai
- Console me original line number show hota hai

---

## 12. JSX me JavaScript kaise likhte hain?

Curly braces `{}` use karte hain.

Example:

```jsx
const user = "Anurag"

<h2>Hello {user}</h2>
```

Output:

```html
Hello Anurag
```

---

## 13. JSX me JavaScript Expressions

Hum logic bhi likh sakte hain:

```jsx
<h2>{5 + 8}</h2>
```

Output:

```html
13
```

---

## 14. JSX me Multiple Children

Example:

```jsx
<h2>
  Hello <b>Hi</b>
</h2>
```

Babel internally multiple children create karta hai.

---

## 15. React kuch values show nahi karta

React page par directly show nahi karta:

- `undefined`
- `null`
- `true`
- `false`

Example:

```jsx
<h2>{false}</h2>
```

Kuch render nahi hoga.

---

## 16. Value ko show karna ho to

String me convert karo:

```jsx
<h2>{false.toString()}</h2>
```

---

## 17. JSX me Style kaise likhte hain?

Style object form me likhte hain.

Example:

```jsx
style={{ color: "red" }}
```

Double curly braces ka reason:

- Outer `{}` → JavaScript start
- Inner `{}` → Object

---

## 18. JSX Rules

### `class` nahi use hota

Use:

```jsx
className;
```

### `for` nahi use hota

Use:

```jsx
htmlFor;
```

---

## 19. Babel CLI Setup (Production Way)

### Step 1:

```bash
npm init -y
```

### Step 2:

```bash
npm install -D @babel/core @babel/cli
```

---

## 20. JSX Enable Karna

Install:

```bash
npm install -D @babel/preset-react
```

---

## 21. `.babelrc` File

Create:

```json
{
  "presets": ["@babel/preset-react"]
}
```

---

## 22. Build Command

Example:
"scripts": {
"build": "babel script.js -o output/script.js"
}

```json
"build": "babel script.js -o output/script.js"
```

Run:

```bash
npm run build
```

---

## 23. Babel Output

Babel:

- JSX ko pure JavaScript me convert karta hai
- Output file generate karta hai

---

## 24. Production Me CDN Use Nahi Karna

CDN:

- Learning ke liye thik hai
- Production ke liye recommended nahi

Best:

- Babel CLI
- Bundlers
- Build tools

---

## 25. Final Understanding

- JSX browser directly nahi samajhta
- Babel JSX ko convert karta hai
- React.createElement generate hota hai
- React usko DOM me render karta hai
- JSX code readable aur developer friendly hota hai
