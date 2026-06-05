import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import { Send, Bot, User, FileUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPanel({ clientId, onUploadComplete }) {
  const [messages, setMessages] = useState([{ role: 'assistant', text: "Hello! I'm your AI CA assistant. I have loaded the client's memory bank. How can I help?" }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setMessages([{ role: 'assistant', text: "Client switched. Memory reloaded. How can I assist?" }]);
  }, [clientId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const query = input;
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.query(clientId, query);
      let reply = res.response;
      
      // Highlight flags
      if (res.routing?.intent === 'anomaly' || reply.includes('FLAG:')) {
         reply = `⚠️ **Anomalies Detected**\n${reply}`;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: reply,
        meta: `Routed via: ${res.routing?.agents?.join(', ')} • Memory chunks used: ${res.memory_used}`
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error communicating with the backend." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setMessages(prev => [...prev, { role: 'user', text: `Uploaded document: ${file.name}` }]);
    setIsTyping(true);

    try {
      const res = await api.uploadDocument(clientId, "ay2425", file);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `✅ Document processed successfully.\nExtracted Gross: ₹${res.extracted.gross || 'N/A'}\nExtracted TDS: ₹${res.extracted.tds || 'N/A'}\n\nFacts have been written to the Hindsight memory bank.` 
      }]);
      if(onUploadComplete) onUploadComplete();
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Error parsing document." }]);
    } finally {
      setIsTyping(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0f1c] relative">
      <div className="p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm z-10 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Advisory Agent</h2>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Online & Memory Active
          </p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm rounded-lg border border-indigo-500/30 transition-colors"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
          Upload Form 16
        </button>
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="application/pdf" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                  {m.role === 'user' ? <User size={16} className="text-white"/> : <Bot size={16} className="text-cyan-400"/>}
                </div>
                <div className={`p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-indigo-500 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-lg'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{m.text}</p>
                  {m.meta && (
                    <div className="mt-3 pt-2 border-t border-slate-700/50 text-[10px] text-slate-500 font-mono">
                      {m.meta}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && !isUploading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                 <Bot size={16} className="text-cyan-400"/>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about advance tax, anomalies, or recommendations..."
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
