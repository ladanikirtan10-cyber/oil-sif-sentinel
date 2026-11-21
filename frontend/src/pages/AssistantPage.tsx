import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, FileText, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { api } from '../services/api';
import { VoiceWaveVisualizer } from '../components/ui/VoiceWaveVisualizer';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  voiceSpeaker, 
  createSpeechRecognizer, 
  SpeechRecognitionController 
} from '../utils/voiceAssistant';

interface AssistantPageProps {
  onSelectReport: (reportId: number) => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ onSelectReport }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      text: "Welcome to the OIL SIF SENTINEL Safety Intelligence Assistant. I am grounded directly in Oil India Limited's safety observation repository. You can ask me about precursor patterns, site risk rankings, Life-Saving Rule compliance, or specific incident trends.",
      sources: []
    }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice Assistance states
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const recognizerRef = useRef<SpeechRecognitionController | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup voice on unmount
      voiceSpeaker.stop();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  const suggestedQuestions = [
    'Why is Duliajan high risk?',
    'What are the most common SIF precursors?',
    'Show recurring energy isolation failures.',
    'Which activities have the highest SIF density?',
    'Which Life-Saving Rule is violated most frequently?'
  ];

  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      onStart: () => setIsListening(true),
      onResult: (transcript, isFinal) => {
        // Check for smart command like "send" or "submit"
        const lower = transcript.toLowerCase();
        if (lower === 'send' || lower === 'submit' || lower.endsWith(' submit') || lower.endsWith(' send')) {
          const cleanedText = query.replace(/\b(send|submit)\b/gi, '').trim();
          if (cleanedText) {
            handleSend(cleanedText);
            if (recognizerRef.current) recognizerRef.current.stop();
            setIsListening(false);
            return;
          }
        }

        setQuery((prev) => {
          const trimmed = prev.trim();
          if (isFinal) {
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          }
          return prev;
        });
      },
      onError: (err) => {
        console.warn('Voice query dictation error:', err);
        setIsListening(false);
        alert(err || 'Microphone error.');
      },
      onEnd: () => setIsListening(false),
    });

    recognizerRef.current = recognizer;
    recognizer.start();
  };

  const toggleSpeakMessage = (idx: number, text: string) => {
    if (speakingIndex === idx) {
      voiceSpeaker.stop();
      setSpeakingIndex(null);
      return;
    }

    voiceSpeaker.stop();
    setSpeakingIndex(idx);

    voiceSpeaker.speak(text, {
      onEnd: () => setSpeakingIndex(null),
      onError: () => setSpeakingIndex(null),
    });
  };

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
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">{t('assistant.title')}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {t('assistant.subtitle')}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-bold">
          {t('assistant.grounding')}
        </span>
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-shrink-0 text-xs text-slate-500">
        <span className="text-[11px] font-bold text-slate-600 uppercase flex-shrink-0">{t('assistant.suggested')}</span>
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sq)}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-[11px] text-slate-700 font-medium hover:text-blue-600 transition-all flex-shrink-0 whitespace-nowrap shadow-sm"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Message Chat Flow */}
      <div className="flex-1 overflow-y-auto space-y-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed font-medium ${
              m.role === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none space-y-3'
            }`}>
              {m.role === 'assistant' && (
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                  <span className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase flex items-center gap-1">
                    <Bot className="w-3 h-3 text-indigo-600" />
                    {t('assistant.response')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSpeakMessage(idx, m.text)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm ${
                      speakingIndex === idx
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 animate-pulse'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Read this response aloud"
                  >
                    {speakingIndex === idx ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-blue-600" />}
                    {speakingIndex === idx ? t('assistant.stopAudio') : t('assistant.readAloud')}
                  </button>
                </div>
              )}

              {speakingIndex === idx && (
                <div className="mb-2">
                  <VoiceWaveVisualizer
                    mode="speaking"
                    compact
                    label="Reading Safety Assistant Response..."
                    onStop={() => {
                      voiceSpeaker.stop();
                      setSpeakingIndex(null);
                    }}
                  />
                </div>
              )}

              <div className="whitespace-pre-line">{m.text}</div>

              {/* Cited Source Reports */}
              {m.sources && m.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-blue-600" />
                    {t('assistant.sources')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {m.sources.map((s: any, sIdx: number) => (
                      <div key={sIdx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] shadow-sm">
                        <div className="flex items-center justify-between font-mono font-bold text-blue-600">
                          <span>{s.report_uid}</span>
                          <span className="text-[10px] text-amber-700 font-semibold">Risk: {s.risk_score}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{s.site_name} • {s.activity}</div>
                        <div className="text-slate-600 text-[10px] line-clamp-1 mt-0.5 italic">"{s.snippet}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2 font-medium">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>{t('assistant.querying')}</span>
          </div>
        )}
      </div>

      {/* Active Speech Recognition Banner */}
      {isListening && (
        <VoiceWaveVisualizer
          mode="listening"
          compact
          label={t('assistant.listeningPrompt')}
          onStop={toggleListening}
        />
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 flex-shrink-0"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
            isListening
              ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 animate-pulse'
              : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-blue-600'
          }`}
          title={isListening ? 'Stop listening' : 'Ask question with voice dictation (Microphone)'}
        >
          {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isListening
              ? t('newReport.listening')
              : t('assistant.placeholder')
          }
          className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
        >
          <Send className="w-3.5 h-3.5" />
          {t('assistant.askButton')}
        </button>
      </form>
    </div>
  );
};
