import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import { Send, Sparkles, User, FileUp, Loader2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPanel({ clientId, onUploadComplete, activeView, setActiveView }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: "Client switched. Memory reloaded.\nHow can I assist?"
  }]);
  const [input, setInput]         = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef   = useRef(null);

  useEffect(() => {
    setMessages([{ role: 'assistant', text: "Client switched. Memory reloaded.\nHow can I assist?" }]);
  }, [clientId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e, forcedText = null) => {
    if (e) e.preventDefault();
    const query = forcedText || input;
    if (!query.trim() || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    if (!forcedText) setInput('');
    setIsTyping(true);
    try {
      const res = await api.query(clientId, query);
      let reply = res.response;
      if (res.routing?.intent === 'anomaly' || reply.includes('FLAG:')) {
        reply = `⚠️ Anomalies Detected\n${reply}`;
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: reply,
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error communicating with the backend." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setMessages(prev => [...prev, { role: 'user', text: `Uploaded: ${file.name}` }]);
    setIsTyping(true);
    try {
      const res = await api.uploadDocument(clientId, "ay2425", file);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `✅ Document processed.\nGross: ₹${res.extracted.gross || 'N/A'}\nTDS: ₹${res.extracted.tds || 'N/A'}\n\nFacts written to the memory bank.`
      }]);
      if (onUploadComplete) onUploadComplete();
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Error parsing document." }]);
    } finally {
      setIsTyping(false);
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div style={s.root}>
      {/* Top Nav */}
      <div style={s.topNav}>
        <div style={s.navGroup}>
          <button
            style={{
              ...s.navBtn,
              background: activeView === 'audit' ? '#FF5722' : '#fff',
              color:      activeView === 'audit' ? '#fff' : '#111',
              border:     '1px solid #E5E5E5',
            }}
            onClick={() => setActiveView('audit')}
          >
            <Database size={16} /> Memory Audit
          </button>
          <button
            style={{
              ...s.navBtn,
              background: activeView === 'chat' ? '#FF5722' : '#fff',
              color:      activeView === 'chat' ? '#fff' : '#111',
              border:     '1px solid #E5E5E5',
            }}
            onClick={() => setActiveView('chat')}
          >
            <Sparkles size={16} /> Advisory Agent
          </button>
        </div>
        
        <button style={s.uploadBtn} onClick={() => fileInputRef.current?.click()}>
          {isUploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FileUp size={14} />}
          Upload
        </button>
        <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" />
      </div>

      {/* Header */}
      <div style={s.header}>
        <h2 style={s.title}>Advisory Agent</h2>
        <p style={s.subtitle}>Ramesh Iyer · ABCRI1234D</p>
      </div>

      {/* Messages */}
      <div style={s.messages}>
        <div style={s.messagesContainer}>
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
              >
                <div style={{ display: 'flex', maxWidth: '78%', gap: '12px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  {/* Avatar */}
                  {m.role !== 'user' && (
                    <div style={{
                      ...s.avatar,
                      background: '#FF5722',
                    }}>
                      <Sparkles size={16} color="#fff" />
                    </div>
                  )}
                  {/* Bubble */}
                  <div style={{
                    ...s.bubble,
                    background:    m.role === 'user' ? '#111'  : '#fff',
                    color:         m.role === 'user' ? '#fff'  : '#111',
                    borderRadius:  m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    border:        m.role === 'user' ? 'none'  : '1px solid #E5E5E5',
                    boxShadow:     m.role === 'user' ? 'none'  : '0 2px 8px rgba(0,0,0,0.02)',
                  }}>
                    <p style={s.bubbleText}>{m.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && !isUploading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ ...s.avatar, background: '#FF5722' }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <div style={{ ...s.bubble, background: '#fff', border: '1px solid #E5E5E5', display: 'flex', gap: '5px', alignItems: 'center', borderRadius: '20px 20px 20px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <span style={s.dot} />
                  <span style={{ ...s.dot, animationDelay: '0.15s' }} />
                  <span style={{ ...s.dot, animationDelay: '0.3s'  }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={s.inputArea}>
        <div style={s.suggestionsRow}>
          <button style={s.suggestionChip} onClick={() => handleSend(null, "Any GST mismatches?")}>Any GST mismatches?</button>
          <button style={s.suggestionChip} onClick={() => handleSend(null, "Upcoming deadlines")}>Upcoming deadlines</button>
          <button style={s.suggestionChip} onClick={() => handleSend(null, "Summarise FY23 income")}>Summarise FY23 income</button>
          <button style={s.suggestionChip} onClick={() => handleSend(null, "Check advance tax")}>Check advance tax</button>
        </div>

        <form onSubmit={(e) => handleSend(e)} style={s.form}>
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about advance tax, anomalies, or recommendations…"
            style={s.input}
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            style={{
              ...s.sendBtn,
              background: input.trim() && !isTyping ? '#FF5722' : '#FFAB91',
              cursor:     input.trim() && !isTyping ? 'pointer' : 'default',
            }}
          >
            <Send size={18} color="#fff" />
          </button>
        </form>
        <p style={s.footerText}>Answers are grounded in Hindsight memory — always cite-checked</p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

const s = {
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '32px 32px 0',
  },
  topNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '48px',
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navBtn: {
    padding: '12px 24px',
    borderRadius: '99px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '-0.01em',
    transition: 'all 0.15s',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: '#fff',
    border: '1px solid #E5E5E5',
    borderRadius: '99px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0D9488',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#0D9488',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#fff',
    border: '1px solid #E5E5E5',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#111',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  title: {
    fontSize: '72px',
    fontWeight: 400,
    color: '#111',
    margin: '0 0 8px',
    fontFamily: "'Bebas Neue', sans-serif",
    letterSpacing: '0.02em',
    lineHeight: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: '15px',
    color: '#888',
    margin: 0,
    fontWeight: 500,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 0 24px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  messagesContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '0 24px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    padding: '16px 20px',
    maxWidth: '100%',
  },
  bubbleText: {
    fontSize: '15px',
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  dot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#ccc',
    animation: 'bounce-dot 1.2s ease-in-out infinite',
  },
  inputArea: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  suggestionsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
  },
  suggestionChip: {
    background: '#fff',
    border: '1px solid #E5E5E5',
    borderRadius: '99px',
    padding: '10px 20px',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  form: {
    display: 'flex',
    alignItems: 'flex-end',
    background: '#fff',
    border: '1px solid #E5E5E5',
    borderRadius: '16px',
    padding: '12px 12px 12px 24px',
    width: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '10px 0',
    fontSize: '16px',
    color: '#111',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    resize: 'none',
    lineHeight: '1.5',
    maxHeight: '150px',
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
    flexShrink: 0,
    marginLeft: '12px',
  },
  footerText: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
    textAlign: 'center',
  },
};
