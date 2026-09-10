content = """import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface AssistantPageProps {
  onSelectReport: (reportId: number) => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ onSelectReport }) => {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      text: "Welcome to the OIL SIF SENTINEL Safety Intelligence Assistant. I am grounded directly in Oil India Limited's safety observation repository. You can ask me about precursor patterns, site risk rankings, Life-Saving Rule compliance, or specific incident trends.",
      sources: []
    }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'Why is Duliajan high risk?',
    'What are the most common SIF precursors?',
    'Show recurring energy isolation failures.',
    'Which activities have the highest SIF density?',
    'Which Life-Saving Rule is violated most frequently?'
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg = { role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.askAssistant(q);
      const botMsg = {
        role: 'assistant',
        text: res.answer,
        sources: res.source_reports || [],
        dataPoints: res.data_points
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'An error occurred while querying the safety repository.',
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">AI Safety Intelligence Assistant (RAG)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded strictly in active database records. Cites verified safety observations with zero hallucination.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
          DB Grounding: Active
        </span>
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-shrink-0 text-xs text-slate-400">
        <span className="text-[11px] font-bold text-slate-500 uppercase flex-shrink-0">Suggested:</span>
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-[11px] text-slate-300 transition-all flex-shrink-0 whitespace-nowrap"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Message Chat Flow */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-[#0C1222] border border-slate-800">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-1 border border-cyan-500/30">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
              m.role === 'user'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-br-none shadow-md'
                : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none space-y-3'
            }`}>
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Cited Source Reports */}
              {m.sources && m.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-sky-400" />
                    Cited Source Reports from Database:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {m.sources.map((s: any, sIdx: number) => (
                      <div key={sIdx} className="p-2 rounded bg-[#0C1222] border border-slate-800 text-[11px]">
                        <div className="flex items-center justify-between font-mono font-bold text-sky-400">
                          <span>{s.report_uid}</span>
                          <span className="text-[10px] text-amber-400">Risk: {s.risk_score}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.site_name} • {s.activity}</div>
                        <div className="text-slate-300 text-[10px] line-clamp-1 mt-0.5 italic">"{s.snippet}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-1 border border-slate-700">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Querying SQL database and calculating statistics...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about SIF precursors, high-risk assets, Life-Saving Rules compliance, or incident patterns..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-all flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Ask Assistant
        </button>
      </form>
    </div>
  );
};
"""

with open('frontend/src/pages/AssistantPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Created AssistantPage.tsx')
