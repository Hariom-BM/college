import React, { useState, useEffect } from 'react';
import { Copy, Check, Code, FileText, AlertCircle, Edit2, CheckCircle, X, Loader2, Sparkles } from 'lucide-react';

const ABTestGenerator = () => {
  const [requirement, setRequirement] = useState('');
  const [testName, setTestName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [generatedCSS, setGeneratedCSS] = useState('');
  const [checkpoints, setCheckpoints] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('js'); // 'js', 'html', 'css'
  const [parsedRequirement, setParsedRequirement] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // API Key: Add your OpenAI API key here for default value
  // Or enter it in the UI - it will be saved in browser localStorage
  const DEFAULT_API_KEY = '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'; // Add your key here: 'sk-...'
  
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('openai_api_key') || DEFAULT_API_KEY
  );
  const [useAI, setUseAI] = useState(localStorage.getItem('use_ai') === 'true');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
    localStorage.setItem('use_ai', useAI.toString());
  }, [apiKey, useAI]);

  // AI-powered requirement analysis
  const parseRequirementWithAI = async (text) => {
    if (!apiKey || !useAI) {
      return null;
    }

    setIsAnalyzing(true);
    setAiError('');

    try {
      const prompt = `You are an expert CRO (Conversion Rate Optimization) analyst. Analyze this A/B test requirement and provide a structured breakdown.

Requirement:
${text}

Provide analysis in this EXACT format:

📋 REQUIREMENT ANALYSIS
==================================================

📹 Format: [Video Transcript / Hypothesis / Written Description]

🎯 TARGET ELEMENTS:
--------------------------------------------------
CSS Selectors: [list any CSS selectors mentioned]
Element Types: [button, div, input, etc.]
Classes: [class names if mentioned]
IDs: [ID names if mentioned]
[⚠️ warning if no selectors found]

⚙️ ACTIONS TO PERFORM:
--------------------------------------------------
✓ [List all actions: Change, Add, Remove, Show, Style, Text, Click, etc.]

🔧 SPECIFIC CHANGES:
--------------------------------------------------
Colors: [any colors mentioned]
Sizes: [any sizes mentioned]
Text Updates: [any text changes]
[Only include if applicable]

📄 CLEANED REQUIREMENT:
--------------------------------------------------
[Clean, concise version of the requirement without filler words, timestamps, or unnecessary details. Max 400 characters.]

💡 IMPLEMENTATION NOTES:
--------------------------------------------------
• [Note 1 about implementation]
• [Note 2 about implementation]
• Use waitForElement() for dynamic content
• Add test name as class prefix to all modified elements

Be precise, technical, and actionable. Focus on what needs to be implemented.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert CRO analyst and JavaScript developer. Provide clear, structured analysis of A/B test requirements.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices[0]?.message?.content || '';
      
      return analysis;
    } catch (error) {
      setAiError(error.message);
      console.error('AI Analysis Error:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Parse and understand the requirement - AI-like analysis (fallback)
  const parseRequirement = (text) => {
    if (!text.trim()) return '';
    
    let parsed = '';
    const originalText = text;
    
    // Clean text for analysis
    let cleaned = text
      .replace(/\d{1,2}:\d{2}/g, '')
      .replace(/\d+:\d+:\d+/g, '')
      .replace(/\b(um|uh|like|you know|so|okay|right|basically|actually)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Check format type
    const hasTranscriptPattern = /(\d{1,2}:\d{2}|\d+:\d+:\d+|timestamp|said|says|speaking|talking)/i.test(text);
    const hasHypothesisPattern = /(hypothesis|if\s+we|if\s+user|when\s+user|by\s+changing|we expect|assumption)/i.test(text);
    
    // Extract key information
    const selectors = cleaned.match(/(\.|#)?[\w-]+(?:\[[\w=]+\])?/g) || [];
    const cssSelectors = selectors.filter(s => s.startsWith('.') || s.startsWith('#'));
    const elementTypes = cleaned.match(/\b(button|div|span|input|link|image|img|header|footer|nav|section|form|label)\b/gi) || [];
    const classes = cleaned.match(/class(?:es)?\s+['"]?([\w\s-]+)['"]?/gi) || [];
    const ids = cleaned.match(/id\s+['"]?([\w-]+)['"]?/gi) || [];
    
    // Extract actions
    const actions = {
      change: /(change|modify|update|alter|switch)/gi.test(cleaned),
      add: /(add|insert|create|new|include)/gi.test(cleaned),
      remove: /(remove|delete|hide|eliminate)/gi.test(cleaned),
      show: /(show|display|reveal|visible)/gi.test(cleaned),
      style: /(color|size|font|width|height|padding|margin|background|border|style)/gi.test(cleaned),
      text: /(text|content|label|heading|title|copy)/gi.test(cleaned),
      click: /(click|tap|interact|button|link)/gi.test(cleaned)
    };
    
    // Extract specific values
    const colors = cleaned.match(/\b(red|blue|green|yellow|orange|purple|black|white|gray|grey|#[0-9a-f]{3,6})\b/gi) || [];
    const sizes = cleaned.match(/\b(\d+px|\d+%|small|large|big|smaller|larger)\b/gi) || [];
    const textChanges = cleaned.match(/(?:change|update|replace|set)\s+(?:text|content|label|heading)\s+(?:to|with|as)\s+['"]?([^'"]+)['"]?/gi) || [];
    
    // Build structured analysis
    parsed = `📋 REQUIREMENT ANALYSIS\n`;
    parsed += `${'='.repeat(50)}\n\n`;
    
    if (hasTranscriptPattern) {
      parsed += `📹 Format: Video Transcript\n`;
      parsed += `🔍 Detected spoken instructions converted to technical requirement\n\n`;
    } else if (hasHypothesisPattern) {
      parsed += `🧪 Format: Hypothesis/Experiment\n`;
      parsed += `🔍 Detected hypothesis format with expected outcomes\n\n`;
    } else {
      parsed += `📝 Format: Written Description\n`;
      parsed += `🔍 Standard requirement description\n\n`;
    }
    
    // Target Elements
    parsed += `🎯 TARGET ELEMENTS:\n`;
    parsed += `${'-'.repeat(50)}\n`;
    if (cssSelectors.length > 0) {
      parsed += `CSS Selectors: ${[...new Set(cssSelectors)].slice(0, 5).join(', ')}\n`;
    }
    if (elementTypes.length > 0) {
      parsed += `Element Types: ${[...new Set(elementTypes)].map(e => e.toLowerCase()).slice(0, 5).join(', ')}\n`;
    }
    if (classes.length > 0) {
      const classNames = classes.map(c => c.match(/['"]?([\w\s-]+)['"]?/i)?.[1]).filter(Boolean);
      parsed += `Classes: ${[...new Set(classNames)].slice(0, 3).join(', ')}\n`;
    }
    if (ids.length > 0) {
      const idNames = ids.map(i => i.match(/['"]?([\w-]+)['"]?/i)?.[1]).filter(Boolean);
      parsed += `IDs: ${[...new Set(idNames)].slice(0, 3).join(', ')}\n`;
    }
    if (cssSelectors.length === 0 && elementTypes.length === 0) {
      parsed += `⚠️ No specific selectors found - will need manual targeting\n`;
    }
    parsed += `\n`;
    
    // Actions to Perform
    parsed += `⚙️ ACTIONS TO PERFORM:\n`;
    parsed += `${'-'.repeat(50)}\n`;
    const activeActions = Object.entries(actions)
      .filter(([_, value]) => value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
    
    if (activeActions.length > 0) {
      activeActions.forEach(action => {
        parsed += `✓ ${action}\n`;
      });
    } else {
      parsed += `⚠️ General modification (details needed)\n`;
    }
    parsed += `\n`;
    
    // Specific Changes
    if (colors.length > 0 || sizes.length > 0 || textChanges.length > 0) {
      parsed += `🔧 SPECIFIC CHANGES:\n`;
      parsed += `${'-'.repeat(50)}\n`;
      if (colors.length > 0) {
        parsed += `Colors: ${[...new Set(colors)].slice(0, 3).join(', ')}\n`;
      }
      if (sizes.length > 0) {
        parsed += `Sizes: ${[...new Set(sizes)].slice(0, 3).join(', ')}\n`;
      }
      if (textChanges.length > 0) {
        parsed += `Text Updates: ${textChanges.slice(0, 2).join(' | ')}\n`;
      }
      parsed += `\n`;
    }
    
    // Clean Requirement Summary
    parsed += `📄 CLEANED REQUIREMENT:\n`;
    parsed += `${'-'.repeat(50)}\n`;
    const summary = cleaned.length > 400 ? cleaned.substring(0, 400) + '...' : cleaned;
    parsed += `${summary}\n\n`;
    
    // Implementation Notes
    parsed += `💡 IMPLEMENTATION NOTES:\n`;
    parsed += `${'-'.repeat(50)}\n`;
    if (cssSelectors.length === 0) {
      parsed += `• Need to identify target element selector\n`;
    }
    if (actions.style) {
      parsed += `• CSS modifications required\n`;
    }
    if (actions.text) {
      parsed += `• Text content changes needed\n`;
    }
    if (actions.add || actions.remove) {
      parsed += `• DOM structure changes required\n`;
    }
    parsed += `• Use waitForElement() for dynamic content\n`;
    parsed += `• Add test name as class prefix to all modified elements\n`;
    
    return parsed;
  };

  // Handle requirement paste/change
  const handleRequirementChange = async (value) => {
    setRequirement(value);
    
    // If user pastes something substantial, show confirmation
    if (value.trim().length > 50 && !showConfirmation) {
      let parsed = '';
      
      // Try AI first if enabled
      if (useAI && apiKey) {
        const aiResult = await parseRequirementWithAI(value);
        if (aiResult) {
          parsed = aiResult;
        } else {
          // Fallback to regex parsing
          parsed = parseRequirement(value);
        }
      } else {
        // Use regex parsing
        parsed = parseRequirement(value);
      }
      
      setParsedRequirement(parsed);
      setShowConfirmation(true);
      setIsEditing(false);
    }
  };

  // Confirm the parsed requirement
  const confirmRequirement = () => {
    setShowConfirmation(false);
    setIsEditing(false);
    // Use the edited parsed requirement if user edited it
    if (isEditing && parsedRequirement) {
      // Extract the actual requirement from parsed text
      const lines = parsedRequirement.split('\n');
      const actualReq = lines.find(line => line.includes('Parsed Requirement:') || line.trim().length > 20);
      if (actualReq) {
        setRequirement(actualReq.replace('Parsed Requirement:', '').trim());
      }
    }
  };

  // Edit the parsed requirement
  const startEditing = () => {
    setIsEditing(true);
  };

  // Cancel confirmation
  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setIsEditing(false);
    setParsedRequirement('');
  };

  // Generate HTML with best practices
  const generateHTML = (testName, req) => {
    const validTestName = testName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Extract elements from requirement
    const hasButton = /button|btn|click|cta/i.test(req);
    const hasForm = /form|input|submit/i.test(req);
    const hasHeader = /header|nav|navigation/i.test(req);
    const hasImage = /image|img|picture|photo/i.test(req);
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A/B Test Variation: ${testName}">
  <title>A/B Test: ${testName}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="${validTestName}">
  <!-- A/B Test Variation: ${validTestName} -->
  
  ${hasHeader ? `<header class="${validTestName}-header" role="banner">
    <nav class="${validTestName}-nav" role="navigation" aria-label="Main navigation">
      <ul class="${validTestName}-nav-list">
        <li><a href="#" class="${validTestName}-nav-link">Home</a></li>
        <li><a href="#" class="${validTestName}-nav-link">About</a></li>
        <li><a href="#" class="${validTestName}-nav-link">Contact</a></li>
      </ul>
    </nav>
  </header>` : ''}
  
  <main class="${validTestName}-main" role="main">
    <section class="${validTestName}-section">
      <h1 class="${validTestName}-heading">A/B Test Content</h1>
      
      ${hasImage ? `<figure class="${validTestName}-figure">
        <img src="#" alt="A/B test image" class="${validTestName}-image" loading="lazy">
      </figure>` : ''}
      
      <p class="${validTestName}-text">This is the variation content for test: ${testName}</p>
      
      ${hasButton ? `<div class="${validTestName}-actions">
        <button type="button" class="${validTestName}-button ${validTestName}-button--primary" aria-label="Primary action">
          Click Me
        </button>
      </div>` : ''}
      
      ${hasForm ? `<form class="${validTestName}-form" method="post" aria-label="Test form">
        <label for="${validTestName}-input" class="${validTestName}-label">Input Field</label>
        <input type="text" id="${validTestName}-input" name="input" class="${validTestName}-input" required>
        <button type="submit" class="${validTestName}-button ${validTestName}-button--submit">Submit</button>
      </form>` : ''}
    </section>
  </main>
  
  <footer class="${validTestName}-footer" role="contentinfo">
    <p class="${validTestName}-footer-text">&copy; 2024 A/B Test</p>
  </footer>
</body>
</html>`;
    
    return html;
  };

  // Generate CSS with best practices - HTML/body first, then classes
  const generateCSS = (testName, req) => {
    const validTestName = testName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if UI/mockup details are provided
    const hasColors = /(red|blue|green|yellow|orange|purple|black|white|gray|grey|#[0-9a-f]{3,6}|rgb\([^)]+\))/i.test(req);
    const hasSizes = /(\d+px|\d+rem|\d+em|\d+%|small|medium|large|width|height|padding|margin|font-size)/i.test(req);
    const hasLayout = /(flex|grid|display|position|align|justify|layout|design|mockup|ui|figma)/i.test(req);
    const hasUI = hasColors || hasSizes || hasLayout;
    
    // If no UI details, just return class format structure
    if (!hasUI) {
      return `/* A/B Test: ${testName} */
/* CSS Class Format Structure */
/* Add styles when UI/mockup details are available */

/* ========================================
   TEST VARIATION CLASSES
   ======================================== */

/* Body class for test variation */
html body.${validTestName} {
  /* Add test-specific body styles here */
}

/* Main container */
html body.${validTestName} .${validTestName}-main {
  /* Add main container styles here */
}

/* Section */
html body.${validTestName} .${validTestName}-section {
  /* Add section styles here */
}

/* Typography */
html body.${validTestName} .${validTestName}-heading {
  /* Add heading styles here */
}

html body.${validTestName} .${validTestName}-text {
  /* Add text styles here */
}

/* Buttons */
html body.${validTestName} .${validTestName}-button {
  /* Add button styles here */
}

html body.${validTestName} .${validTestName}-button:hover {
  /* Add button hover styles here */
}

html body.${validTestName} .${validTestName}-button:focus {
  /* Add button focus styles here */
}

/* Forms */
html body.${validTestName} .${validTestName}-form {
  /* Add form styles here */
}

html body.${validTestName} .${validTestName}-input {
  /* Add input styles here */
}

html body.${validTestName} .${validTestName}-label {
  /* Add label styles here */
}

/* Navigation */
html body.${validTestName} .${validTestName}-nav-link {
  /* Add nav link styles here */
}

/* Images */
html body.${validTestName} .${validTestName}-image {
  /* Add image styles here */
}

/* Footer */
html body.${validTestName} .${validTestName}-footer {
  /* Add footer styles here */
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */
@media (max-width: 768px) {
  html body.${validTestName} .${validTestName}-main {
    /* Add mobile styles here */
  }
}`;
    }
    
    // UI details found - generate full CSS with dynamic properties
    const colors = req.match(/\b(red|blue|green|yellow|orange|purple|black|white|gray|grey|#[0-9a-f]{3,6}|rgb\([^)]+\))\b/gi) || [];
    const primaryColor = colors[0] || '#2563eb';
    const secondaryColor = colors[1] || '#1d4ed8';
    const textColor = colors[2] || '#1f2937';
    const bgColor = colors.find(c => /background|bg/i.test(req.substring(Math.max(0, req.indexOf(c) - 20), req.indexOf(c) + 20))) || '#ffffff';
    
    // Extract sizes
    const sizes = req.match(/\b(\d+px|\d+rem|\d+em|\d+%|\d+vh|\d+vw|small|medium|large)\b/gi) || [];
    const fontSize = sizes.find(s => /font|text|size/i.test(req.substring(Math.max(0, req.indexOf(s) - 20), req.indexOf(s) + 20))) || '1rem';
    const padding = sizes.find(s => /padding|pad/i.test(req.substring(Math.max(0, req.indexOf(s) - 20), req.indexOf(s) + 20))) || '2rem';
    const margin = sizes.find(s => /margin|gap|space/i.test(req.substring(Math.max(0, req.indexOf(s) - 20), req.indexOf(s) + 20))) || '1rem';
    const borderRadius = sizes.find(s => /radius|rounded|round/i.test(req.substring(Math.max(0, req.indexOf(s) - 20), req.indexOf(s) + 20))) || '0.5rem';
    
    // Extract font weights
    const fontWeight = /bold|700|600|500/i.test(req) 
      ? (req.match(/\b(bold|700|600|500)\b/i)?.[0] || '600')
      : '400';
    
    // Extract layout properties
    const display = /flex|grid|block|inline/i.test(req)
      ? (req.match(/\b(flex|grid|block|inline)\b/i)?.[0] || 'block')
      : 'block';
    
    const alignItems = /center|start|end|stretch/i.test(req)
      ? (req.match(/\b(center|start|end|stretch)\b/i)?.[0] || 'center')
      : 'center';
    
    const justifyContent = /center|between|around|start|end/i.test(req)
      ? (req.match(/\b(center|between|around|start|end)\b/i)?.[0] || 'center')
      : 'center';
    
    // Extract spacing
    const gap = sizes.find(s => /gap|spacing/i.test(req.substring(Math.max(0, req.indexOf(s) - 20), req.indexOf(s) + 20))) || '1rem';
    
    // Extract border
    const hasBorder = /border|outline/i.test(req);
    const borderWidth = hasBorder ? (req.match(/\b(\d+px)\b/)?.[0] || '1px') : '0';
    const borderColor = hasBorder ? (colors[0] || '#e5e7eb') : 'transparent';
    
    // Extract shadow
    const hasShadow = /shadow|elevation|depth/i.test(req);
    const boxShadow = hasShadow ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none';
    
    // Extract width/height
    const width = sizes.find(s => /width|w-/i.test(req.substring(Math.max(0, req.indexOf(s) - 20), req.indexOf(s) + 20))) || '100%';
    const maxWidth = sizes.find(s => /max-width|maxw/i.test(req.substring(Math.max(0, req.indexOf(s) - 20), req.indexOf(s) + 20))) || '1200px';
    
    const hasButton = /button|btn|click|cta/i.test(req);
    const hasForm = /form|input|submit/i.test(req);
    const hasHeader = /header|nav|navigation/i.test(req);
    const hasImage = /image|img|picture|photo/i.test(req);
    
    let css = `/* A/B Test: ${testName} */
/* CSS follows best practices: HTML/body first, then classes */
/* No repetition - organized structure */

/* ========================================
   RESET & BASE STYLES
   ======================================== */
html {
  box-sizing: border-box;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background-color: #ffffff;
}

/* ========================================
   TEST VARIATION CLASSES
   ======================================== */

/* Body class for test variation */
html body.${validTestName} {
  /* Test-specific body styles */
}

/* Main container */
html body.${validTestName} .${validTestName}-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Section */
html body.${validTestName} .${validTestName}-section {
  margin-bottom: 2rem;
}

/* Typography */
html body.${validTestName} .${validTestName}-heading {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #1f2937;
}

html body.${validTestName} .${validTestName}-text {
  font-size: 1rem;
  margin: 0 0 1rem 0;
  color: #4b5563;
}

/* Header & Navigation */
html body.${validTestName} .${validTestName}-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

html body.${validTestName} .${validTestName}-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 2rem;
}

html body.${validTestName} .${validTestName}-nav-link {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: color 0.2s ease;
}

html body.${validTestName} .${validTestName}-nav-link:hover,
html body.${validTestName} .${validTestName}-nav-link:focus {
  color: ${primaryColor};
  outline: 2px solid ${primaryColor};
  outline-offset: 2px;
}

/* Images */
html body.${validTestName} .${validTestName}-figure {
  margin: 0 0 1rem 0;
}

html body.${validTestName} .${validTestName}-image {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Buttons */
html body.${validTestName} .${validTestName}-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${primaryColor};
  color: #ffffff;
}

html body.${validTestName} .${validTestName}-button:hover {
  background-color: ${secondaryColor};
  transform: translateY(-1px);
}

html body.${validTestName} .${validTestName}-button:focus {
  outline: 2px solid ${primaryColor};
  outline-offset: 2px;
}

html body.${validTestName} .${validTestName}-button--primary {
  background-color: ${primaryColor};
}

html body.${validTestName} .${validTestName}-button--submit {
  background-color: ${secondaryColor};
  margin-top: 1rem;
}

/* Forms */
html body.${validTestName} .${validTestName}-form {
  max-width: 500px;
  margin: 2rem 0;
}

html body.${validTestName} .${validTestName}-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

html body.${validTestName} .${validTestName}-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: border-color 0.2s ease;
}

html body.${validTestName} .${validTestName}-input:focus {
  outline: none;
  border-color: ${primaryColor};
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Actions container */
html body.${validTestName} .${validTestName}-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Footer */
html body.${validTestName} .${validTestName}-footer {
  background-color: #f9fafb;
  padding: 2rem 1rem;
  margin-top: 3rem;
  text-align: center;
}

html body.${validTestName} .${validTestName}-footer-text {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */
@media (max-width: 768px) {
  html body.${validTestName} .${validTestName}-heading {
    font-size: 1.5rem;
  }
  
  html body.${validTestName} .${validTestName}-nav-list {
    flex-direction: column;
    gap: 1rem;
  }
  
  html body.${validTestName} .${validTestName}-main {
    padding: 1rem;
  }
}

/* ========================================
   ACCESSIBILITY
   ======================================== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible for keyboard navigation */
html body.${validTestName} .${validTestName}-button:focus-visible,
html body.${validTestName} .${validTestName}-nav-link:focus-visible,
html body.${validTestName} .${validTestName}-input:focus-visible {
  outline: 2px solid ${primaryColor};
  outline-offset: 2px;
}`;
    
    return css;
  };

  const generateTestCode = () => {
    if (!requirement.trim() || !testName.trim()) {
      alert('Please provide both requirement and test name');
      return;
    }
    
    // Hide confirmation if still showing
    setShowConfirmation(false);

    // Validate test name format
    const validTestName = testName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Generate JavaScript
    const code = `(function() {
  'use strict';
  
  const variation_name = '${validTestName}';
  
  // Prevent duplicate execution
  if (document.body.classList.contains(variation_name)) {
    return;
  }
  
  try {
    function waitForElement(selector, callback, maxAttempts = 50) {
      let attempts = 0;
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          callback(element);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    }
    
    function initTest() {
      // Add body class
      document.body.classList.add(variation_name);
      
      // TODO: Add your test logic here based on requirement:
      // ${requirement.substring(0, 100)}...
      
      // Example: Wait for element and modify
      // waitForElement('.target-element', (el) => {
      //   el.classList.add(variation_name + '-modified');
      // });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTest);
    } else {
      initTest();
    }
    
  } catch (error) {
    console.error('A/B Test Error:', error);
  }
})();`;

    setGeneratedCode(code);
    
    // Generate HTML and CSS
    const html = generateHTML(testName, requirement);
    const css = generateCSS(testName, requirement);
    
    setGeneratedHTML(html);
    setGeneratedCSS(css);

    // Generate checkpoints
    const generatedCheckpoints = [
      `Body class "${validTestName}" is added to document.body`,
      `Test does not execute multiple times (duplicate prevention check)`,
      `Target elements are found and modified correctly`,
      `Test works on page reload`,
      `Test works on navigation (if SPA)`,
      `No console errors in production`,
      `User interactions behave as expected`,
      `Edge cases handled (missing elements, slow loading)`
    ];
    setCheckpoints(generatedCheckpoints);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentCode = () => {
    if (activeTab === 'html') return generatedHTML;
    if (activeTab === 'css') return generatedCSS;
    return generatedCode;
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            CRO A/B Test Generator
          </h1>
          <p className="text-gray-600 text-sm">
            Convert messy experiment requirements into clean, production-ready JavaScript A/B tests
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* AI Settings */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-purple-600" />
              <h3 className="font-semibold text-gray-800">AI-Powered Analysis</h3>
            </div>
            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Enable AI analysis (better results)</span>
              </label>
            </div>
            {useAI && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  OpenAI API Key (stored locally)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI</a>. Key is saved in browser only.
                </p>
                {aiError && (
                  <p className="text-xs text-red-600 mt-2">⚠️ {aiError}</p>
                )}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Test Name (e.g., fl-t-53)
            </label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="fl-t-53"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Short, lowercase, hyphenated. Used as body class and HTML prefix.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Requirement / Description
            </label>
            <textarea
              value={requirement}
              onChange={(e) => handleRequirementChange(e.target.value)}
              onPaste={(e) => {
                // Small delay to let paste complete
                setTimeout(() => {
                  const pastedText = e.target.value;
                  if (pastedText.trim().length > 50) {
                    handleRequirementChange(pastedText);
                  }
                }, 100);
              }}
              placeholder="Paste video transcript, hypothesis, or describe your A/B test requirement..."
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste video transcript or hypothesis format. App will analyze and confirm understanding.
            </p>
          </div>

          {/* Confirmation/Edit Section */}
          {showConfirmation && (
            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={20} className="text-blue-600 animate-spin" />
                      <h3 className="font-semibold text-blue-800">AI Analyzing...</h3>
                    </>
                  ) : useAI && apiKey ? (
                    <>
                      <Sparkles size={20} className="text-purple-600" />
                      <h3 className="font-semibold text-blue-800">AI Analysis - Confirm Understanding</h3>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} className="text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Confirm Understanding</h3>
                    </>
                  )}
                </div>
                <button
                  onClick={cancelConfirmation}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
              
              {isEditing ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Edit Parsed Requirement:
                  </label>
                  <textarea
                    value={parsedRequirement}
                    onChange={(e) => setParsedRequirement(e.target.value)}
                    rows="12"
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-mono text-sm"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={confirmRequirement}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      <CheckCircle size={16} />
                      Confirm & Continue
                    </button>
                    <button
                      onClick={cancelConfirmation}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200 mb-3 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                      {parsedRequirement}
                    </pre>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={confirmRequirement}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      <CheckCircle size={16} />
                      ✓ Correct - Generate Code
                    </button>
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-semibold"
                    >
                      <Edit2 size={16} />
                      Edit Understanding
                    </button>
                    <button
                      onClick={cancelConfirmation}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={generateTestCode}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Code size={20} />
            Generate A/B Test Code
          </button>
        </div>

        {(generatedCode || generatedHTML || generatedCSS) && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={20} />
                  Generated Code
                </h2>
                <button
                  onClick={() => copyToClipboard(getCurrentCode())}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-semibold"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('js')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    activeTab === 'js'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  JavaScript
                </button>
                <button
                  onClick={() => setActiveTab('html')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    activeTab === 'html'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setActiveTab('css')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    activeTab === 'css'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  CSS
                </button>
              </div>
              
              {/* Code Display */}
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm border border-gray-200 max-h-96 overflow-y-auto">
                <code>{getCurrentCode()}</code>
              </pre>
              
              {/* Code Info */}
              <div className="mt-3 text-xs text-gray-500">
                {activeTab === 'js' && '✓ IIFE pattern, try/catch, waitForElement included'}
                {activeTab === 'html' && '✓ Semantic HTML, SEO-friendly, ARIA labels included'}
                {activeTab === 'css' && '✓ HTML/body first, organized classes, responsive, accessible'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Functionality Checkpoints
              </h2>
              <ul className="space-y-2">
                {checkpoints.map((checkpoint, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      id={`checkpoint-${index}`}
                    />
                    <label
                      htmlFor={`checkpoint-${index}`}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {checkpoint}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ABTestGenerator;
