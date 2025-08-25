# Frontend Chat Widgets

I've created two beautiful chat interfaces for your RAG AI Teacher:

## 🎨 **Option 1: Vanilla JavaScript Chat Widget**

### Features:
- ✅ Modern, responsive design
- ✅ Real-time typing indicators
- ✅ Source citations with confidence scores
- ✅ Error handling with user-friendly messages
- ✅ Mobile-friendly interface
- ✅ Smooth animations and transitions

### How to use:
1. **Start your RAG server**:
   ```bash
   npm run dev
   ```

2. **Open in browser**:
   ```
   http://localhost:3000
   ```

3. **That's it!** The chat interface will be available immediately.

### Files:
- `public/index.html` - Main HTML structure
- `public/styles.css` - Beautiful CSS styling
- `public/chat.js` - JavaScript functionality

---

## ⚛️ **Option 2: React Chat Widget**

### Features:
- ✅ All features from vanilla JS version
- ✅ React hooks for state management
- ✅ Better performance with virtual DOM
- ✅ Easier to extend and customize
- ✅ Modern React patterns

### How to use:
1. **Navigate to React directory**:
   ```bash
   cd react-chat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start React development server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   ```
   http://localhost:3001
   ```

### Files:
- `react-chat/src/App.js` - Main React component
- `react-chat/src/App.css` - React-specific styles
- `react-chat/package.json` - React dependencies

---

## 🎯 **Which One Should You Choose?**

### Choose **Vanilla JavaScript** if:
- You want something simple and lightweight
- No build process needed
- Quick to deploy
- Works immediately with your existing server

### Choose **React** if:
- You're familiar with React
- You want to extend the functionality
- You prefer component-based architecture
- You plan to add more features later

---

## 🚀 **Customization**

### Changing Colors:
Edit the CSS variables in either `public/styles.css` or `react-chat/src/App.css`:

```css
/* Main gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* User message gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adding Features:
- **File upload**: Add file input for document uploads
- **Voice input**: Integrate speech-to-text
- **Export chat**: Add download conversation feature
- **Themes**: Add dark/light mode toggle

---

## 📱 **Mobile Responsive**

Both widgets are fully responsive and work great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

---

## 🔧 **API Integration**

Both widgets connect to your RAG API at:
```
POST http://localhost:3000/ask
```

Request format:
```json
{
  "question": "Your question here",
  "k": 5
}
```

Response format:
```json
{
  "answer": "AI response here",
  "sources": [
    {
      "source": 1,
      "source_id": "document-name",
      "distance": 0.1234
    }
  ]
}
```

---

## 🎨 **Screenshots**

The chat widgets feature:
- Beautiful gradient backgrounds
- Rounded message bubbles
- Smooth animations
- Professional typography
- Source citations
- Error handling
- Loading indicators

Both are production-ready and can be easily customized to match your brand! 🎉
