// server.js - Main Express Server
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Prompts Configuration
const PROMPTS = {
  requirements: (data) => `You are a CRO requirement analyst.

Here is all project data:

TEST DESCRIPTION:
${data.testDescription}

VIDEO SUMMARY:
${data.videoSummary}

MOCKUP NOTES:
${data.mockupNotes}

PLATFORM: ${data.platform}

Task:
Extract FINAL requirements in a structured format.
Ask all clarification questions NOW.
Assume no future input will be provided.
Make reasonable assumptions and list them clearly.

Output format:
1. Core Requirements (bullet points)
2. Assumptions Made (bullet points)
3. Critical Questions (if any remain)`,

  logic: (requirements) => `You are a senior JS logic architect.

Using these requirements:
${requirements}

Create step-by-step implementation logic.
Include:
- Main workflow steps
- Edge cases to handle
- DOM manipulation strategy
- Event handling approach

NO CODE. Only logic and pseudocode.
Assume this is the final input.`,

  coder: (requirements, logic, template) => `You are a senior frontend JS engineer.

Rules:
- Write code ONLY inside the provided JS template structure
- Do not change the template structure
- Production-safe code only
- Add comments for complex logic
- Handle edge cases

REQUIREMENTS:
${requirements}

LOGIC:
${logic}

JS TEMPLATE:
${template}

Now write FINAL production-ready JS code.
Maintain the template structure exactly.
Assume this is the final input.`,

  qa: (code) => `Act as a QA engineer reviewing this code.

CODE:
${code}

Provide:
1. Potential Issues (bullet points)
2. Edge Cases to Test (checklist format)
3. Performance Considerations
4. Browser Compatibility Notes
5. Client Delivery Checklist

Be thorough but concise.
Assume this is the final review.`
};

// AI Service - Chain multiple prompts
async function chainPrompts(inputData) {
  const results = {
    requirements: '',
    logic: '',
    code: '',
    qa: ''
  };

  try {
    // Step 1: Requirements Analysis
    console.log('🔍 Analyzing requirements...');
    const reqResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert CRO analyst. Be thorough and assume no further clarification.' 
        },
        { 
          role: 'user', 
          content: PROMPTS.requirements(inputData) 
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    results.requirements = reqResponse.choices[0].message.content;

    // Step 2: Logic Design
    console.log('🧠 Designing logic...');
    const logicResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are a senior software architect. Create clear, implementable logic.' 
        },
        { 
          role: 'user', 
          content: PROMPTS.logic(results.requirements) 
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    results.logic = logicResponse.choices[0].message.content;

    // Step 3: Code Generation
    console.log('💻 Generating code...');
    const codeResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert JavaScript developer. Write production-ready code.' 
        },
        { 
          role: 'user', 
          content: PROMPTS.coder(results.requirements, results.logic, inputData.jsTemplate) 
        }
      ],
      temperature: 0.2,
      max_tokens: 4000
    });
    results.code = codeResponse.choices[0].message.content;

    // Step 4: QA Review
    console.log('🧪 Running QA review...');
    const qaResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are a thorough QA engineer. Identify all potential issues.' 
        },
        { 
          role: 'user', 
          content: PROMPTS.qa(results.code) 
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    results.qa = qaResponse.choices[0].message.content;

    console.log('✅ All steps completed successfully');
    return results;

  } catch (error) {
    console.error('❌ Error in prompt chain:', error);
    throw error;
  }
}

// Main Generation Endpoint - GET (documentation)
app.get('/api/generate', (req, res) => {
  res.json({
    error: 'Method Not Allowed',
    message: 'Use POST request instead',
    endpoint: 'POST /api/generate',
    requiredFields: {
      testDescription: 'string (required) - Description of the A/B test',
      jsTemplate: 'string (required) - JavaScript template to fill',
      videoSummary: 'string (optional) - Summary of video content',
      mockupNotes: 'string (optional) - Notes from mockups',
      platform: 'string (optional) - Platform type'
    },
    example: {
      method: 'POST',
      url: 'http://localhost:3001/api/generate',
      body: {
        testDescription: 'Add a CTA button to homepage',
        jsTemplate: 'function handleCTA() { /* code here */ }',
        videoSummary: 'Video shows user interaction',
        mockupNotes: 'Button should be green',
        platform: 'web'
      }
    }
  });
});

// Main Generation Endpoint - POST
app.post('/api/generate', async (req, res) => {
  try {
    const { testDescription, videoSummary, mockupNotes, platform, jsTemplate } = req.body;

    // Validation
    if (!testDescription || !jsTemplate) {
      return res.status(400).json({ 
        error: 'Missing required fields: testDescription and jsTemplate are mandatory' 
      });
    }

    console.log('🚀 Starting AI generation pipeline...');

    // Run the prompt chain
    const results = await chainPrompts({
      testDescription,
      videoSummary: videoSummary || 'Not provided',
      mockupNotes: mockupNotes || 'Not provided',
      platform: platform || 'Generic',
      jsTemplate
    });

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'TaskCoder AI Backend',
    version: '1.0.0',
    endpoints: {
      generate: 'POST /api/generate',
      health: 'GET /health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate`);
});

module.exports = app;