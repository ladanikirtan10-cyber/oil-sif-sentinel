import React from 'react';
import { Mic, Volume2, Square, Pause, Play, Radio } from 'lucide-react';

interface VoiceWaveVisualizerProps {
  mode: 'listening' | 'speaking' | 'idle';
  label?: string;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
  compact?: boolean;
}

export const VoiceWaveVisualizer: React.FC<VoiceWaveVisualizerProps> = ({
  mode,
  label,
  onStop,
  onPause,
  onResume,
  isPaused = false,
  compact = false,
}) => {
  if (mode === 'idle') return null;

  const isListening = mode === 'listening';

  return (
    <div
      className={`rounded-xl border transition-all flex items-center justify-between gap-3 shadow-sm ${
        compact ? 'py-1.5 px-3' : 'p-3.5'
      } ${
        isListening
          ? 'bg-amber-50/90 border-amber-300 text-amber-900 glow-warning'
          : 'bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-sky-50/90 border-blue-200 text-slate-800 glow-cyan'
      }`}
    >
      {/* Left indicator & wave */}
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
            isListening ? 'bg-amber-500 text-white animate-pulse' : 'bg-blue-600 text-white'
          }`}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isListening ? 'bg-amber-500' : 'bg-blue-500'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isListening ? 'bg-amber-600' : 'bg-blue-600'
                }`}
              ></span>
            </span>
            <span className="text-xs font-black tracking-wide">
              {label || (isListening ? 'Voice Dictation Active' : 'AI Voice Briefing Playing')}
            </span>
          </div>
          {!compact && (
            <p className="text-[10px] text-slate-600 font-medium mt-0.5">
              {isListening
                ? 'Speak clearly in English or Hinglish • Speech converts to text in real-time'
                : 'Streaming natural voice synthesis from Oil India HSE knowledge base'}
            </p>
          )}
        </div>
      </div>

      {/* Center animated audio equalizer wave */}
      <div className="flex items-center gap-1 h-5 px-2">
        <span
          className={`w-1 rounded-full ${isListening ? 'bg-amber-500' : 'bg-blue-600'} animate-bounce`}
          style={{ height: '70%', animationDelay: '0ms' }}
        ></span>
        <span
          className={`w-1 rounded-full ${isListening ? 'bg-amber-600' : 'bg-indigo-600'} animate-bounce`}
          style={{ height: '100%', animationDelay: '150ms' }}
        ></span>
        <span
          className={`w-1 rounded-full ${isListening ? 'bg-orange-500' : 'bg-sky-500'} animate-bounce`}
          style={{ height: '50%', animationDelay: '300ms' }}
        ></span>
        <span
          className={`w-1 rounded-full ${isListening ? 'bg-amber-500' : 'bg-blue-500'} animate-bounce`}
          style={{ height: '90%', animationDelay: '200ms' }}
        ></span>
        <span
          className={`w-1 rounded-full ${isListening ? 'bg-amber-600' : 'bg-indigo-500'} animate-bounce`}
          style={{ height: '60%', animationDelay: '100ms' }}
        ></span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {onPause && onResume && (
          <button
            type="button"
            onClick={isPaused ? onResume : onPause}
            className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm text-xs font-bold"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        )}
        {onStop && (
          <button
            type="button"
            onClick={onStop}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 border border-slate-300 hover:border-red-300 text-red-600 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
            title="Stop voice"
          >
            <Square className="w-3 h-3 fill-red-600" />
            <span>Stop</span>
          </button>
        )}
      </div>
    </div>
  );
};
