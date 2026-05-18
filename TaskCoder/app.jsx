import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Copy, Download } from 'lucide-react';

export default function AIDeliveryTool() {
  const [formData, setFormData] = useState({
    testDescription: '',
    videoSummary: '',
    mockupNotes: '',
    platform: 'VWO',
    jsTemplate: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requirements');
  const [copied, setCopied] = useState(false);

  const API_URL = 'http://localhost:3001';

  const handleGenerate = async () => {
    if (!formData.testDescription || !formData.jsTemplate) {
      setError('Test Description and JS Template are required');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setResults(data.data);
      setActiveTab('requirements');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResults = () => {
    const content = `# AI DELIVERY TOOL OUTPUT
Generated: ${new Date().toLocaleString()}

## REQUIREMENTS
${results.requirements}

## LOGIC
${results.logic}

## FINAL CODE
${results.code}

## QA NOTES
${results.qa}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'requirements', label: '✅ Requirements', emoji: '📋' },
    { id: 'logic', label: '🧠 Logic', emoji: '🔧' },
    { id: 'code', label: '💻 Final Code', emoji: '🚀' },
    { id: 'qa', label: '🧪 QA Notes', emoji: '✓' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 AI Delivery Tool
          </h1>
          <p className="text-slate-300">
            Transform requirements → Production-ready code in minutes
          </p>
        </div>

        {!results ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Test Description *
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                  placeholder="Describe the test objective, hypothesis, and expected outcome..."
                  value={formData.testDescription}
                  onChange={(e) => setFormData({ ...formData, testDescription: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Video Summary
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="• Key point 1&#10;• Key point 2&#10;• Key point 3"
                  value={formData.videoSummary}
                  onChange={(e) => setFormData({ ...formData, videoSummary: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Figma/Mockup Notes
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="Design specifications, colors, dimensions, interactions..."
                  value={formData.mockupNotes}
                  onChange={(e) => setFormData({ ...formData, mockupNotes: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Platform
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="VWO">VWO</option>
                  <option value="Optimizely">Optimizely</option>
                  <option value="Google Optimize">Google Optimize</option>
                  <option value="Convert">Convert</option>
                  <option value="AB Tasty">AB Tasty</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  JS Template *
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                  rows={6}
                  placeholder="(function() {\n  // Your template structure\n  var init = function() {\n    // Code will be inserted here\n  };\n  \n  init();\n})();"
                  value={formData.jsTemplate}
                  onChange={(e) => setFormData({ ...formData, jsTemplate: e.target.value })}
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="text-red-400" size={20} />
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !formData.testDescription || !formData.jsTemplate}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating... (This may take 2-3 minutes)
                  </>
                ) : (
                  <>
                    🚀 Generate Complete Delivery Package
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setResults(null)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                ← New Generation
              </button>
              <button
                onClick={downloadResults}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
              >
                <Download size={18} />
                Download All
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
              <div className="flex border-b border-white/10 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-semibold transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {tabs.find(t => t.id === activeTab)?.emoji} {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  <button
                    onClick={() => copyToClipboard(results[activeTab])}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-6 border border-white/5">
                  <pre className="text-slate-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {results[activeTab]}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}