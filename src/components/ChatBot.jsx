import React, { useEffect, useRef, useState } from 'react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'text-bison-001';

const defaultMessages = [
  {
    sender: 'assistant',
    text: 'Hello, I am your Rwanda heritage assistant. Ask me about Kwibuka, culture, or memory.',
  },
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setInput('');

    if (!GEMINI_API_KEY) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.',
        },
      ]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta2/models/${GEMINI_MODEL}:generateText?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: {
              text: `You are a friendly Rwandan heritage guide. Answer the user as clearly and respectfully as possible. User: ${trimmed}`,
            },
            temperature: 0.4,
            maxOutputTokens: 250,
          }),
        }
      );

      const data = await response.json();
      const answer = data?.candidates?.[0]?.output || data?.error?.message || 'Sorry, I could not get a response from Gemini.';
      setMessages((prev) => [...prev, { sender: 'assistant', text: answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'An error occurred while contacting Gemini. Please try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chatbot-widget ${open ? 'chatbot-open' : ''}`}>
      <button className="chatbot-toggle" onClick={() => setOpen((prev) => !prev)} aria-label="Open heritage chat">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 7.5c1.38 0 2.5 1.12 2.5 2.5v1c0 1.38-1.12 2.5-2.5 2.5S9.5 12.38 9.5 11.5v-1c0-1.38 1.12-2.5 2.5-2.5z" />
          <path d="M8.5 9.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5" />
          <path d="M9 17h6" />
          <path d="M7 20h10" />
          <path d="M4 6h16" />
        </svg>
      </button>

      <div className="chatbot-panel">
        <div className="chatbot-header">
          <div>
            <div className="chatbot-title">Rwanda Heritage Bot</div>
            <div className="chatbot-subtitle">Ask about Kwibuka, culture, and memory</div>
          </div>
          <button type="button" className="chatbot-close" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chatbot-message ${message.sender}`}>
              <div className="chatbot-message-text">{message.text}</div>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>

        <form className="chatbot-input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about Rwanda..."
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading}>
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
