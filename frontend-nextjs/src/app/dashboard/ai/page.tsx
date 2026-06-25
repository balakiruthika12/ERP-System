'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const EXAMPLE_PROMPTS = [
  'Summarize the current business health and key risks.',
  'Which department has the highest attrition risk this quarter?',
  'Predict Q1 2027 revenue based on current trajectory.',
  'What are the top 3 cost reduction opportunities?',
  'Analyze the impact of hiring 50 engineers on operating margins.',
];

function TypingDots() {
  return (
    <div className="flex items-center space-x-1.5 px-4 py-3">
      <span className="text-slate-500 text-sm mr-2">AI is thinking</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function AiCopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm the Autonomous ERP AI Copilot. I have full context of your enterprise data — financials, workforce metrics, operational KPIs, and more. Ask me anything.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the Python AI service via the Java backend proxy (or directly in dev)
      const token = localStorage.getItem('erp_token');
      const res = await fetch('http://localhost:8000/api/v1/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: text }),
      });

      let assistantText = 'I was unable to connect to the AI service. Please ensure the Python AI core is running on port 8000.';
      if (res.ok) {
        const data = await res.json();
        assistantText = data.response || assistantText;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Unable to reach the AI Core service. Make sure the Python backend is running: `uvicorn main:app --reload`',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">AI Copilot</h2>
          <p className="text-slate-400">Your autonomous enterprise intelligence engine.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-400">AI Online</span>
        </div>
      </div>

      {/* Example prompts */}
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            className="text-xs px-3 py-1.5 bg-slate-800/60 border border-slate-700 rounded-full text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-900/30 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' && (
                <p className="text-indigo-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">AI Copilot</p>
              )}
              {msg.content}
              <p className="text-xs opacity-40 mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-bl-sm">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-3">
          <input
            id="ai-copilot-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI Copilot anything about your enterprise..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-600 text-sm outline-none disabled:opacity-50 px-2"
          />
          <button
            id="ai-copilot-send"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">Powered by local LLM via Ollama. Press Enter to send.</p>
      </div>
    </div>
  );
}
