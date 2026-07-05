import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings2, 
  RotateCcw, 
  Moon, 
  Sun, 
  Keyboard, 
  Monitor, 
  Palette, 
  Sparkles, 
  Terminal, 
  BrainCircuit, 
  Trash2, 
  ClipboardList, 
  CheckCircle2, 
  Mic, 
  Check, 
  ChevronDown,
  Volume2,
  Loader2
} from 'lucide-react';
import { AI_MODES_LIST } from './AiModesManager';
import { getAccessToken } from '../services/firebaseAuthService';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: {
    isDark: boolean;
    accent?: string;
  };
  factoryReset: () => void;
  physicalKeyboardSync: boolean;
  setPhysicalKeyboardSync: (sync: boolean) => void;
  isThemeScheduled: boolean;
  setIsThemeScheduled: (schedule: boolean) => void;
  themeKey: string;
  setThemeKey: (key: any) => void;
  THEMES: any;
  activeAiMode: string;
  onSelectMode: (mode: string) => void;
  activeVoiceGender: 'female' | 'male';
  onSelectGender: (gender: 'female' | 'male') => void;
  onSpeedChange: (speed: number) => void;
  speed: number;
  onMicSelect: (deviceId: string) => void;
  selectedMic: string;
  availableMicrophones: MediaDeviceInfo[];
  onPreviewVoice?: (modeId: string, gender: 'female' | 'male', previewText: string) => void;
  isPreviewing?: boolean;
  previewingModeId?: string | null;
  previewingGender?: 'female' | 'male' | null;
  t: (key: string) => string;
  activeLanguage: string;
  proactiveSuggestions: boolean;
  setProactiveSuggestions: (val: boolean) => void;
  habitTracking: boolean;
  setHabitTracking: (val: boolean) => void;
  isMemoryEnabled: boolean;
  onToggleMemoryEnabled: (enabled: boolean) => void;
  currentUser: any;
  onSignIn: () => void;
  onSignOut: () => void;
  customSystemInstructions: string;
  onSaveCustomSystemInstructions: (instructions: string) => void;
}

