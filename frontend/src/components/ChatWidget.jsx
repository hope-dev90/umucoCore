import React, { useState, useRef, useEffect, useMemo } from 'react';
import { sendMessage } from '../services/geminiChat';
import { useLanguage } from '../contexts/LanguageContext';
import UmucoLogo from './UmucoLogo';
import './ChatWidget.css';

const CHAT_STRINGS = {
  en: {
    greeting: "Hello! How can I help you today with Rwandan culture and heritage?",
    placeholder: "Type here...",
    closeLabel: "Close chat",
    openLabel: "Open chat with Umuco",
    dialogLabel: "Chat with Umuco",
    sendLabel: "Send message",
    typingLabel: "Typing...",
    errorMsg: "Sorry, we couldn't get a response right now. / Ihangane, ntibishoboka kubona igisubizo ubu.",
    widgetLabel: "Umuco chat assistant",
  },
  rw: {
    greeting: "Muraho! Ndagufasha gute uyu munsi ku byerekeye umuco w'u Rwanda?",
    placeholder: "Andika hano...",
    closeLabel: "Funga ikiganiro",
    openLabel: "Fungura chat na Umuco",
    dialogLabel: "Ikiganiro na Umuco",
    sendLabel: "Ohereza ubutumwa",
    typingLabel: "Birategerejwe...",
    errorMsg: "Ihangane, ntibishoboka kubona igisubizo ubu. / Sorry, we couldn't get a response right now.",
    widgetLabel: "Umuco chat assistant",
  },
};

export default function ChatWidget() {
  const { language } = useLanguage();
  const strings = CHAT_STRINGS[language] || CHAT_STRINGS.en;

  const initialMessages = useMemo(
    () => [{ role: 'model', parts: strings.greeting }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  );

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Reset greeting when language changes
  useEffect(() => {
    setMessages([{ role: 'model', parts: strings.greeting }]);
  }, [language, strings.greeting]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', parts: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Exclude the greeting from history sent to the API
      const history = messages.filter((m) => m.role !== 'model' || messages.indexOf(m) > 0);
      const reply = await sendMessage(history, text, language);
      setMessages((prev) => [...prev, { role: 'model', parts: reply }]);
    } catch (err) {
      console.error('ChatWidget send error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: strings.errorMsg, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-widget" role="complementary" aria-label={strings.widgetLabel}>
      {open && (
        <div className="chat-window" role="dialog" aria-modal="true" aria-label={strings.dialogLabel}>
          <div className="chat-header">
            <div className="chat-header-info">
              <UmucoLogo style={{ width: 24, height: 24 }} />
              <span className="chat-title">Umuco</span>
            </div>
            <button
              className="chat-close-btn"
              onClick={() => setOpen(false)}
              aria-label={strings.closeLabel}
            >
              ✕
            </button>
          </div>

          <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--bot'}${msg.isError ? ' chat-bubble--error' : ''}`}
              >
                {msg.parts}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble--bot chat-bubble--typing" aria-label={strings.typingLabel}>
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input"
              rows={1}
              placeholder={strings.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={strings.placeholder}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label={strings.sendLabel}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        className="chat-launcher"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? strings.closeLabel : strings.openLabel}
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
