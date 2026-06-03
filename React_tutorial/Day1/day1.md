# React Notes

## 1. Introduction

- React ko project me import karna seekha.
- React Element kya hota hai aur browser me render kaise hota hai samjha.

---

# 2. React Import Karna

React ek JavaScript library hai.

Project me React import karne ke liye CDN links use kiye:

```html
<script src="react.js"></script>
<script src="react-dom.js"></script>
```

### Do Libraries Import Hui:

- React
- ReactDOM

---

# 3. React vs ReactDOM

## React

- Elements aur components create karta hai.

## ReactDOM

- React ko browser DOM se connect karta hai.
- Elements ko webpage par render karta hai.

---

# 4. React Native

React sirf browser ke liye nahi hai.

Mobile apps ke liye:

- React Native use hota hai.

Yaha React same rehta hai, bas ReactDOM ki jagah React Native use hota hai.

---

# 5. React Developer Tools

Browser extension install kiya:

- Debugging easy hoti hai.
- React elements inspect kar sakte hain.

---

# 6. React.createElement()

React element create karne ke liye:

```jsx
React.createElement();
```

### Syntax

```jsx
React.createElement(type, props, children);
```

---

# 7. Parameters of createElement()

## (i) Type

Kaunsa HTML element banana hai.

Example:

```jsx
"h1";
"div";
"p";
```

---

## (ii) Props

Attributes pass karte hain.

Example:

```jsx
{
  className: "heading";
}
```

### Important

React me:

- `class` use nahi hota
- `className` use hota hai

Kyuki JavaScript DOM me bhi `className` property hoti hai.

---

## (iii) Children

Element ke andar ka content.

Example:

```jsx
"Hello World";
```

Children:

- text ho sakta hai
- ya another React element

---

# 8. React Element Kya Hota Hai?

React element:

- ek simple JavaScript object hota hai.

Usme mainly:

- type
- props
- children

store hote hain.

---

# 9. Root Element Banana

HTML me ek root div banana padta hai:

```html
<div id="root"></div>
```

---

# 10. Root Create Karna

```jsx
const root = ReactDOM.createRoot(document.querySelector("#root"));
```

---

# 11. Render Method

```jsx
root.render(h2);
```

Ye React element ko webpage par show karta hai.

---

# 12. document.createElement vs React.createElement

## document.createElement()

- Real DOM element banata hai.
- Heavy hota hai.

## React.createElement()

- Lightweight object banata hai.
- Fast hota hai.

---

# 13. Nested Elements

React me elements ke andar elements ho sakte hain.

Example:

```
div
 ├── h1
 ├── p
 └── button
```

---

# 14. Multiple Children

Ek parent ke andar multiple children ho sakte hain.

Example:

```jsx
React.createElement("div", {}, child1, child2);
```

---

# 15. Styling in React

Style object ke form me dete hain.

Example:

```jsx
style: {
  backgroundColor: 'red',
  borderRadius: '10px'
}
```

### Important

CSS properties camelCase me likhte hain.

```
background-color
backgroundColor
```

---

# 16. Image Add Karna

```jsx
React.createElement("img", {
  src: "image-url",
});
```

---

# 17. Form Create Karna

React.createElement() se:

- form
- input
- label
- password field

banaya.

---

# 18. htmlFor

React me:

```jsx
htmlFor;
```

use hota hai instead of:

```html
for
```

---

# 19. Problem with createElement()

- Code bahut lengthy ho jata hai.
- Read karna difficult ho jata hai.

---

# 20. JSX

JSX HTML jaisa syntax hai.

Example:

```jsx
<div>
  <h1>Hello</h1>
</div>
```

Browser directly JSX nahi samajhta.

---

# 21. Babel

Babel:

- JSX ko JavaScript me convert karta hai.
- JSX ko `React.createElement()` me convert karta hai.

---

# 22. Virtual DOM

React elements ek tree structure banate hain.

Example:

```
div
 ├── h1
 ├── p
 └── button
```

Is structure ko Virtual DOM kehte hain.

---

# 23. Why Virtual DOM?

Benefits:

- Fast updates
- Better performance
- Efficient rendering

---

# 24. Final Understanding

- React element ek JavaScript object hota hai.
- ReactDOM browser me render karta hai.
- `createElement()` React element banata hai.
- JSX writing ko easy banata hai.
- Babel JSX convert karta hai.
- Virtual DOM rendering optimize karta hai.