export const SettingsDrawer = ({ 
  isOpen, 
  onClose, 
  currentTheme, 
  factoryReset, 
  physicalKeyboardSync, 
  setPhysicalKeyboardSync, 
  isThemeScheduled, 
  setIsThemeScheduled,
  themeKey,
  setThemeKey,
  THEMES,
  activeAiMode,
  onSelectMode,
  activeVoiceGender,
  onSelectGender,
  onSpeedChange,
  speed,
  onMicSelect,
  selectedMic,
  availableMicrophones,
  onPreviewVoice,
  isPreviewing = false,
  previewingModeId = null,
  previewingGender = null,
  t,
  activeLanguage,
  proactiveSuggestions,
  setProactiveSuggestions,
  habitTracking,
  setHabitTracking,
  isMemoryEnabled,
  onToggleMemoryEnabled,
  currentUser,
  onSignIn,
  onSignOut,
  customSystemInstructions,
  onSaveCustomSystemInstructions
}: SettingsDrawerProps) => {
  const [showPersonalityMenu, setShowPersonalityMenu] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showMicMenu, setShowMicMenu] = useState(false);
  
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('selected_voice_name');
      if (saved) return saved;
    } catch {}
    return activeVoiceGender === 'female' ? 'Ara' : 'Leo';
  });

  const handleSelectVoice = (name: string, gender: 'female' | 'male') => {
    setSelectedVoiceName(name);
    try {
      localStorage.setItem('selected_voice_name', name);
    } catch {}
    onSelectGender(gender);
  };

  const handlePreviewClick = (e: React.MouseEvent, voice: any) => {
    e.stopPropagation();
    if (onPreviewVoice) {
      onPreviewVoice(activeAiMode || 'default', voice.gender, t('voicePreview'));
    }
  };

  const VOICES = [
    { name: 'Ara', gender: 'female' as const, desc: 'Upbeat Female' },
    { name: 'Eve', gender: 'female' as const, desc: 'Soothing Female' },
    { name: 'Leo', gender: 'male' as const, desc: 'British Male' },
    { name: 'Rex', gender: 'male' as const, desc: 'Calm Male' },
    { name: 'Sal', gender: 'male' as const, desc: 'Smooth Male' },
    { name: 'Gork', gender: 'male' as const, desc: 'Lazy Male' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          
          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed top-0 right-0 h-full w-full sm:w-[340px] z-50 border-l shadow-2xl flex flex-col transition-all duration-300 ${
              currentTheme.isDark 
                ? 'bg-slate-900 border-white/10 text-white' 
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Header */}
            <div className={`flex justify-between items-center p-6 border-b shrink-0 ${
              currentTheme.isDark ? 'border-white/5' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${currentTheme.isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Settings2 className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight font-sans">{t('settings')}</h3>
                  <p className="text-[10px] opacity-60">{t('subtitle')}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                aria-label="Close settings"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            {/* Scrollable Content Body */}
            <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Appearance Selection */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black uppercase tracking-wider opacity-50 flex items-center gap-1.5 font-sans">
                  <Palette className="w-3.5 h-3.5" /> {t('appearance')}
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(THEMES || {})
                    .filter(([id]) => ['system', 'light', 'dark'].includes(id))
                    .map(([id, t]: [string, any]) => {
                      const isActive = themeKey === id;
                      let ThemeIcon = Monitor;
                      if (id === 'light') ThemeIcon = Sun;
                      if (id === 'dark') ThemeIcon = Moon;
                      
                      return (
                        <button
                          key={id}
                          id={`theme-select-${id}`}
                          onClick={() => setThemeKey(id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 outline-none text-center gap-1.5 hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                            isActive 
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold shadow-sm' 
                              : currentTheme.isDark 
                                ? 'border-white/5 bg-white/5 hover:bg-white/10 text-white/70' 
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700'
                          }`}
                        >
                          <ThemeIcon className={`w-4 h-4 ${isActive ? 'scale-110' : 'opacity-70'}`} />
                          <span className="text-xs truncate max-w-full font-bold capitalize">
                            {id === 'system' ? 'System' : id === 'light' ? 'Day' : 'Night'}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* AI Persona Section */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black uppercase tracking-wider opacity-50 flex items-center gap-1.5 font-sans">
                  <Sparkles className="w-3.5 h-3.5" /> {t('aiPersona')}
                </span>
                
                <div className={`p-4 rounded-2xl border flex flex-col gap-5 ${
                  currentTheme.isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/50'
                }`}>
                  
                  {/* Personality Selection */}
                  <div className="flex flex-col gap-2 relative">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold opacity-80">Personality</h4>
                      <span className="text-[10px] font-extrabold opacity-60 bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                        Persona
                      </span>
                    </div>
                    <div className="relative">
                      <button 
                        type="button"
                        className={`w-full p-3 rounded-xl border flex justify-between items-center text-xs transition-all outline-none ${
                          currentTheme.isDark 
                            ? 'border-white/10 bg-slate-950 text-white hover:border-indigo-500/50 hover:bg-slate-900' 
                            : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-500/50 hover:bg-slate-50'
                        }`}
                        onClick={() => setShowPersonalityMenu(!showPersonalityMenu)}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                          <span className="font-bold">{AI_MODES_LIST.find(m => m.id === activeAiMode)?.name || 'Assistant'}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </button>
                      
                      {showPersonalityMenu && (
                        <div className={`absolute left-0 right-0 mt-1.5 p-1.5 rounded-xl border space-y-1 max-h-[180px] overflow-y-auto z-50 shadow-xl ${
                          currentTheme.isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-800'
                        }`}>
                          {AI_MODES_LIST.map(mode => (
                            <button 
                              key={mode.id}
                              type="button"
                              onClick={() => {
                                onSelectMode(mode.id);
                                setShowPersonalityMenu(false);
                              }}
                              className={`w-full p-2.5 text-left text-xs rounded-lg flex justify-between items-center transition-colors ${
                                activeAiMode === mode.id 
                                  ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold' 
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-900/50'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold">{mode.name}</span>
                                <span className="text-[9px] opacity-65 font-normal mt-0.5">{mode.description}</span>
                              </div>
                              {activeAiMode === mode.id && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-2" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Voice Selector Dropdown */}
                  <div className="flex flex-col gap-2 relative">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold opacity-80">Voice Gender & Sub-voice</h4>
                      <span className="text-[10px] font-extrabold opacity-60 bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                        Voice
                      </span>
                    </div>
                    <div className="relative">
                      <button 
                        type="button"
                        className={`w-full p-3 rounded-xl border flex justify-between items-center text-xs transition-all outline-none ${
                          currentTheme.isDark 
                            ? 'border-white/10 bg-slate-950 text-white hover:border-indigo-500/50 hover:bg-slate-900' 
                            : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-500/50 hover:bg-slate-50'
                        }`}
                        onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                      >
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-bold">
                            {selectedVoiceName} ({activeVoiceGender === 'female' ? 'Female' : 'Male'} - {VOICES.find(v => v.name === selectedVoiceName)?.desc || ''})
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </button>
                      
                      {showVoiceMenu && (
                        <div className={`absolute left-0 right-0 mt-1.5 p-1.5 rounded-xl border space-y-1 max-h-[220px] overflow-y-auto z-50 shadow-xl ${
                          currentTheme.isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-800'
                        }`}>
                          {VOICES.map(voice => {
                            const isSelected = voice.name === selectedVoiceName && voice.gender === activeVoiceGender;
                            const isVoicePlaying = isPreviewing && previewingGender === voice.gender;
                            
                            return (
                              <div 
                                key={voice.name}
                                onClick={() => {
                                  handleSelectVoice(voice.name, voice.gender);
                                  setShowVoiceMenu(false);
                                }}
                                className={`p-2.5 rounded-lg flex justify-between items-center text-xs transition-colors cursor-pointer ${
                                  isSelected 
                                    ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-900/50'
                                }`}
                              >
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold">{voice.name}</span>
                                    <span className="text-[9px] opacity-60">({voice.gender})</span>
                                  </div>
                                  <span className="text-[9px] opacity-65 font-normal mt-0.5">{voice.desc}</span>
                                </div>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  {/* Audio Play Preview Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => handlePreviewClick(e, voice)}
                                    className={`p-1.5 rounded-lg transition-all shrink-0 ${
                                      isVoicePlaying 
                                        ? 'bg-indigo-600 text-white animate-pulse' 
                                        : 'hover:bg-black/5 dark:hover:bg-white/15 text-slate-400 hover:text-indigo-500'
                                    }`}
                                    title="Listen Preview"
                                  >
                                    {isVoicePlaying ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Volume2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Speed Section */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold opacity-80">{t('speed')}</h4>
                      <span className="text-[10px] font-extrabold opacity-70 bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">{speed.toFixed(1)}x</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2.0" 
                        step="0.1" 
                        value={speed}
                        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none" 
                      />
                      <div className="flex justify-between text-[8px] opacity-40 px-1 font-mono tracking-wider">
                        <span>0.5x</span>
                        <span>1.0x</span>
                        <span>1.5x</span>
                        <span>2.0x</span>
                      </div>
                    </div>
                  </div>

                  {/* Microphone Section */}
                  {availableMicrophones && availableMicrophones.length > 0 && (
                    <div className="flex flex-col gap-2 relative">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold opacity-80">{t('microphone')}</h4>
                        <span className="text-[10px] font-extrabold opacity-60 bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                          Device
                        </span>
                      </div>
                      <div className="relative">
                        <button 
                          type="button"
                          className={`w-full p-3 rounded-xl border flex justify-between items-center text-xs transition-all outline-none ${
                            currentTheme.isDark 
                              ? 'border-white/10 bg-slate-950 text-white hover:border-indigo-500/50 hover:bg-slate-900' 
                              : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-500/50 hover:bg-slate-50'
                          }`}
                          onClick={() => setShowMicMenu(!showMicMenu)}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Mic className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="font-bold truncate">
                              {availableMicrophones.find(m => m.deviceId === selectedMic)?.label || `Microphone ${selectedMic?.slice(0, 5) || 'Default'}`}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
                        </button>
                        
                        {showMicMenu && (
                          <div className={`absolute left-0 right-0 mt-1.5 p-1.5 rounded-xl border space-y-1 max-h-[160px] overflow-y-auto z-50 shadow-xl ${
                            currentTheme.isDark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-800'
                          }`}>
                            {availableMicrophones.map(mic => {
                              const isSelected = selectedMic === mic.deviceId;
                              return (
                                <button 
                                  key={mic.deviceId}
                                  type="button"
                                  onClick={() => {
                                    onMicSelect(mic.deviceId);
                                    setShowMicMenu(false);
                                  }}
                                  className={`w-full p-2.5 text-left text-xs rounded-lg flex justify-between items-center transition-colors ${
                                    isSelected 
                                      ? 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold' 
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-900/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <Mic className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                    <span className="truncate font-semibold">{mic.label || `Microphone ${mic.deviceId.slice(0, 5)}`}</span>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account / Google Sign In */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black uppercase tracking-wider opacity-50 font-sans">Account & Security</span>
                <div className={`flex flex-col gap-3 p-4 rounded-2xl border ${
                  currentTheme.isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 ${currentUser ? 'text-green-500' : 'text-slate-400'}`} />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Google Workspace Access</span>
                      <span className="text-[10px] opacity-60">
                        {currentUser ? `Connected as ${currentUser.email}` : 'Sign in to access Drive, Tasks, and Calendar securely'}
                      </span>
                    </div>
                  </div>
                  {currentUser ? (
                    <div className="flex flex-col gap-2 w-full">
                      {!getAccessToken() && (
                        <button
                          onClick={onSignIn}
                          className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          Authorize Google Workspace
                        </button>
                      )}
                      {typeof window !== 'undefined' && window.self !== window.top && !getAccessToken() && (
                        <button
                          onClick={() => window.open(window.location.href, '_blank')}
                          className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                          ↗️ Open in New Tab to Authorize
                        </button>
                      )}
                      <button
                        onClick={onSignOut}
                        className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        onClick={onSignIn}
                        className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Sign In with Google
                      </button>
                      {typeof window !== 'undefined' && window.self !== window.top && (
                        <button
                          onClick={() => window.open(window.location.href, '_blank')}
                          className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                          ↗️ Open in New Tab to Sign In
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black uppercase tracking-wider opacity-50 font-sans">{t('preferences')}</span>
                
                {/* Physical Keyboard Sync Option */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  currentTheme.isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-4 h-4 opacity-70"/>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{t('physicalSync')}</span>
                      <span className="text-[10px] opacity-60">{activeLanguage === 'en' ? 'Sync computer keyboard press' : activeLanguage === 'am' ? 'የኮምፒተር ቁልፎችን ያመሳስሉ' : 'ናይ ኮምፒተር ቁልፍቲ ኣተኣሳስር'}</span>
                    </div>
                  </div>
                  <button 
                    id="toggle-physical-keyboard-sync"
                    onClick={() => setPhysicalKeyboardSync(!physicalKeyboardSync)}
                    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 cursor-pointer ${physicalKeyboardSync ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <motion.div animate={{ x: physicalKeyboardSync ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                {/* Proactive Suggestions */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  currentTheme.isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-4 h-4 opacity-70"/>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Proactive AI</span>
                      <span className="text-[10px] opacity-60">Adaptive insights and suggestions</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setProactiveSuggestions(!proactiveSuggestions)}
                    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 cursor-pointer ${proactiveSuggestions ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <motion.div animate={{ x: proactiveSuggestions ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                {/* Habit Tracking */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  currentTheme.isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 opacity-70"/>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Habit Tracking</span>
                      <span className="text-[10px] opacity-60">Help build and maintain habits</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setHabitTracking(!habitTracking)}
                    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 cursor-pointer ${habitTracking ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <motion.div animate={{ x: habitTracking ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              </div>
              
              {/* Reset Option */}
              <button 
                id="platform-factory-reset"
                onClick={factoryReset} 
                className="mt-4 p-4 rounded-xl border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all text-xs font-bold uppercase flex justify-center items-center gap-2 cursor-pointer group"
              >
                <RotateCcw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"/> {t('factoryReset')}
              </button>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
