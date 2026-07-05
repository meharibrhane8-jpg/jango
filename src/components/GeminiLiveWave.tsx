import React from 'react';

interface GeminiLiveWaveProps {
  state: 'connecting' | 'listening' | 'thinking' | 'speaking' | 'paused' | 'searching';
}

export const GeminiLiveWave: React.FC<GeminiLiveWaveProps> = ({ state }) => {
  return (
    <div className="relative w-full min-h-[300px] flex flex-col items-center justify-center overflow-visible select-none">
      
      {/* 1. IMMERSIVE GLOW BACKDROP (Extremely Subtle & High-Class) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className={`absolute w-[18rem] h-[18rem] rounded-full filter blur-[60px] transition-all duration-1000 opacity-30 ${
          state === 'connecting' ? 'bg-indigo-600/30' :
          state === 'thinking' ? 'bg-purple-600/20' :
          state === 'speaking' ? 'bg-indigo-500/30' :
          state === 'listening' ? 'bg-emerald-500/20' :
          state === 'searching' ? 'bg-teal-500/30' :
          'bg-slate-800/10'
        }`} />
      </div>

      {/* 2. MAIN RESPONSIVE AUDIO WAVE STAGE */}
      <div className="relative w-full max-w-md h-40 flex items-center justify-center z-10">
        <svg
          className="w-full h-full absolute inset-0 overflow-visible"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gemini-standard-flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            
            <linearGradient id="gemini-listening-flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <filter id="standard-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* STATE: SPEAKING (Dynamic wave lines) */}
          {state === 'speaking' && (
            <>
              {/* Primary Active Wave */}
              <path
                filter="url(#standard-glow)"
                d="M 10 100 Q 100 20, 200 100 T 390 100"
                fill="none"
                stroke="url(#gemini-standard-flow)"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  transformOrigin: 'center',
                  animation: 'gemini-bounce-1 1s infinite ease-in-out alternate',
                }}
              />
              {/* Supportive Wave */}
              <path
                filter="url(#standard-glow)"
                d="M 10 100 Q 100 180, 200 100 T 390 100"
                fill="none"
                stroke="url(#gemini-standard-flow)"
                strokeWidth="2.5"
                strokeOpacity="0.7"
                strokeLinecap="round"
                style={{
                  transformOrigin: 'center',
                  animation: 'gemini-bounce-2 1.3s infinite ease-in-out alternate-reverse',
                }}
              />
              {/* Accent Wave */}
              <path
                d="M 10 100 Q 80 50, 180 120 T 390 100"
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeOpacity="0.5"
                strokeLinecap="round"
                style={{
                  transformOrigin: 'center',
                  animation: 'gemini-bounce-3 1.6s infinite ease-in-out alternate',
                }}
              />
            </>
          )}

          {/* STATE: LISTENING (Simple elegant micro-vibrations) */}
          {state === 'listening' && (
            <>
              <path
                filter="url(#standard-glow)"
                d="M 10 100 C 130 80, 270 120, 390 100"
                fill="none"
                stroke="url(#gemini-listening-flow)"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{
                  transformOrigin: 'center',
                  animation: 'gemini-breathe-1 2.5s infinite ease-in-out alternate',
                }}
              />
              <path
                d="M 10 100 C 130 120, 270 80, 390 100"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeOpacity="0.6"
                strokeLinecap="round"
                style={{
                  transformOrigin: 'center',
                  animation: 'gemini-breathe-2 3s infinite ease-in-out alternate-reverse',
                }}
              />
            </>
          )}

          {/* STATE: THINKING / CONNECTING (Sleek charging flow) */}
          {(state === 'thinking' || state === 'connecting') && (
            <>
              <path
                d="M 10 100 C 100 50, 300 150, 390 100"
                fill="none"
                stroke="url(#gemini-standard-flow)"
                strokeWidth="3"
                strokeDasharray="6 8"
                style={{
                  animation: 'gemini-thinking 2s infinite linear',
                }}
              />
              <path
                d="M 10 100 C 100 150, 300 50, 390 100"
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                style={{
                  animation: 'gemini-thinking 2.5s infinite linear reverse',
                }}
              />
            </>
          )}

          {/* STATE: PAUSED */}
          {state === 'paused' && (
            <path
              d="M 50 100 L 350 100"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="opacity-40"
            />
          )}
        </svg>

        {/* 3. CENTER CYLINDER MICROPHONE BULB (Clean, professional, Google-inspired) */}
        <div className="absolute flex items-center justify-center">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 bg-[#090a10] border shadow-2xl relative ${
            state === 'connecting' ? 'border-indigo-500/50 scale-95' :
            state === 'thinking' ? 'border-purple-500/50 scale-100' :
            state === 'speaking' ? 'border-pink-500/60 scale-110 shadow-[0_0_30px_rgba(236,72,153,0.15)]' :
            state === 'listening' ? 'border-emerald-500/50 scale-105 shadow-[0_0_24px_rgba(16,185,129,0.15)] animate-pulse' :
            'border-slate-700/40 scale-95'
          }`}>
            
            {/* Soft Breathing Colored Core */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 ${
              state === 'connecting' ? 'bg-indigo-600/20' :
              state === 'thinking' ? 'bg-purple-600/25' :
              state === 'speaking' ? 'bg-gradient-to-tr from-indigo-500 to-pink-500 opacity-90' :
              state === 'listening' ? 'bg-emerald-600/20' :
              'bg-slate-800/10'
            }`}>
              
              {/* Dynamic Action Icon Indicator */}
              <div className="text-white">
                {state === 'speaking' && (
                  <div className="flex gap-1 items-center justify-center">
                    <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                  </div>
                )}
                {state === 'listening' && (
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                )}
                {state === 'thinking' && (
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                )}
                {state === 'searching' && (
                  <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                )}
                {state === 'connecting' && (
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                )}
                {state === 'paused' && (
                  <div className="flex gap-1">
                    <span className="w-1 h-3 bg-slate-500 rounded-sm" />
                    <span className="w-1 h-3 bg-slate-500 rounded-sm" />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 4. CLEAR SUBTITLE STATUS FOOTER */}
      <div className="mt-2 px-6 text-center max-w-xs pointer-events-none transition-all duration-500">
        <p className="text-xs font-semibold text-white/50 tracking-wide">
          {state === 'listening' && "ክሰምዓኩም ተዳልየ ኣለኹ..."}
          {state === 'speaking' && "ጀሚናይ ይዛረብ ኣሎ..."}
          {state === 'thinking' && "ሓሳባተይ የዳልው ኣለኹ..."}
          {state === 'searching' && "ኣብ ኢንተርነት ይደሊ ኣለኹ..."}
          {state === 'connecting' && "ይራኸብ ኣሎ..."}
          {state === 'paused' && "ደው ኢሉ ኣሎ"}
        </p>
      </div>

    </div>
  );
};
