import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mic, 
  Plus, 
  Play, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Radio, 
  Loader2,
  ChevronDown,
  Trash2,
  History,
  Clock
} from 'lucide-react';
import { generateTTS } from '../services/geminiService';
import { playBase64Audio } from '../services/audioService';
import { downloadWav } from '../lib/wavUtils';

interface TtsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: {
    isDark: boolean;
    accent?: string;
  };
  defaultSpeaker?: string;
  defaultModel?: string;
  showToast: (msg: string) => void;
}

interface SpeechBlock {
  id: string;
  speaker: string;
  text: string;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  scene: string;
  blocks: SpeechBlock[];
  audioBlocks: Record<string, string>;
}

const SPEAKERS = [
  'Speaker 1 - Orus',
  'Speaker 2 - Kore',
  'Speaker 3 - Aoede',
  'Speaker 4 - Charon',
  'Speaker 5 - Puck',
  'Speaker 6 - Fenrir',
  'Speaker 7 - Selam'
];

export const TtsStudioModal: React.FC<TtsStudioModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  showToast
}) => {
  const [scene, setScene] = useState('The Sound Stage Booth.');
  const [context, setContext] = useState('Premium commercial. Dynamic pacing—starts intrigued, ends punchy. Tone is polished, persuasive, and inviting.');
  const [speechBlocks, setSpeechBlocks] = useState<SpeechBlock[]>([
    {
      id: '1',
      speaker: 'Speaker 1 - Orus',
      text: '[intrigue] You don\'t just want a car. [desire] You want a sanctuary. [information] Introducing the all-new Aetheris Sedan. With whisper-quiet cabin technology and an interior designed around you. [inspiration] It\'s not just about getting to your destination. It\'s about arriving inspired. [confident] Aetheris. Move beautifully.'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedAudioBlocks, setGeneratedAudioBlocks] = useState<Record<string, string>>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('tts_studio_history_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tts_studio_history_v2', JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  }, [history]);

  // The AI Studio colors
  const bgColor = currentTheme.isDark ? 'bg-[#0f0f12]' : 'bg-white';
  const modalBgColor = currentTheme.isDark ? 'bg-white text-slate-900' : 'bg-white text-slate-900'; 
  const isDark = currentTheme.isDark;

  const handleRun = useCallback(async () => {
    if (speechBlocks.length === 0 || !speechBlocks[0].text.trim()) {
      showToast("Please enter text for at least one speech block.");
      return;
    }
    if (isGenerating) return;

    setIsGenerating(true);
    setProgress(0);
    showToast("Synthesizing speech sequence...");

    try {
      const newAudioBlocks = { ...generatedAudioBlocks };
      for (let i = 0; i < speechBlocks.length; i++) {
        const block = speechBlocks[i];
        const cleanText = block.text.replace(/\[.*?\]/g, '').trim() || block.text;
        const speakerName = block.speaker.split(' - ')[1] || 'Kore';
        
        const audioBase64 = await generateTTS(cleanText, speakerName, 'gemini-3.1-flash-tts-preview');
        if (audioBase64) {
          newAudioBlocks[block.id] = audioBase64;
          setProgress(((i + 1) / speechBlocks.length) * 100);
          
          setIsPlaying(true);
          await playBase64Audio(audioBase64, 24000);
          setIsPlaying(false);
        }
      }
      setGeneratedAudioBlocks(newAudioBlocks);
      
      // Save to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        scene,
        blocks: [...speechBlocks],
        audioBlocks: newAudioBlocks
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 20)); // Keep last 20
      
      showToast("✓ Speech synthesized and played successfully!");
    } catch (err) {
      console.error("Synthesis error:", err);
      if (err instanceof Error && err.message === 'QUOTA_EXCEEDED') {
        showToast("Rate limit reached. Please wait a moment before trying again.");
      } else {
        showToast("Synthesis failed. Please verify configurations and try again.");
      }
    } finally {
      setIsGenerating(false);
      setIsPlaying(false);
      setProgress(0);
    }
  }, [speechBlocks, generatedAudioBlocks, isGenerating, showToast, scene]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleRun]);

  const addBlock = () => {
    setSpeechBlocks([
      ...speechBlocks, 
      { id: Date.now().toString(), speaker: 'Speaker 1 - Orus', text: '' }
    ]);
  };

  const updateBlockText = (id: string, text: string) => {
    setSpeechBlocks(speechBlocks.map(b => b.id === id ? { ...b, text } : b));
  };

  const updateBlockSpeaker = (id: string, speaker: string) => {
    setSpeechBlocks(speechBlocks.map(b => b.id === id ? { ...b, speaker } : b));
    setActiveDropdown(null);
  };

  const removeBlock = (id: string) => {
    setSpeechBlocks(speechBlocks.filter(b => b.id !== id));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setScene(item.scene);
    setSpeechBlocks(item.blocks);
    setGeneratedAudioBlocks(item.audioBlocks);
    setShowHistory(false);
    showToast("Loaded project from history.");
  };
  
  const playHistoryAudio = async (item: HistoryItem) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      for (const block of item.blocks) {
        const audio = item.audioBlocks[block.id];
        if (audio) {
          await playBase64Audio(audio, 24000);
        }
      }
    } catch (err) {
      console.error("Failed to play history audio:", err);
    } finally {
      setIsPlaying(false);
    }
  };

  const downloadHistoryAudio = (item: HistoryItem) => {
    if (Object.keys(item.audioBlocks).length > 0) {
      const firstAudio = Object.values(item.audioBlocks)[0];
      downloadWav(firstAudio, `voiceover_${item.id}.wav`);
      showToast("Download started.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2001] flex items-center justify-center bg-black/50 p-4 sm:p-8 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`w-full max-w-6xl h-full max-h-[90vh] flex rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}
          >
            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showHistory ? 'hidden sm:flex border-r border-slate-200 dark:border-white/10' : ''}`}>
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10 shrink-0">
                 <div className="flex items-center gap-3">
                   <h2 className="text-sm font-semibold opacity-80">TTS Studio</h2>
                   <button 
                     onClick={() => setShowHistory(!showHistory)}
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${showHistory ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                   >
                     <History className="w-3.5 h-3.5" />
                     History
                   </button>
                 </div>
                 <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col gap-8 custom-scrollbar">
                
                {/* Scene Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium opacity-80">Scene</label>
                  <input 
                    value={scene}
                    onChange={(e) => setScene(e.target.value)}
                    className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-transparent border-white/20 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`}
                  />
                </div>

                {/* Sample Context Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium opacity-80">Sample Context</label>
                  <input 
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${isDark ? 'bg-transparent border-white/20 focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500 shadow-sm'}`}
                  />
                </div>

                {/* Speech Blocks */}
                <div className="flex flex-col gap-6">
                  {speechBlocks.map((block) => (
                    <div key={block.id} className={`rounded-xl border ${isDark ? 'border-indigo-500/40 bg-slate-900/50' : 'border-[#1a73e8] bg-white'} overflow-hidden relative`}>
                      {/* Block Header */}
                      <div className="flex items-center justify-between p-3 border-b border-transparent">
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === block.id ? null : block.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${isDark ? 'border-white/20 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            {block.speaker}
                          </button>

                          {/* Speaker Dropdown */}
                          {activeDropdown === block.id && (
                            <div className={`absolute top-full left-0 mt-1 w-48 rounded-lg shadow-xl border z-10 py-1 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                              {SPEAKERS.map(s => (
                                <button 
                                  key={s}
                                  onClick={() => updateBlockSpeaker(block.id, s)}
                                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10 ${s === block.speaker ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {speechBlocks.length > 1 && (
                            <button 
                              onClick={() => removeBlock(block.id)}
                              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-red-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 opacity-80" />
                            </button>
                          )}
                          <div className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer text-indigo-500">
                            <Mic className="w-5 h-5 opacity-80" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Block Textarea */}
                      <textarea 
                        value={block.text}
                        onChange={(e) => updateBlockText(block.id, e.target.value)}
                        className="w-full min-h-[120px] p-5 bg-transparent border-none outline-none text-[15px] leading-relaxed resize-y"
                        placeholder="Enter speech text here..."
                      />
                    </div>
                  ))}

                  <button 
                    onClick={addBlock}
                    className="flex items-center justify-center gap-2 py-4 text-sm font-medium opacity-80 hover:opacity-100 transition-all hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10"
                  >
                    <Plus className="w-4 h-4" /> Add speech block
                  </button>
                </div>
              </div>

              {/* Bottom Timeline & Controls */}
              <div className="shrink-0 border-t border-slate-200 dark:border-white/10 p-4 sm:px-8 flex items-center justify-between bg-transparent">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-[11px] font-mono opacity-60">0:00</span>
                  <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer group">
                    <div className={`absolute left-0 top-0 bottom-0 ${progress > 0 ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-500'} rounded-full transition-all duration-300`} style={{ width: `${progress > 0 ? progress : (isPlaying ? 100 : 0)}%` }} />
                    <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border border-slate-300 dark:border-slate-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity`} style={{ left: `${progress > 0 ? progress : (isPlaying ? 100 : 0)}%`, transform: 'translate(-50%, -50%)' }} />
                  </div>
                  <span className="text-[11px] font-mono opacity-60">0:24</span>
                </div>

                <div className="flex items-center gap-6 ml-8">
                  <div className="flex items-center gap-4 opacity-60">
                    <button className="hover:opacity-100 transition-opacity" onClick={() => {
                       if(Object.keys(generatedAudioBlocks).length > 0) {
                          const firstAudio = Object.values(generatedAudioBlocks)[0];
                          downloadWav(firstAudio, 'ad_voiceover.wav');
                       }
                    }}>
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="hover:opacity-100 transition-opacity"><ThumbsUp className="w-4 h-4" /></button>
                    <button className="hover:opacity-100 transition-opacity"><ThumbsDown className="w-4 h-4" /></button>
                    <button className="hover:opacity-100 transition-opacity"><Radio className="w-4 h-4" /></button>
                  </div>
                  
                  <button 
                    onClick={handleRun}
                    disabled={isGenerating || isPlaying}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 ${isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    {(isGenerating || isPlaying) ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isGenerating ? 'Synthesizing...' : isPlaying ? 'Playing...' : 'Run ⌘ ↵'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* History Sidebar */}
            {showHistory && (
              <div className="w-full sm:w-80 flex flex-col shrink-0 bg-transparent">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10 shrink-0">
                   <h2 className="text-sm font-semibold opacity-80 flex items-center gap-2">
                     <Clock className="w-4 h-4" />
                     History
                   </h2>
                   <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full sm:hidden">
                     <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50 gap-2 p-4">
                      <History className="w-8 h-8 mb-2" />
                      <p className="text-sm font-medium">No history yet</p>
                      <p className="text-xs">Generated audio sequences will appear here.</p>
                    </div>
                  ) : (
                    history.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-800/50 border-white/5 hover:border-indigo-500/30 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-bold truncate pr-2">{item.scene || 'Untitled Scene'}</h3>
                          <span className="text-[10px] font-mono opacity-50 shrink-0">
                            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        
                        <p className="text-xs opacity-70 line-clamp-2 mb-3 leading-relaxed">
                          {item.blocks.map(b => b.text).join(' ')}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-200 dark:border-white/5">
                          <button 
                            onClick={() => loadHistoryItem(item)}
                            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Load Project
                          </button>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => playHistoryAudio(item)}
                              disabled={isPlaying}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                              title="Play sequence"
                            >
                              <Play className="w-3.5 h-3.5 opacity-80" />
                            </button>
                            <button 
                              onClick={() => downloadHistoryAudio(item)}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                              title="Download audio"
                            >
                              <Download className="w-3.5 h-3.5 opacity-80" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

