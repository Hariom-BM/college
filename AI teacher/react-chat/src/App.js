import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI teaching assistant. I can help you understand your course materials. What would you like to know?",
      sources: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isTyping) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      sources: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
          k: 5
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.answer,
        sources: data.sources || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `❌ Error: ${error.message}`,
        sources: [],
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h2>🤖 AI Teacher</h2>
          <p>Ask me anything about your course materials!</p>
        </div>
        
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}-message`}>
              <div className={`message-content ${message.isError ? 'error' : ''}`}>
                <p>{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="sources">
                    <div className="sources-title">📚 Sources:</div>
                    {message.sources.map((source, index) => (
                      <div key={index} className="source-item">
                        Source {source.source}: {source.source_id} (confidence: {(1 - source.distance).toFixed(2)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-container">
          <div className="input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question here..."
              maxLength={500}
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
